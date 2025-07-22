import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Recurrence {
  id: string
  user_id: string
  nome: string
  descricao: string
  tipo: 'receita' | 'despesa'
  categoria_id: string
  conta_id: string
  centro_custo_id?: string
  fornecedor_id?: string
  valor: number
  frequencia: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual'
  data_inicio: string
  data_fim?: string
  ativa: boolean
  proxima_geracao?: string
  total_gerado: number
  limite_geracoes?: number
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface CreateRecurrenceData {
  nome: string
  descricao: string
  tipo: 'receita' | 'despesa'
  categoria_id: string
  conta_id: string
  centro_custo_id?: string
  fornecedor_id?: string
  valor: number
  frequencia: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual'
  data_inicio: string
  data_fim?: string
  limite_geracoes?: number
  observacoes?: string
}

export const useRecurrences = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: recurrences = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['recurrences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financeiro_recorrencias')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Recurrence[]
    }
  })

  const createRecurrence = useMutation({
    mutationFn: async (newRecurrence: CreateRecurrenceData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const recurrenceWithUserId = {
        ...newRecurrence,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('financeiro_recorrencias')
        .insert(recurrenceWithUserId)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Erro ao criar recorrência')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences'] })
      toast({
        title: "Sucesso",
        description: "Recorrência criada com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar recorrência: ${error.message}`,
        variant: "destructive",
      })
    }
  })

  const updateRecurrence = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Recurrence> & { id: string }) => {
      const { data, error } = await supabase
        .from('financeiro_recorrencias')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Recorrência não encontrada')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences'] })
      toast({
        title: "Sucesso",
        description: "Recorrência atualizada com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar recorrência: ${error.message}`,
        variant: "destructive",
      })
    }
  })

  const deleteRecurrence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financeiro_recorrencias')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences'] })
      toast({
        title: "Sucesso",
        description: "Recorrência excluída com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir recorrência: ${error.message}`,
        variant: "destructive",
      })
    }
  })

  const toggleRecurrence = useMutation({
    mutationFn: async ({ id, ativa }: { id: string, ativa: boolean }) => {
      const { data, error } = await supabase
        .from('financeiro_recorrencias')
        .update({ ativa })
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Recorrência não encontrada')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences'] })
      toast({
        title: "Sucesso",
        description: "Status da recorrência atualizado!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar status: ${error.message}`,
        variant: "destructive",
      })
    }
  })

  const generateRecurrences = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('gerar_lancamentos_recorrencias')
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast({
        title: "Sucesso",
        description: "Lançamentos recorrentes gerados com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao gerar lançamentos: ${error.message}`,
        variant: "destructive",
      })
    }
  })

  return {
    recurrences,
    isLoading,
    error,
    refetch,
    createRecurrence: createRecurrence.mutate,
    updateRecurrence: updateRecurrence.mutate,
    deleteRecurrence: deleteRecurrence.mutate,
    toggleRecurrence: toggleRecurrence.mutate,
    generateRecurrences: generateRecurrences.mutate,
    isCreating: createRecurrence.isPending,
    isUpdating: updateRecurrence.isPending,
    isDeleting: deleteRecurrence.isPending,
    isToggling: toggleRecurrence.isPending,
    isGenerating: generateRecurrences.isPending
  }
}