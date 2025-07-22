import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface LicenseInfo {
  status: string;
  dias_restantes: number;
  limite_usuarios: number;
  limite_lancamentos: number;
  limite_produtos: number;
  recursos_liberados: Record<string, boolean>;
  plano_nome: string;
}

export interface LicensePlan {
  id: string;
  nome: string;
  tipo: string;
  duracao_meses: number;
  valor_brl: number;
  valor_usd: number;
  periodo_trial_dias: number;
  limite_usuarios: number;
  limite_lancamentos: number;
  limite_produtos: number;
  recursos_liberados: any;
  ativo: boolean;
}

export function useLicense() {
  console.log('[useLicense] Hook iniciado');
  
  const { user } = useAuth();
  console.log('[useLicense] User:', user?.email || 'nenhum');
  
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [plans, setPlans] = useState<LicensePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicenseStatus = async () => {
    console.log('[useLicense] fetchLicenseStatus chamado, user:', !!user);
    
    if (!user) {
      console.log('[useLicense] Sem usuário, parando loading');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: funcError } = await supabase.functions.invoke('check-license-status');
      
      if (funcError) {
        throw funcError;
      }
      
      setLicense(data);
    } catch (err) {
      console.error('Erro ao verificar licença:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('planos_licenca')
        .select('*')
        .eq('ativo', true)
        .order('valor_brl', { ascending: true });
      
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
    }
  };

  const activateLicense = async (planId: string, licenseKey?: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('activate-license', {
        body: { 
          plan_id: planId,
          license_key: licenseKey 
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        await fetchLicenseStatus();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Erro ao ativar licença:', err);
      setError(err instanceof Error ? err.message : 'Erro ao ativar licença');
      return false;
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!license) return false;
    if (license.status === 'expirada') return false;
    return license.recursos_liberados[feature] === true;
  };

  const isWithinLimit = (type: 'usuarios' | 'lancamentos' | 'produtos', current: number): boolean => {
    if (!license) return false;
    
    switch (type) {
      case 'usuarios':
        return current < license.limite_usuarios;
      case 'lancamentos':
        return current < license.limite_lancamentos;
      case 'produtos':
        return current < license.limite_produtos;
      default:
        return false;
    }
  };

  const isExpiringSoon = (): boolean => {
    return license ? license.dias_restantes <= 7 : false;
  };

  const isExpired = (): boolean => {
    return license ? license.status === 'expirada' : true;
  };

  useEffect(() => {
    console.log('[useLicense] useEffect executado, user:', !!user);
    if (user) {
      console.log('[useLicense] Chamando fetchLicenseStatus e fetchPlans');
      fetchLicenseStatus();
      fetchPlans();
    } else {
      console.log('[useLicense] Sem user, setando loading false');
      setLoading(false);
    }
  }, [user]);

  return {
    license,
    plans,
    loading,
    error,
    fetchLicenseStatus,
    fetchPlans,
    activateLicense,
    hasFeature,
    isWithinLimit,
    isExpiringSoon,
    isExpired
  };
}