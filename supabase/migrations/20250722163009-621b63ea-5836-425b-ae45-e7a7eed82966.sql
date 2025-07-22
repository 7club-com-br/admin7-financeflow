-- Habilitar RLS na tabela de cotações (mesmo sendo pública, precisa ter RLS para passar na auditoria)
ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública das cotações
CREATE POLICY "Anyone can view exchange rates" ON public.cotacoes
    FOR SELECT USING (true);

-- Política para inserção/atualização apenas via edge functions ou admins
CREATE POLICY "Service role can manage exchange rates" ON public.cotacoes
    FOR ALL USING (
        current_setting('role') = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Corrigir search_path nas funções existentes
DROP FUNCTION IF EXISTS public.atualizar_precos_kommo();
CREATE OR REPLACE FUNCTION public.atualizar_precos_kommo()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cotacao_usd NUMERIC(10, 4);
BEGIN
    -- Buscar cotação atual do dólar
    SELECT valor_brl INTO cotacao_usd 
    FROM cotacoes 
    WHERE moeda = 'USD' 
    ORDER BY data_atualizacao DESC 
    LIMIT 1;
    
    -- Atualizar produtos tipo Kommo
    IF cotacao_usd IS NOT NULL THEN
        UPDATE produtos 
        SET valor_brl = valor_usd * cotacao_usd,
            updated_at = now()
        WHERE tipo_preco = 'kommo' AND valor_usd IS NOT NULL;
    END IF;
END;
$$;

-- Corrigir outras funções também
DROP FUNCTION IF EXISTS public.gerar_lancamentos_recorrencias();
CREATE OR REPLACE FUNCTION public.gerar_lancamentos_recorrencias()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rec RECORD;
    nova_data DATE;
    contador INTEGER;
BEGIN
    -- Buscar recorrências ativas que precisam gerar novos lançamentos
    FOR rec IN 
        SELECT * FROM financeiro_recorrencias 
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
                SELECT 1 FROM financeiro_lancamentos 
                WHERE recorrencia_id = rec.id 
                AND data_vencimento = nova_data
            ) THEN
                -- Criar o novo lançamento
                INSERT INTO financeiro_lancamentos (
                    user_id, tipo, categoria_id, conta_id, centro_custo_id, 
                    fornecedor_id, descricao, valor, data_vencimento, 
                    recorrencia_id, status
                ) VALUES (
                    rec.user_id, rec.tipo, rec.categoria_id, rec.conta_id, 
                    rec.centro_custo_id, rec.fornecedor_id, rec.descricao, 
                    rec.valor, nova_data, rec.id, 'pendente'
                );
                
                -- Atualizar contador de gerações
                UPDATE financeiro_recorrencias 
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
        UPDATE financeiro_recorrencias 
        SET proxima_geracao = nova_data
        WHERE id = rec.id;
    END LOOP;
END;
$$;

DROP FUNCTION IF EXISTS public.calcular_estatisticas_financeiras(uuid, date, date);
CREATE OR REPLACE FUNCTION public.calcular_estatisticas_financeiras(p_user_id uuid, p_data_inicio date DEFAULT NULL::date, p_data_fim date DEFAULT NULL::date)
RETURNS TABLE(total_receitas numeric, total_despesas numeric, saldo_periodo numeric, receitas_pagas numeric, despesas_pagas numeric, receitas_pendentes numeric, despesas_pendentes numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    FROM financeiro_lancamentos
    WHERE user_id = p_user_id
    AND data_vencimento BETWEEN p_data_inicio AND p_data_fim;
END;
$$;