import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"

// Interfaces para Categorias
export interface Category {
  id: string
  user_id: string
  nome: string
  tipo: 'receita' | 'despesa'
  descricao?: string
  cor: string
  categoria_pai_id?: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  nome: string
  tipo: 'receita' | 'despesa'
  descricao?: string
  cor: string
  categoria_pai_id?: string
}

// Interfaces para Contas Financeiras
export interface Account {
  id: string
  user_id: string
  nome: string
  tipo: string
  banco?: string
  agencia?: string
  conta?: string
  saldo_inicial: number
  saldo_atual: number
  ativa: boolean
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface CreateAccountData {
  nome: string
  tipo: string
  banco?: string
  agencia?: string
  conta?: string
  saldo_inicial: number
  observacoes?: string
}

// Interfaces para Centros de Custo
export interface CostCenter {
  id: string
  user_id: string
  nome: string
  codigo?: string
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CreateCostCenterData {
  nome: string
  codigo?: string
  descricao?: string
}

// Interfaces para Fornecedores
export interface Supplier {
  id: string
  user_id: string
  nome: string
  tipo_documento: string
  documento?: string
  email?: string
  telefone?: string
  endereco?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CreateSupplierData {
  nome: string
  tipo_documento: string
  documento?: string
  email?: string
  telefone?: string
  endereco?: string
  observacoes?: string
}

// Hook para Categorias
export function useCategories() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('financeiro_categorias')
        .select('*')
        .order('nome')

      if (error) throw error
      return data as Category[]
    },
    enabled: !!user?.id
  })

  const createCategory = useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      
      const { data: result, error } = await supabase
        .from('financeiro_categorias')
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
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categoria",
        variant: "destructive"
      })
    }
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateCategoryData> }) => {
      const { data: result, error } = await supabase
        .from('financeiro_categorias')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso"
      })
    }
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financeiro_categorias')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso"
      })
    }
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, ativa }: { id: string, ativa: boolean }) => {
      const { error } = await supabase
        .from('financeiro_categorias')
        .update({ ativa })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleActive
  }
}

// Hook para Contas Financeiras
export function useAccounts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const accountsQuery = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('contas_financeiras')
        .select('*')
        .order('nome')

      if (error) throw error
      return data as Account[]
    },
    enabled: !!user?.id
  })

  const createAccount = useMutation({
    mutationFn: async (data: CreateAccountData) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      
      const { data: result, error } = await supabase
        .from('contas_financeiras')
        .insert({
          ...data,
          user_id: user.id,
          saldo_atual: data.saldo_inicial
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive"
      })
    }
  })

  const updateAccount = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateAccountData> }) => {
      const { data: result, error } = await supabase
        .from('contas_financeiras')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso"
      })
    }
  })

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contas_financeiras')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso"
      })
    }
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, ativa }: { id: string, ativa: boolean }) => {
      const { error } = await supabase
        .from('contas_financeiras')
        .update({ ativa })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  return {
    accounts: accountsQuery.data || [],
    isLoading: accountsQuery.isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    toggleActive
  }
}

// Hook para Centros de Custo
export function useCostCenters() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const costCentersQuery = useQuery({
    queryKey: ['cost-centers', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('centros_custo')
        .select('*')
        .order('nome')

      if (error) throw error
      return data as CostCenter[]
    },
    enabled: !!user?.id
  })

  const createCostCenter = useMutation({
    mutationFn: async (data: CreateCostCenterData) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      
      const { data: result, error } = await supabase
        .from('centros_custo')
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
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      toast({
        title: "Sucesso",
        description: "Centro de custo criado com sucesso"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar centro de custo",
        variant: "destructive"
      })
    }
  })

  const updateCostCenter = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateCostCenterData> }) => {
      const { data: result, error } = await supabase
        .from('centros_custo')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      toast({
        title: "Sucesso",
        description: "Centro de custo atualizado com sucesso"
      })
    }
  })

  const deleteCostCenter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('centros_custo')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      toast({
        title: "Sucesso",
        description: "Centro de custo excluído com sucesso"
      })
    }
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, ativo }: { id: string, ativo: boolean }) => {
      const { error } = await supabase
        .from('centros_custo')
        .update({ ativo })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
    }
  })

  return {
    costCenters: costCentersQuery.data || [],
    isLoading: costCentersQuery.isLoading,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
    toggleActive
  }
}

// Hook para Fornecedores
export function useSuppliers() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const suppliersQuery = useQuery({
    queryKey: ['suppliers', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('nome')

      if (error) throw error
      return data as Supplier[]
    },
    enabled: !!user?.id
  })

  const createSupplier = useMutation({
    mutationFn: async (data: CreateSupplierData) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      
      const { data: result, error } = await supabase
        .from('fornecedores')
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
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar fornecedor",
        variant: "destructive"
      })
    }
  })

  const updateSupplier = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateSupplierData> }) => {
      const { data: result, error } = await supabase
        .from('fornecedores')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso"
      })
    }
  })

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast({
        title: "Sucesso",
        description: "Fornecedor excluído com sucesso"
      })
    }
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, ativo }: { id: string, ativo: boolean }) => {
      const { error } = await supabase
        .from('fornecedores')
        .update({ ativo })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })

  return {
    suppliers: suppliersQuery.data || [],
    isLoading: suppliersQuery.isLoading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleActive
  }
}