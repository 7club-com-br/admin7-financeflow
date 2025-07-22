
-- Criar tabela de planos de licença
CREATE TABLE public.planos_licenca (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- trial, basic, premium, enterprise
    duracao_meses INTEGER NOT NULL DEFAULT 1,
    valor_brl NUMERIC(10, 2),
    valor_usd NUMERIC(10, 2),
    periodo_trial_dias INTEGER DEFAULT 0,
    limite_usuarios INTEGER DEFAULT 1,
    limite_lancamentos INTEGER DEFAULT 100,
    limite_produtos INTEGER DEFAULT 10,
    recursos_liberados JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir planos padrão
INSERT INTO public.planos_licenca (nome, tipo, duracao_meses, valor_brl, valor_usd, periodo_trial_dias, limite_usuarios, limite_lancamentos, limite_produtos, recursos_liberados) VALUES
('Trial Gratuito', 'trial', 0, 0.00, 0.00, 15, 1, 50, 5, '{"relatorios_basicos": true}'),
('Básico 6 Meses', 'basic', 6, 97.00, 20.00, 0, 3, 1000, 20, '{"relatorios_basicos": true, "recorrencias": true}'),
('Básico 12 Meses', 'basic', 12, 197.00, 40.00, 0, 3, 1000, 20, '{"relatorios_basicos": true, "recorrencias": true}'),
('Premium 6 Meses', 'premium', 6, 197.00, 40.00, 0, 10, 10000, 100, '{"relatorios_avancados": true, "recorrencias": true, "multiplas_contas": true, "centros_custo": true}'),
('Premium 12 Meses', 'premium', 12, 397.00, 80.00, 0, 10, 10000, 100, '{"relatorios_avancados": true, "recorrencias": true, "multiplas_contas": true, "centros_custo": true}'),
('Enterprise', 'enterprise', 12, 997.00, 200.00, 0, 999, 999999, 999, '{"todos_recursos": true, "relatorios_avancados": true, "integracao_kommo": true, "multiplos_usuarios": true, "api_acesso": true}');

-- Criar tabela de histórico de licenças
CREATE TABLE public.historico_licencas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    licenca_id UUID REFERENCES public.licencas(id) ON DELETE SET NULL,
    plano_id UUID REFERENCES public.planos_licenca(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL, -- ativacao, renovacao, upgrade, downgrade, expiracao, cancelamento
    data_anterior DATE,
    data_nova DATE,
    valor_pago NUMERIC(10, 2),
    metodo_pagamento VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Atualizar tabela de licenças com novos campos
ALTER TABLE public.licencas 
ADD COLUMN IF NOT EXISTS plano_id UUID REFERENCES public.planos_licenca(id),
ADD COLUMN IF NOT EXISTS chave_licenca VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ativa', -- ativa, expirada, suspensa, cancelada
ADD COLUMN IF NOT EXISTS data_ativacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_ultimo_uso TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tentativas_uso INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bloqueada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS motivo_bloqueio TEXT;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.planos_licenca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_licencas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para planos de licença (todos podem ver)
CREATE POLICY "Anyone can view license plans" ON public.planos_licenca
    FOR SELECT USING (ativo = true);

-- Políticas RLS para histórico de licenças
CREATE POLICY "Users can view own license history" ON public.historico_licencas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage license history" ON public.historico_licencas
    FOR ALL USING (true);

-- Criar função para verificar status da licença
CREATE OR REPLACE FUNCTION public.verificar_status_licenca(p_user_id UUID)
RETURNS TABLE(
    status VARCHAR,
    dias_restantes INTEGER,
    limite_usuarios INTEGER,
    limite_lancamentos INTEGER,
    limite_produtos INTEGER,
    recursos_liberados JSONB,
    plano_nome VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    licenca_atual RECORD;
    plano_atual RECORD;
BEGIN
    -- Buscar licença ativa do usuário
    SELECT l.*, p.nome as plano_nome, p.limite_usuarios, p.limite_lancamentos, 
           p.limite_produtos, p.recursos_liberados
    INTO licenca_atual
    FROM public.licencas l
    LEFT JOIN public.planos_licenca p ON l.plano_id = p.id
    WHERE l.user_id = p_user_id 
    AND l.ativa = true
    ORDER BY l.data_vencimento DESC
    LIMIT 1;
    
    IF licenca_atual IS NULL THEN
        -- Usuário sem licença - criar trial automático
        INSERT INTO public.licencas (user_id, plano_id, tipo_plano, data_vencimento, status, data_ativacao)
        SELECT p_user_id, id, 'trial', CURRENT_DATE + INTERVAL '15 days', 'ativa', now()
        FROM public.planos_licenca 
        WHERE tipo = 'trial' AND ativo = true
        LIMIT 1;
        
        -- Buscar novamente
        SELECT l.*, p.nome as plano_nome, p.limite_usuarios, p.limite_lancamentos, 
               p.limite_produtos, p.recursos_liberados
        INTO licenca_atual
        FROM public.licencas l
        LEFT JOIN public.planos_licenca p ON l.plano_id = p.id
        WHERE l.user_id = p_user_id 
        AND l.ativa = true
        ORDER BY l.data_vencimento DESC
        LIMIT 1;
    END IF;
    
    -- Verificar se a licença expirou
    IF licenca_atual.data_vencimento < CURRENT_DATE THEN
        -- Atualizar status para expirada
        UPDATE public.licencas 
        SET status = 'expirada', ativa = false
        WHERE id = licenca_atual.id;
        
        RETURN QUERY SELECT 
            'expirada'::VARCHAR,
            0::INTEGER,
            0::INTEGER,
            0::INTEGER,
            0::INTEGER,
            '{}'::JSONB,
            'Expirada'::VARCHAR;
    ELSE
        -- Retornar informações da licença ativa
        RETURN QUERY SELECT 
            licenca_atual.status::VARCHAR,
            (licenca_atual.data_vencimento - CURRENT_DATE)::INTEGER,
            licenca_atual.limite_usuarios::INTEGER,
            licenca_atual.limite_lancamentos::INTEGER,
            licenca_atual.limite_produtos::INTEGER,
            licenca_atual.recursos_liberados::JSONB,
            licenca_atual.plano_nome::VARCHAR;
    END IF;
END;
$$;

-- Criar função para ativar licença
CREATE OR REPLACE FUNCTION public.ativar_licenca(
    p_user_id UUID,
    p_plano_id UUID,
    p_chave_licenca VARCHAR DEFAULT NULL,
    p_meses_adicionais INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    plano_info RECORD;
    nova_data_vencimento DATE;
    licenca_existente RECORD;
BEGIN
    -- Buscar informações do plano
    SELECT * INTO plano_info FROM public.planos_licenca WHERE id = p_plano_id AND ativo = true;
    
    IF plano_info IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calcular nova data de vencimento
    IF p_meses_adicionais IS NOT NULL THEN
        nova_data_vencimento := CURRENT_DATE + (p_meses_adicionais || ' months')::INTERVAL;
    ELSE
        nova_data_vencimento := CURRENT_DATE + (plano_info.duracao_meses || ' months')::INTERVAL;
    END IF;
    
    -- Verificar se já existe licença ativa
    SELECT * INTO licenca_existente 
    FROM public.licencas 
    WHERE user_id = p_user_id AND ativa = true;
    
    IF licenca_existente IS NOT NULL THEN
        -- Atualizar licença existente
        UPDATE public.licencas 
        SET 
            plano_id = p_plano_id,
            tipo_plano = plano_info.tipo,
            data_vencimento = nova_data_vencimento,
            limite_usuarios = plano_info.limite_usuarios,
            limite_lancamentos = plano_info.limite_lancamentos,
            limite_produtos = plano_info.limite_produtos,
            recursos_liberados = plano_info.recursos_liberados,
            chave_licenca = COALESCE(p_chave_licenca, chave_licenca),
            status = 'ativa',
            data_ativacao = now(),
            updated_at = now()
        WHERE id = licenca_existente.id;
        
        -- Registrar no histórico
        INSERT INTO public.historico_licencas (user_id, licenca_id, plano_id, acao, data_nova, observacoes)
        VALUES (p_user_id, licenca_existente.id, p_plano_id, 'upgrade', nova_data_vencimento, 'Licença atualizada');
    ELSE
        -- Criar nova licença
        INSERT INTO public.licencas (
            user_id, plano_id, tipo_plano, data_vencimento, 
            limite_usuarios, limite_lancamentos, limite_produtos, 
            recursos_liberados, chave_licenca, status, data_ativacao
        ) VALUES (
            p_user_id, p_plano_id, plano_info.tipo, nova_data_vencimento,
            plano_info.limite_usuarios, plano_info.limite_lancamentos, plano_info.limite_produtos,
            plano_info.recursos_liberados, p_chave_licenca, 'ativa', now()
        );
        
        -- Registrar no histórico
        INSERT INTO public.historico_licencas (user_id, plano_id, acao, data_nova, observacoes)
        VALUES (p_user_id, p_plano_id, 'ativacao', nova_data_vencimento, 'Nova licença ativada');
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Criar triggers para updated_at
CREATE TRIGGER update_planos_licenca_updated_at BEFORE UPDATE ON public.planos_licenca
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_planos_licenca_tipo ON public.planos_licenca(tipo);
CREATE INDEX idx_planos_licenca_ativo ON public.planos_licenca(ativo);
CREATE INDEX idx_historico_licencas_user_id ON public.historico_licencas(user_id);
CREATE INDEX idx_licencas_status ON public.licencas(status);
CREATE INDEX idx_licencas_data_vencimento ON public.licencas(data_vencimento);
CREATE INDEX idx_licencas_chave_licenca ON public.licencas(chave_licenca);
