import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'cancelado' | 'atrasado';
  data_vencimento: string;
  categoria: {
    nome: string;
    cor: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'pendente':
        return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'atrasado':
        return 'bg-expense/10 text-expense hover:bg-expense/20';
      case 'cancelado':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'pendente':
        return 'Pendente';
      case 'atrasado':
        return 'Atrasado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-financial">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Lançamentos Recentes</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Ver Todos
          </Button>
          <Button size="sm" className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-4">
                <ArrowUpDown className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum lançamento encontrado</h3>
              <p className="text-sm">Comece criando seu primeiro lançamento financeiro.</p>
              <Button className="mt-4 bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Lançamento
              </Button>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: transaction.categoria.cor }}
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.descricao}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{transaction.categoria.nome}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(transaction.data_vencimento), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                    {getStatusLabel(transaction.status)}
                  </Badge>
                  <span
                    className={`font-semibold ${
                      transaction.tipo === 'receita' ? 'text-income' : 'text-expense'
                    }`}
                  >
                    {transaction.tipo === 'receita' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.valor))}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}