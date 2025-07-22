import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface FinancialStats {
  total_receitas: number
  total_despesas: number
  saldo_periodo: number
  receitas_pagas: number
  despesas_pagas: number
  receitas_pendentes: number
  despesas_pendentes: number
}

export function FinancialStatsCards() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['financial-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .rpc('calcular_estatisticas_financeiras', {
          p_user_id: user.id
        })
        .single()

      if (error) throw error
      return data as FinancialStats
    },
    enabled: !!user?.id
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas do Período</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats?.total_receitas || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagas: {formatCurrency(stats?.receitas_pagas || 0)}
          </p>
        </CardContent>
      </Card>

      {/* Total de Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas do Período</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats?.total_despesas || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagas: {formatCurrency(stats?.despesas_pagas || 0)}
          </p>
        </CardContent>
      </Card>

      {/* Saldo do Período */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            (stats?.saldo_periodo || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(stats?.saldo_periodo || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receitas - Despesas
          </p>
        </CardContent>
      </Card>

      {/* Valores Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valores Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency((stats?.receitas_pendentes || 0) + (stats?.despesas_pendentes || 0))}
          </div>
          <p className="text-xs text-muted-foreground">
            A Receber: {formatCurrency(stats?.receitas_pendentes || 0)}
          </p>
          <p className="text-xs text-muted-foreground">
            A Pagar: {formatCurrency(stats?.despesas_pendentes || 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}