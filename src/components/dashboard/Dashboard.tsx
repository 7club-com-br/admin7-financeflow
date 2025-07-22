import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialStatsCards } from "./FinancialStatsCards";
import { RecentTransactions } from "./RecentTransactions";
import { QuickActions } from "./QuickActions";
import { OverviewCards } from "./OverviewCards";

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Visão geral do seu controle financeiro
        </p>
      </div>
      
      {/* Estatísticas Principais */}
      <FinancialStatsCards />
      
      {/* Visão Geral dos Registros */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-primary">Visão Geral dos Cadastros</h3>
        <OverviewCards />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-7">
        {/* Gráfico do Fluxo de Caixa */}
        <Card className="col-span-4 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              📊 Fluxo de Caixa
            </CardTitle>
            <CardDescription>
              Evolução financeira do período
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[320px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-gradient-to-br from-muted/10 to-muted/5">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-lg font-medium text-muted-foreground mb-2">Gráfico em desenvolvimento</p>
                <p className="text-sm text-muted-foreground">
                  Em breve você verá aqui a evolução do seu fluxo de caixa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar com Ações Rápidas e Transações Recentes */}
        <div className="col-span-3 space-y-6">
          <QuickActions />
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                🔄 Transações Recentes
              </CardTitle>
              <CardDescription>
                Últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}