import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"

export interface FinancialTransaction {
  id: string
  user_id: string
  tipo: 'receita' | 'despesa'
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  status: 'pendente' | 'pago' | 'cancelado' | 'atrasado'
  categoria_id: string
  conta_id: string
  centro_custo_id?: string
  fornecedor_id?: string
  numero_documento?: string
  observacoes?: string
  tags?: string[]
  created_at: string
  updated_at: string
  categoria?: {
    nome: string
    cor: string
  }
  conta?: {
    nome: string
  }
  centro_custo?: {
    nome: string
  }
  fornecedor?: {
    nome: string
  }
}

export interface CreateTransactionData {
  tipo: 'receita' | 'despesa'
  descricao: string
  valor: number
  data_vencimento: string
  categoria_id: string
  conta_id: string
  centro_custo_id?: string
  fornecedor_id?: string
  numero_documento?: string
  observacoes?: string
  tags?: string[]
}

export function useFinancialTransactions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const transactionsQuery = useQuery({
    queryKey: ['financial-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('financeiro_lancamentos')
        .select(`
          *,
          financeiro_categorias!categoria_id (
            nome,
            cor
          ),
          contas_financeiras!conta_id (
            nome
          ),
          centros_custo!centro_custo_id (
            nome
          ),
          fornecedores!fornecedor_id (
            nome
          )
        `)
        .order('data_vencimento', { ascending: false })

      if (error) throw error
      return data as FinancialTransaction[]
    },
    enabled: !!user?.id
  })

  const createTransaction = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      
      const { data: result, error } = await supabase
        .from('financeiro_lancamentos')
        .insert({
          ...data,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar lançamento",
        variant: "destructive"
      })
    }
  })

  const updateTransaction = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateTransactionData> }) => {
      const { data: result, error } = await supabase
        .from('financeiro_lancamentos')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
      toast({
        title: "Sucesso",
        description: "Lançamento atualizado com sucesso"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar lançamento",
        variant: "destructive"
      })
    }
  })

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financeiro_lancamentos')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir lançamento",
        variant: "destructive"
      })
    }
  })

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('financeiro_lancamentos')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
      toast({
        title: "Sucesso",
        description: "Lançamento marcado como pago"
      })
    }
  })

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    refetch: transactionsQuery.refetch
  }
}

// Hook para categorias
export function useCategories() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('financeiro_categorias')
        .select('*')
        .eq('ativa', true)
        .order('nome')

      if (error) throw error
      return data
    },
    enabled: !!user?.id
  })
}

// Hook para contas financeiras
export function useAccounts() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('contas_financeiras')
        .select('*')
        .eq('ativa', true)
        .order('nome')

      if (error) throw error
      return data
    },
    enabled: !!user?.id
  })
}

// Hook para centros de custo
export function useCostCenters() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['cost-centers', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('centros_custo')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      return data
    },
    enabled: !!user?.id
  })
}

// Hook para fornecedores
export function useSuppliers() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['suppliers', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      return data
    },
    enabled: !!user?.id
  })
}