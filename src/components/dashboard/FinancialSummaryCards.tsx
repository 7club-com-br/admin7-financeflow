import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingTransactions: number;
}

interface FinancialSummaryCardsProps {
  data: SummaryData;
}

export function FinancialSummaryCards({ data }: FinancialSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? 'text-income' : 'text-expense';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Balance */}
      <Card className="bg-gradient-card border-border/50 shadow-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo Total
          </CardTitle>
          <DollarSign className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getBalanceColor(data.totalBalance)}`}>
            {formatCurrency(data.totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Todas as contas
          </p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="bg-gradient-card border-border/50 shadow-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas do Mês
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-income" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-income">
            {formatCurrency(data.monthlyIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +12% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="bg-gradient-card border-border/50 shadow-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas do Mês
          </CardTitle>
          <TrendingDown className="h-5 w-5 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-expense">
            {formatCurrency(data.monthlyExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            -5% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Pending Transactions */}
      <Card className="bg-gradient-card border-border/50 shadow-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Lançamentos Pendentes
          </CardTitle>
          <Calendar className="h-5 w-5 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            {data.pendingTransactions}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Aguardando pagamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}