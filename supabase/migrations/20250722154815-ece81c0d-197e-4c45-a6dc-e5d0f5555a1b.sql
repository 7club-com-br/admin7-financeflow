-- Criar triggers para saldo automático das contas
CREATE TRIGGER atualizar_saldo_lancamento_insert 
    AFTER INSERT ON public.financeiro_lancamentos
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_saldo_conta();

CREATE TRIGGER atualizar_saldo_lancamento_update 
    AFTER UPDATE ON public.financeiro_lancamentos
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_saldo_conta();

CREATE TRIGGER atualizar_saldo_lancamento_delete 
    AFTER DELETE ON public.financeiro_lancamentos
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_saldo_conta();

-- Criar função para gerar lançamentos recorrentes
CREATE OR REPLACE FUNCTION public.gerar_lancamentos_recorrencias()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    rec RECORD;
    nova_data DATE;
    contador INTEGER;
BEGIN
    -- Buscar recorrências ativas que precisam gerar novos lançamentos
    FOR rec IN 
        SELECT * FROM public.financeiro_recorrencias 
        WHERE ativa = true 
        AND (proxima_geracao IS NULL OR proxima_geracao <= CURRENT_DATE)
        AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
        AND (limite_geracoes IS NULL OR total_gerado < limite_geracoes)
    LOOP
        -- Definir a data do próximo lançamento
        nova_data := COALESCE(rec.proxima_geracao, rec.data_inicio);
        contador := 0;
        
        -- Gerar lançamentos até a data atual (máximo 12 para evitar loops infinitos)
        WHILE nova_data <= CURRENT_DATE AND contador < 12 LOOP
            -- Verificar se já existe um lançamento para essa data
            IF NOT EXISTS (
                SELECT 1 FROM public.financeiro_lancamentos 
                WHERE recorrencia_id = rec.id 
                AND data_vencimento = nova_data
            ) THEN
                -- Criar o novo lançamento
                INSERT INTO public.financeiro_lancamentos (
                    user_id, tipo, categoria_id, conta_id, centro_custo_id, 
                    fornecedor_id, descricao, valor, data_vencimento, 
                    recorrencia_id, status
                ) VALUES (
                    rec.user_id, rec.tipo, rec.categoria_id, rec.conta_id, 
                    rec.centro_custo_id, rec.fornecedor_id, rec.descricao, 
                    rec.valor, nova_data, rec.id, 'pendente'
                );
                
                -- Atualizar contador de gerações
                UPDATE public.financeiro_recorrencias 
                SET total_gerado = total_gerado + 1
                WHERE id = rec.id;
            END IF;
            
            -- Calcular próxima data baseada na frequência
            CASE rec.frequencia
                WHEN 'diario' THEN
                    nova_data := nova_data + INTERVAL '1 day';
                WHEN 'semanal' THEN
                    nova_data := nova_data + INTERVAL '1 week';
                WHEN 'mensal' THEN
                    nova_data := nova_data + INTERVAL '1 month';
                WHEN 'trimestral' THEN
                    nova_data := nova_data + INTERVAL '3 months';
                WHEN 'semestral' THEN
                    nova_data := nova_data + INTERVAL '6 months';
                WHEN 'anual' THEN
                    nova_data := nova_data + INTERVAL '1 year';
                ELSE
                    nova_data := nova_data + INTERVAL '1 month'; -- default
            END CASE;
            
            contador := contador + 1;
        END LOOP;
        
        -- Atualizar a próxima data de geração
        UPDATE public.financeiro_recorrencias 
        SET proxima_geracao = nova_data
        WHERE id = rec.id;
    END LOOP;
END;
$$;

-- Criar função para calcular estatísticas financeiras
CREATE OR REPLACE FUNCTION public.calcular_estatisticas_financeiras(
    p_user_id UUID,
    p_data_inicio DATE DEFAULT NULL,
    p_data_fim DATE DEFAULT NULL
)
RETURNS TABLE(
    total_receitas NUMERIC,
    total_despesas NUMERIC,
    saldo_periodo NUMERIC,
    receitas_pagas NUMERIC,
    despesas_pagas NUMERIC,
    receitas_pendentes NUMERIC,
    despesas_pendentes NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Definir datas padrão se não informadas
    p_data_inicio := COALESCE(p_data_inicio, DATE_TRUNC('month', CURRENT_DATE));
    p_data_fim := COALESCE(p_data_fim, CURRENT_DATE);
    
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo_periodo,
        COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE 0 END), 0) as receitas_pagas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor ELSE 0 END), 0) as despesas_pagas,
        COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pendente' THEN valor ELSE 0 END), 0) as receitas_pendentes,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pendente' THEN valor ELSE 0 END), 0) as despesas_pendentes
    FROM public.financeiro_lancamentos
    WHERE user_id = p_user_id
    AND data_vencimento BETWEEN p_data_inicio AND p_data_fim;
END;
$$;

-- Inserir categorias padrão
INSERT INTO public.financeiro_categorias (user_id, nome, tipo, descricao, cor) 
SELECT 
    u.id,
    categoria.nome,
    categoria.tipo::tipo_lancamento,
    categoria.descricao,
    categoria.cor
FROM public.users u
CROSS JOIN (VALUES
    ('Vendas', 'receita', 'Receitas de vendas de produtos/serviços', '#10b981'),
    ('Serviços', 'receita', 'Receitas de prestação de serviços', '#059669'),
    ('Investimentos', 'receita', 'Rendimentos de investimentos', '#047857'),
    ('Outras Receitas', 'receita', 'Outras fontes de receita', '#065f46'),
    ('Salários', 'despesa', 'Pagamento de salários e benefícios', '#ef4444'),
    ('Fornecedores', 'despesa', 'Pagamentos a fornecedores', '#dc2626'),
    ('Marketing', 'despesa', 'Gastos com marketing e publicidade', '#b91c1c'),
    ('Administrativo', 'despesa', 'Despesas administrativas gerais', '#991b1b'),
    ('Impostos', 'despesa', 'Pagamento de impostos e taxas', '#7f1d1d'),
    ('Outras Despesas', 'despesa', 'Outras despesas diversas', '#450a0a')
) as categoria(nome, tipo, descricao, cor)
ON CONFLICT DO NOTHING;

-- Inserir contas financeiras padrão
INSERT INTO public.contas_financeiras (user_id, nome, tipo, saldo_inicial) 
SELECT 
    u.id,
    conta.nome,
    conta.tipo,
    0.00
FROM public.users u
CROSS JOIN (VALUES
    ('Caixa Geral', 'caixa'),
    ('Conta Corrente Principal', 'conta_bancaria'),
    ('Conta Poupança', 'conta_bancaria')
) as conta(nome, tipo)
ON CONFLICT DO NOTHING;

-- Inserir centros de custo padrão
INSERT INTO public.centros_custo (user_id, nome, descricao, codigo) 
SELECT 
    u.id,
    centro.nome,
    centro.descricao,
    centro.codigo
FROM public.users u
CROSS JOIN (VALUES
    ('Geral', 'Centro de custo geral', 'CC001'),
    ('Vendas', 'Departamento de vendas', 'CC002'),
    ('Administrativo', 'Setor administrativo', 'CC003'),
    ('Marketing', 'Departamento de marketing', 'CC004')
) as centro(nome, descricao, codigo)
ON CONFLICT DO NOTHING;