import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialStatsCards } from "./FinancialStatsCards";
import { RecentTransactions } from "./RecentTransactions";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Visão geral do seu controle financeiro
        </p>
      </div>
      
      <FinancialStatsCards />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Fluxo de Caixa</CardTitle>
            <CardDescription>
              Evolução financeira do período
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Chart will go here */}
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/10">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">📊 Gráfico em desenvolvimento</p>
                <p className="text-sm text-muted-foreground">Em breve você verá aqui a evolução do seu fluxo de caixa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Transações Recentes</CardTitle>
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
  );
}