-- Fix security warnings by setting search_path for functions
-- This addresses the WARN level security issues found by the linter

-- Update the update_updated_at_column function with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update the atualizar_saldo_conta function with search_path  
CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'pago' THEN
            IF NEW.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + NEW.valor 
                WHERE id = NEW.conta_id;
            ELSIF NEW.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - NEW.valor 
                WHERE id = NEW.conta_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Revert old transaction if it was paid
        IF OLD.status = 'pago' THEN
            IF OLD.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - OLD.valor 
                WHERE id = OLD.conta_id;
            ELSIF NEW.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + OLD.valor 
                WHERE id = OLD.conta_id;
            END IF;
        END IF;
        
        -- Apply new transaction if it's paid
        IF NEW.status = 'pago' THEN
            IF NEW.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + NEW.valor 
                WHERE id = NEW.conta_id;
            ELSIF NEW.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - NEW.valor 
                WHERE id = NEW.conta_id;
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'pago' THEN
            IF OLD.tipo = 'receita' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual - OLD.valor 
                WHERE id = OLD.conta_id;
            ELSIF OLD.tipo = 'despesa' THEN
                UPDATE public.contas_financeiras 
                SET saldo_atual = saldo_atual + OLD.valor 
                WHERE id = OLD.conta_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;