-- Criar cron job para atualizar cotações a cada 30 minutos
-- Primeiro habilitar a extensão pg_cron se não estiver ativa
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar o cron job para atualizar cotações
SELECT cron.schedule(
  'update-exchange-rates-job',
  '*/30 * * * *', -- A cada 30 minutos
  $$
  SELECT
    net.http_post(
        url:='https://mitevjfisvxnhvzyxded.supabase.co/functions/v1/update-exchange-rates',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdGV2amZpc3Z4bmh2enl4ZGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTgxMDQsImV4cCI6MjA2NjEzNDEwNH0.fPBDIK41hv5df7mBPd3okahn7JHlJuq-IdCTzhSFFyI"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);