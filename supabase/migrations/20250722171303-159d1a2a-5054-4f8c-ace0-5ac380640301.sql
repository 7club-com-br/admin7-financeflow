-- Corrigir as últimas funções restantes com SET search_path
CREATE OR REPLACE FUNCTION public.gerar_lancamentos_recorrencias()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.verificar_status_licenca(p_user_id uuid)
 RETURNS TABLE(status character varying, dias_restantes integer, limite_usuarios integer, limite_lancamentos integer, limite_produtos integer, recursos_liberados jsonb, plano_nome character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.ativar_licenca(p_user_id uuid, p_plano_id uuid, p_chave_licenca character varying DEFAULT NULL::character varying, p_meses_adicionais integer DEFAULT NULL::integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;