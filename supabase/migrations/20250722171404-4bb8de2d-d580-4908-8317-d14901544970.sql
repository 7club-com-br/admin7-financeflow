-- Corrigir a última função restante
CREATE OR REPLACE FUNCTION public.atualizar_precos_kommo()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;