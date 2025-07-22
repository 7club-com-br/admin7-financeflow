-- Criar tabela de tipos de produtos
CREATE TABLE public.tipos_produtos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela tipos_produtos
ALTER TABLE public.tipos_produtos ENABLE ROW LEVEL SECURITY;

-- Política RLS para tipos_produtos
CREATE POLICY "Users can manage own product types" ON public.tipos_produtos
    FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de cotações
CREATE TABLE public.cotacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    moeda VARCHAR(10) NOT NULL,
    valor_brl NUMERIC(10, 4) NOT NULL,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
    fonte VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índice único para evitar duplicatas de cotação por moeda
CREATE UNIQUE INDEX idx_cotacoes_moeda_unique ON public.cotacoes(moeda);

-- Inserir cotação inicial do dólar
INSERT INTO public.cotacoes (moeda, valor_brl, fonte) 
VALUES ('USD', 5.50, 'inicial') 
ON CONFLICT (moeda) DO NOTHING;

-- Criar tabela de produtos
CREATE TABLE public.produtos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tipo_produto_id UUID NOT NULL REFERENCES public.tipos_produtos(id) ON DELETE RESTRICT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor_brl NUMERIC(10, 2),
    valor_usd NUMERIC(10, 2),
    tipo_preco VARCHAR(50) DEFAULT 'fixo', -- fixo, kommo
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela produtos
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Política RLS para produtos
CREATE POLICY "Users can manage own products" ON public.produtos
    FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de licenças (atualizada)
CREATE TABLE public.licencas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tipo_plano VARCHAR(50) NOT NULL DEFAULT 'trial', -- trial, basic, premium, enterprise
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    ativa BOOLEAN DEFAULT true,
    limite_usuarios INTEGER DEFAULT 1,
    limite_lancamentos INTEGER DEFAULT 100,
    limite_produtos INTEGER DEFAULT 10,
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

-- Criar função para atualizar preços dos produtos tipo Kommo
CREATE OR REPLACE FUNCTION public.atualizar_precos_kommo()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cotacao_usd NUMERIC(10, 4);
BEGIN
    -- Buscar cotação atual do dólar
    SELECT valor_brl INTO cotacao_usd 
    FROM public.cotacoes 
    WHERE moeda = 'USD' 
    ORDER BY data_atualizacao DESC 
    LIMIT 1;
    
    -- Atualizar produtos tipo Kommo
    IF cotacao_usd IS NOT NULL THEN
        UPDATE public.produtos 
        SET valor_brl = valor_usd * cotacao_usd,
            updated_at = now()
        WHERE tipo_preco = 'kommo' AND valor_usd IS NOT NULL;
    END IF;
END;
$$;

-- Criar triggers para updated_at
CREATE TRIGGER update_tipos_produtos_updated_at BEFORE UPDATE ON public.tipos_produtos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licencas_updated_at BEFORE UPDATE ON public.licencas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_produtos_user_id ON public.produtos(user_id);
CREATE INDEX idx_produtos_tipo_produto_id ON public.produtos(tipo_produto_id);
CREATE INDEX idx_produtos_tipo_preco ON public.produtos(tipo_preco);
CREATE INDEX idx_tipos_produtos_user_id ON public.tipos_produtos(user_id);
CREATE INDEX idx_licencas_user_id ON public.licencas(user_id);
CREATE INDEX idx_cotacoes_moeda ON public.cotacoes(moeda);
CREATE INDEX idx_cotacoes_data_atualizacao ON public.cotacoes(data_atualizacao);

-- Inserir licença enterprise para o usuário admin
INSERT INTO public.licencas (user_id, tipo_plano, data_vencimento, limite_usuarios, limite_lancamentos, limite_produtos, recursos_liberados)
SELECT 
    id,
    'enterprise',
    CURRENT_DATE + INTERVAL '365 days',
    999,
    999999,
    999,
    '{"todos_recursos": true, "relatorios_avancados": true, "integracao_kommo": true, "multiplos_usuarios": true, "produtos_ilimitados": true}'
FROM public.users 
WHERE email = 'valdeir@7club.com.br'
ON CONFLICT DO NOTHING;