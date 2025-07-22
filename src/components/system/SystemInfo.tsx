import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Settings, Download, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SystemInfo() {
  const { user } = useAuth();

  const systemInfo = [
    { label: "Versão do Sistema", value: "2.1.0", status: "success" },
    { label: "Última Atualização", value: "22/01/2025", status: "info" },
    { label: "Status", value: "Operacional", status: "success" },
    { label: "Usuário Ativo", value: user?.email || "N/A", status: "info" },
  ];

  const handleExportData = () => {
    // Implementar exportação de dados futuramente
    alert("Funcionalidade de exportação em desenvolvimento");
  };

  const handleBackup = () => {
    // Implementar backup futuramente
    alert("Funcionalidade de backup em desenvolvimento");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Informações do Sistema</h2>
        <p className="text-muted-foreground">
          Detalhes técnicos e configurações do sistema financeiro
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Informações sobre a versão e status atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemInfo.map((info, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{info.label}:</span>
                <Badge variant={info.status === "success" ? "default" : "secondary"}>
                  {info.value}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ações
            </CardTitle>
            <CardDescription>
              Ferramentas de manutenção e backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="w-full justify-start"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleBackup}
              className="w-full justify-start"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Backup do Sistema
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notas Importantes */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Melhorias Implementadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ Dashboard aprimorado com cards informativos</li>
            <li>✅ Navegação reorganizada com página de Produtos</li>
            <li>✅ Sistema de dados de demonstração</li>
            <li>✅ Layout visual melhorado com gradientes</li>
            <li>✅ Ações rápidas no dashboard</li>
            <li>⏳ Gráficos interativos (em desenvolvimento)</li>
            <li>⏳ Relatórios avançados (em desenvolvimento)</li>
            <li>⏳ Sistema de notificações (planejado)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}