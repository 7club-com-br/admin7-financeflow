-- Criar a tabela users
CREATE TABLE public.users (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'client',
    status VARCHAR(20) DEFAULT 'active',
    id_kommo VARCHAR(100),
    subdominio VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_sign_in TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Criar política RLS para que usuários possam atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir o usuário admin existente
INSERT INTO public.users (id, email, name, role, status, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', 'Admin'),
    'admin',
    'active',
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'valdeir@7club.com.br'
ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, users.name),
    role = 'admin',
    updated_at = now();