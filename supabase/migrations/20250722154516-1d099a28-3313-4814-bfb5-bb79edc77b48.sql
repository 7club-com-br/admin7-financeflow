-- Add id_kommo and subdominio columns to users table
ALTER TABLE public.users 
ADD COLUMN id_kommo VARCHAR(100),
ADD COLUMN subdominio VARCHAR(100);