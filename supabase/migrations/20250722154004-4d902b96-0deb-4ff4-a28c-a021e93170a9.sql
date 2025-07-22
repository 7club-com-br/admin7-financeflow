-- Criar tabela de licenças
CREATE TABLE public.licencas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tipo_plano VARCHAR(50) NOT NULL DEFAULT 'trial', -- trial, basic, premium, enterprise
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    ativa BOOLEAN DEFAULT true,
    limite_usuarios INTEGER DEFAULT 1,
    limite_lancamentos INTEGER DEFAULT 100,
    recursos_liberados JSONB DEFAULT '{}',
    chave_ativacao VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela licenças
ALTER TABLE public.licencas ENABLE ROW LEVEL SECURITY;

-- Política RLS para licenças
CREATE POLICY "Users can view own license" ON public.licencas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own license" ON public.licencas
    FOR UPDATE USING (auth.uid() = user_id);

-- Criar tabela de logs de atividades
CREATE TABLE public.logs_atividades (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nos logs
ALTER TABLE public.logs_atividades ENABLE ROW LEVEL SECURITY;

-- Política RLS para logs (apenas admins podem ver todos os logs)
CREATE POLICY "Users can view own activity logs" ON public.logs_atividades
    FOR SELECT USING (auth.uid() = user_id);

-- Criar tabela de configurações globais
CREATE TABLE public.configuracoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'text', -- text, number, boolean, json
    categoria VARCHAR(50) DEFAULT 'geral',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor, descricao, tipo, categoria) VALUES
('nome_empresa', '"Admin7"', 'Nome da empresa/sistema', 'text', 'geral'),
('moeda_padrao', '"BRL"', 'Moeda padrão do sistema', 'text', 'financeiro'),
('fuso_horario', '"America/Sao_Paulo"', 'Fuso horário padrão', 'text', 'geral'),
('formato_data', '"dd/MM/yyyy"', 'Formato de exibição de datas', 'text', 'geral'),
('decimal_places', '2', 'Casas decimais para valores monetários', 'number', 'financeiro');

-- Criar tabela de notificações
CREATE TABLE public.notificacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
    lida BOOLEAN DEFAULT false,
    acao_url VARCHAR(500),
    acao_label VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas notificações
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Política RLS para notificações
CREATE POLICY "Users can manage own notifications" ON public.notificacoes
    FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de integração com Kommo
CREATE TABLE public.kommo_integracao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    subdomain VARCHAR(100) NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    ativa BOOLEAN DEFAULT false,
    webhook_secret VARCHAR(255),
    configuracoes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na integração Kommo
ALTER TABLE public.kommo_integracao ENABLE ROW LEVEL SECURITY;

-- Política RLS para Kommo
CREATE POLICY "Users can manage own kommo integration" ON public.kommo_integracao
    FOR ALL USING (auth.uid() = user_id);

-- Criar triggers para updated_at
CREATE TRIGGER update_licencas_updated_at BEFORE UPDATE ON public.licencas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kommo_integracao_updated_at BEFORE UPDATE ON public.kommo_integracao
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_logs_atividades_user_id ON public.logs_atividades(user_id);
CREATE INDEX idx_logs_atividades_created_at ON public.logs_atividades(created_at);
CREATE INDEX idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX idx_configuracoes_chave ON public.configuracoes(chave);

-- Inserir licença trial para o usuário admin existente
INSERT INTO public.licencas (user_id, tipo_plano, data_vencimento, limite_usuarios, limite_lancamentos, recursos_liberados)
SELECT 
    id,
    'enterprise',
    CURRENT_DATE + INTERVAL '365 days',
    999,
    999999,
    '{"todos_recursos": true, "relatorios_avancados": true, "integracao_kommo": true, "multiplos_usuarios": true}'
FROM public.users 
WHERE email = 'valdeir@7club.com.br'
ON CONFLICT DO NOTHING;