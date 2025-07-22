-- Create financial system database schema for Admin7

-- Create enum for transaction types
CREATE TYPE public.tipo_lancamento AS ENUM ('receita', 'despesa');

-- Create enum for transaction status
CREATE TYPE public.status_lancamento AS ENUM ('pendente', 'pago', 'cancelado', 'atrasado');

-- Create enum for recurrence frequency
CREATE TYPE public.frequencia_recorrencia AS ENUM ('diario', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual');

-- Create table for financial categories (hierarchical)
CREATE TABLE public.financeiro_categorias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo public.tipo_lancamento NOT NULL,
    categoria_pai_id UUID REFERENCES public.financeiro_categorias(id) ON DELETE SET NULL,
    cor VARCHAR(7) DEFAULT '#1e40af', -- Hex color for visual organization
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT categoria_nome_unico_por_usuario UNIQUE(user_id, nome, tipo)
);

-- Create table for financial accounts (bank accounts, cash, digital wallets)
CREATE TABLE public.contas_financeiras (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'conta_bancaria', -- conta_bancaria, caixa, carteira_digital, gateway
    banco VARCHAR(100),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    saldo_inicial DECIMAL(15,2) DEFAULT 0.00,
    saldo_atual DECIMAL(15,2) DEFAULT 0.00,
    ativa BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT conta_nome_unico_por_usuario UNIQUE(user_id, nome)
);

-- Create table for cost centers
CREATE TABLE public.centros_custo (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    codigo VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT centro_custo_nome_unico_por_usuario UNIQUE(user_id, nome),
    CONSTRAINT centro_custo_codigo_unico_por_usuario UNIQUE(user_id, codigo)
);

-- Create table for suppliers/vendors
CREATE TABLE public.fornecedores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    tipo_documento VARCHAR(20) DEFAULT 'cpf', -- cpf, cnpj
    documento VARCHAR(20),
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT fornecedor_nome_unico_por_usuario UNIQUE(user_id, nome)
);

-- Create main financial transactions table
CREATE TABLE public.financeiro_lancamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo public.tipo_lancamento NOT NULL,
    categoria_id UUID NOT NULL REFERENCES public.financeiro_categorias(id),
    conta_id UUID NOT NULL REFERENCES public.contas_financeiras(id),
    centro_custo_id UUID REFERENCES public.centros_custo(id),
    fornecedor_id UUID REFERENCES public.fornecedores(id),
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status public.status_lancamento DEFAULT 'pendente',
    observacoes TEXT,
    numero_documento VARCHAR(50),
    tags TEXT[], -- Array of tags for flexible categorization
    recorrencia_id UUID, -- Will reference financeiro_recorrencias
    anexos JSONB, -- Store file attachments metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CHECK (valor > 0),
    CHECK (data_pagamento IS NULL OR data_pagamento >= data_vencimento OR status = 'cancelado')
);

-- Create recurrences table
CREATE TABLE public.financeiro_recorrencias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo public.tipo_lancamento NOT NULL,
    categoria_id UUID NOT NULL REFERENCES public.financeiro_categorias(id),
    conta_id UUID NOT NULL REFERENCES public.contas_financeiras(id),
    centro_custo_id UUID REFERENCES public.centros_custo(id),
    fornecedor_id UUID REFERENCES public.fornecedores(id),
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    frequencia public.frequencia_recorrencia NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    ativa BOOLEAN DEFAULT true,
    proxima_geracao DATE,
    total_gerado INTEGER DEFAULT 0,
    limite_geracoes INTEGER, -- Optional limit on number of generated transactions
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CHECK (valor > 0),
    CHECK (data_fim IS NULL OR data_fim > data_inicio),
    CHECK (limite_geracoes IS NULL OR limite_geracoes > 0)
);

-- Add foreign key for recurrence in lancamentos table
ALTER TABLE public.financeiro_lancamentos 
ADD CONSTRAINT fk_lancamentos_recorrencia 
FOREIGN KEY (recorrencia_id) REFERENCES public.financeiro_recorrencias(id) ON DELETE SET NULL;

-- Enable Row Level Security on all tables
ALTER TABLE public.financeiro_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_recorrencias ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financeiro_categorias
CREATE POLICY "Users can manage their own categories" ON public.financeiro_categorias
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for contas_financeiras
CREATE POLICY "Users can manage their own accounts" ON public.contas_financeiras
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for centros_custo
CREATE POLICY "Users can manage their own cost centers" ON public.centros_custo
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for fornecedores
CREATE POLICY "Users can manage their own suppliers" ON public.fornecedores
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for financeiro_lancamentos
CREATE POLICY "Users can manage their own transactions" ON public.financeiro_lancamentos
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for financeiro_recorrencias
CREATE POLICY "Users can manage their own recurrences" ON public.financeiro_recorrencias
FOR ALL USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.financeiro_categorias
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_updated_at BEFORE UPDATE ON public.contas_financeiras
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_centros_custo_updated_at BEFORE UPDATE ON public.centros_custo
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lancamentos_updated_at BEFORE UPDATE ON public.financeiro_lancamentos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recorrencias_updated_at BEFORE UPDATE ON public.financeiro_recorrencias
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update account balance
CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'pago' THEN
            IF NEW.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + NEW.valor 
                WHERE id = NEW.conta_id;
            ELSIF NEW.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - NEW.valor 
                WHERE id = NEW.conta_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Revert old transaction if it was paid
        IF OLD.status = 'pago' THEN
            IF OLD.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - OLD.valor 
                WHERE id = OLD.conta_id;
            ELSIF OLD.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + OLD.valor 
                WHERE id = OLD.conta_id;
            END IF;
        END IF;
        
        -- Apply new transaction if it's paid
        IF NEW.status = 'pago' THEN
            IF NEW.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + NEW.valor 
                WHERE id = NEW.conta_id;
            ELSIF NEW.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - NEW.valor 
                WHERE id = NEW.conta_id;
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'pago' THEN
            IF OLD.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - OLD.valor 
                WHERE id = OLD.conta_id;
            ELSIF OLD.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + OLD.valor 
                WHERE id = OLD.conta_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language plpgsql SECURITY DEFINER;

-- Create trigger to automatically update account balance
CREATE TRIGGER trigger_atualizar_saldo_conta
    AFTER INSERT OR UPDATE OR DELETE ON public.financeiro_lancamentos
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_saldo_conta();

-- Create indexes for better performance
CREATE INDEX idx_lancamentos_user_id ON public.financeiro_lancamentos(user_id);
CREATE INDEX idx_lancamentos_data_vencimento ON public.financeiro_lancamentos(data_vencimento);
CREATE INDEX idx_lancamentos_status ON public.financeiro_lancamentos(status);
CREATE INDEX idx_lancamentos_categoria_id ON public.financeiro_lancamentos(categoria_id);
CREATE INDEX idx_lancamentos_conta_id ON public.financeiro_lancamentos(conta_id);

CREATE INDEX idx_categorias_user_id ON public.financeiro_categorias(user_id);
CREATE INDEX idx_categorias_tipo ON public.financeiro_categorias(tipo);

CREATE INDEX idx_contas_user_id ON public.contas_financeiras(user_id);
CREATE INDEX idx_contas_ativa ON public.contas_financeiras(ativa);

-- Insert some default categories for new users (this would typically be done via a trigger or application logic)
-- We'll create a function that can be called to setup default data for new users