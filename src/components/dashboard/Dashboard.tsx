import { useEffect, useState } from 'react';
import { FinancialSummaryCards } from './FinancialSummaryCards';
import { RecentTransactions } from './RecentTransactions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/financial-hero.jpg';

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

interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingTransactions: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load account balances
      const { data: accounts } = await supabase
        .from('contas_financeiras')
        .select('saldo_atual')
        .eq('ativa', true);

      const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.saldo_atual), 0) || 0;

      // Load monthly transactions
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: monthlyTransactions } = await supabase
        .from('financeiro_lancamentos')
        .select('valor, tipo, status')
        .gte('data_vencimento', firstDayOfMonth.toISOString().split('T')[0])
        .lte('data_vencimento', lastDayOfMonth.toISOString().split('T')[0]);

      const monthlyIncome = monthlyTransactions
        ?.filter(t => t.tipo === 'receita' && t.status === 'pago')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

      const monthlyExpenses = monthlyTransactions
        ?.filter(t => t.tipo === 'despesa' && t.status === 'pago')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

      const pendingTransactions = monthlyTransactions
        ?.filter(t => t.status === 'pendente').length || 0;

      setSummaryData({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        pendingTransactions,
      });

      // Load recent transactions
      const { data: transactions } = await supabase
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
        .limit(5);

      const formattedTransactions: Transaction[] = transactions?.map(t => ({
        id: t.id,
        descricao: t.descricao,
        valor: Number(t.valor),
        tipo: t.tipo,
        status: t.status,
        data_vencimento: t.data_vencimento,
        categoria: {
          nome: (t.financeiro_categorias as any)?.nome || 'Sem categoria',
          cor: (t.financeiro_categorias as any)?.cor || '#6b7280',
        },
      })) || [];

      setRecentTransactions(formattedTransactions);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Financial Dashboard"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        <div className="relative px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Admin7
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Controle total das suas finanças. Gerencie receitas, despesas e tenha insights valiosos sobre sua saúde financeira.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="relative -mt-16 z-10">
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Financial Summary Cards */}
          <div className="mb-8">
            <FinancialSummaryCards data={summaryData} />
          </div>

          {/* Recent Transactions */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentTransactions transactions={recentTransactions} />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-gradient-card border border-border/50 shadow-financial rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg bg-income/10 hover:bg-income/20 text-income border border-income/20 transition-colors">
                    <div className="font-medium">+ Nova Receita</div>
                    <div className="text-sm opacity-80">Registrar entrada de dinheiro</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-expense/10 hover:bg-expense/20 text-expense border border-expense/20 transition-colors">
                    <div className="font-medium">- Nova Despesa</div>
                    <div className="text-sm opacity-80">Registrar saída de dinheiro</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors">
                    <div className="font-medium">📊 Ver Relatórios</div>
                    <div className="text-sm opacity-80">Análises detalhadas</div>
                  </button>
                </div>
              </div>

              {/* Financial Health */}
              <div className="bg-gradient-card border border-border/50 shadow-financial rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Saúde Financeira</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Receitas vs Despesas</span>
                      <span className="text-income font-medium">Positivo</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-success h-2 rounded-full transition-all duration-300" 
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Suas receitas estão 25% acima das despesas este mês. Situação financeira saudável.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}