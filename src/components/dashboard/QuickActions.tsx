import { Plus, FileText, TrendingUp, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Nova Receita",
      description: "Registrar entrada de dinheiro",
      icon: TrendingUp,
      color: "text-green-600",
      action: () => navigate("/lancamentos")
    },
    {
      title: "Nova Despesa", 
      description: "Registrar saída de dinheiro",
      icon: FileText,
      color: "text-red-600",
      action: () => navigate("/lancamentos")
    },
    {
      title: "Fornecedor",
      description: "Cadastrar novo fornecedor",
      icon: Users,
      color: "text-blue-600",
      action: () => navigate("/fornecedores")
    },
    {
      title: "Produto",
      description: "Adicionar novo produto",
      icon: Package,
      color: "text-purple-600", 
      action: () => navigate("/produtos")
    }
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Ações Rápidas</CardTitle>
        <CardDescription>
          Acesso rápido às funcionalidades mais utilizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
              onClick={action.action}
            >
              <action.icon className={`h-8 w-8 ${action.color}`} />
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}