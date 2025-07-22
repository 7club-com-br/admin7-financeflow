-- Criação de um job cron para atualizar tokens Kommo a cada 12 horas
SELECT cron.schedule(
  'kommo-refresh-tokens-job',  -- Nome do job
  '0 */12 * * *',             -- Expressão cron: a cada 12 horas (às 00:00 e 12:00)
  $$
  SELECT
    net.http_post(
      url:='https://mitevjfisvxnhvzyxded.supabase.co/functions/v1/kommo-refresh-tokens',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUPABASE_ANON_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
