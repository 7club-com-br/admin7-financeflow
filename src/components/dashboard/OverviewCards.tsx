import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CreditCard, Users, Package, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OverviewData {
  total_contas: number;
  total_categorias: number;  
  total_fornecedores: number;
  total_produtos: number;
}

export function OverviewCards() {
  const { user } = useAuth();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const [contasResult, categoriasResult, fornecedoresResult, produtosResult] = await Promise.all([
        supabase.from('contas_financeiras').select('id', { count: 'exact' }).eq('ativa', true),
        supabase.from('financeiro_categorias').select('id', { count: 'exact' }).eq('ativa', true),
        supabase.from('fornecedores').select('id', { count: 'exact' }).eq('ativo', true),
        supabase.from('produtos').select('id', { count: 'exact' }).eq('ativo', true)
      ]);

      return {
        total_contas: contasResult.count || 0,
        total_categorias: categoriasResult.count || 0,
        total_fornecedores: fornecedoresResult.count || 0,
        total_produtos: produtosResult.count || 0,
      } as OverviewData;
    },
    enabled: !!user?.id
  });

  const cards = [
    {
      title: "Contas Ativas",
      value: overview?.total_contas || 0,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Categorias",
      value: overview?.total_categorias || 0, 
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Fornecedores",
      value: overview?.total_fornecedores || 0,
      icon: Users,
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
    },
    {
      title: "Produtos",
      value: overview?.total_produtos || 0,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.value === 1 ? 'registro' : 'registros'} cadastrados
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}