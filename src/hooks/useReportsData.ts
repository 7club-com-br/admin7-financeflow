import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export interface ReportData {
  period: string
  total_receitas: number
  total_despesas: number
  saldo_periodo: number
  receitas_pagas: number
  despesas_pagas: number
  receitas_pendentes: number
  despesas_pendentes: number
}

export interface CategoryReport {
  categoria_nome: string
  total_receitas: number
  total_despesas: number
  saldo: number
}

export interface AccountReport {
  conta_nome: string
  saldo_inicial: number
  saldo_atual: number
  movimentacao: number
}

export const useFinancialReports = (startDate?: Date, endDate?: Date) => {
  const currentDate = new Date()
  const defaultStartDate = startDate || startOfMonth(currentDate)
  const defaultEndDate = endDate || endOfMonth(currentDate)

  // Relatório financeiro geral
  const {
    data: financialReport,
    isLoading: isLoadingFinancial,
    error: financialError
  } = useQuery({
    queryKey: ['financial-report', defaultStartDate, defaultEndDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .rpc('calcular_estatisticas_financeiras', {
          p_user_id: user.id,
          p_data_inicio: format(defaultStartDate, 'yyyy-MM-dd'),
          p_data_fim: format(defaultEndDate, 'yyyy-MM-dd')
        })
        .maybeSingle()

      if (error) throw error
      return data as ReportData
    }
  })

  // Relatório por categorias
  const {
    data: categoryReport = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['category-report', defaultStartDate, defaultEndDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('financeiro_lancamentos')
        .select(`
          valor,
          tipo,
          financeiro_categorias!inner(nome)
        `)
        .eq('user_id', user.id)
        .gte('data_vencimento', format(defaultStartDate, 'yyyy-MM-dd'))
        .lte('data_vencimento', format(defaultEndDate, 'yyyy-MM-dd'))

      if (error) throw error

      // Agrupar por categoria
      const grouped = data?.reduce((acc: any, item: any) => {
        const categoria = item.financeiro_categorias.nome
        if (!acc[categoria]) {
          acc[categoria] = {
            categoria_nome: categoria,
            total_receitas: 0,
            total_despesas: 0,
            saldo: 0
          }
        }
        
        if (item.tipo === 'receita') {
          acc[categoria].total_receitas += item.valor
        } else {
          acc[categoria].total_despesas += item.valor
        }
        
        acc[categoria].saldo = acc[categoria].total_receitas - acc[categoria].total_despesas
        return acc
      }, {})

      return Object.values(grouped || {}) as CategoryReport[]
    }
  })

  // Relatório por contas
  const {
    data: accountReport = [],
    isLoading: isLoadingAccounts
  } = useQuery({
    queryKey: ['account-report'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('contas_financeiras')
        .select('nome, saldo_inicial, saldo_atual')
        .eq('user_id', user.id)
        .eq('ativa', true)

      if (error) throw error

      return data?.map(account => ({
        conta_nome: account.nome,
        saldo_inicial: account.saldo_inicial || 0,
        saldo_atual: account.saldo_atual || 0,
        movimentacao: (account.saldo_atual || 0) - (account.saldo_inicial || 0)
      })) as AccountReport[]
    }
  })

  // Comparação mensal (últimos 6 meses)
  const {
    data: monthlyComparison = [],
    isLoading: isLoadingMonthly
  } = useQuery({
    queryKey: ['monthly-comparison'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(currentDate, i)
        const start = startOfMonth(date)
        const end = endOfMonth(date)
        
        const { data, error } = await supabase
          .rpc('calcular_estatisticas_financeiras', {
            p_user_id: user.id,
            p_data_inicio: format(start, 'yyyy-MM-dd'),
            p_data_fim: format(end, 'yyyy-MM-dd')
          })
          .maybeSingle()

        if (error) throw error
        
        months.push({
          period: format(date, 'MMM/yyyy'),
          ...data
        })
      }
      
      return months as ReportData[]
    }
  })

  return {
    // Dados dos relatórios
    financialReport,
    categoryReport,
    accountReport,
    monthlyComparison,
    
    // Estados de loading
    isLoading: isLoadingFinancial || isLoadingCategories || isLoadingAccounts || isLoadingMonthly,
    isLoadingFinancial,
    isLoadingCategories,
    isLoadingAccounts,
    isLoadingMonthly,
    
    // Erros
    error: financialError
  }
}