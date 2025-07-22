-- Corrigir as funções restantes com SET search_path
CREATE OR REPLACE FUNCTION public.calcular_estatisticas_financeiras(p_user_id uuid, p_data_inicio date DEFAULT NULL::date, p_data_fim date DEFAULT NULL::date)
 RETURNS TABLE(total_receitas numeric, total_despesas numeric, saldo_periodo numeric, receitas_pagas numeric, despesas_pagas numeric, receitas_pendentes numeric, despesas_pendentes numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Verificar se o usuário já existe na tabela users
    IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id) THEN
        -- Atualizar o usuário existente
        UPDATE users 
        SET 
            email = NEW.email,
            name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
            role = COALESCE(NEW.raw_user_meta_data->>'role', users.role),
            updated_at = NOW()
        WHERE id = NEW.id;
    ELSE
        -- Inserir novo usuário
        INSERT INTO users (
            id, 
            email, 
            name, 
            role, 
            status, 
            created_at, 
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
            COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
            'active',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$function$;