import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentTransactions() {
  const { user } = useAuth()
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('financeiro_lancamentos')
        .select(`
          id,
          descricao,
          valor,
          tipo,
          status,
          data_vencimento,
          financeiro_categorias!categoria_id (
            nome,
            cor
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-muted-foreground mb-4">Nenhuma transação encontrada</p>
        <p className="text-sm text-muted-foreground">
          Comece criando sua primeira receita ou despesa
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction: any) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">{transaction.descricao}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.data_vencimento).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-medium ${
              transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.tipo === 'receita' ? '+' : '-'} R$ {transaction.valor}
            </p>
            <Badge variant="secondary">{transaction.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}