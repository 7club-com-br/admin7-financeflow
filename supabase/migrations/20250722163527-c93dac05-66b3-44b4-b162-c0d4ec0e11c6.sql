-- Atualizar as funções existentes apenas com search_path (sem DROP)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;