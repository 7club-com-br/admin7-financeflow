import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useDemoData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createDemoData = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase.rpc('criar_dados_demo', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar todas as queries para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
      queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (data) {
        toast({
          title: "Dados de demonstração criados!",
          description: "Explore o sistema com dados de exemplo. Você pode modificar ou excluir esses dados a qualquer momento.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Dados já existem",
          description: "Você já possui dados cadastrados no sistema.",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar dados de demonstração",
        variant: "destructive"
      });
    }
  });

  return {
    createDemoData: createDemoData.mutate,
    isCreating: createDemoData.isPending,
  };
}