import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { KommoIntegrationManager } from '../components/system/KommoIntegrationManager';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function KommoIntegration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Verificar se há parâmetros de sucesso/erro na URL
  const installationSuccess = searchParams.get('installation_success') === 'true';
  const installationError = searchParams.get('installation_error') === 'true';
  const uninstallSuccess = searchParams.get('uninstall_success') === 'true';
  const uninstallError = searchParams.get('uninstall_error') === 'true';
  const errorMessage = searchParams.get('error_message');
  
  // Limpar parâmetros da URL
  const clearParams = () => {
    navigate('/kommo-integration');
  };
  
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Integração com Kommo</h1>
      
      {/* Alertas de resultado */}
      {installationSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Integração realizada com sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">
            A conexão com o Kommo foi estabelecida com sucesso.
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={clearParams}
          >
            Fechar
          </Button>
        </Alert>
      )}
      
      {installationError && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Erro na integração</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage ? decodeURIComponent(errorMessage) : 'Ocorreu um erro ao conectar com o Kommo.'}
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={clearParams}
          >
            Fechar
          </Button>
        </Alert>
      )}
      
      {uninstallSuccess && (
        <Alert className="bg-amber-50 border-amber-200">
          <CheckCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Desinstalação concluída</AlertTitle>
          <AlertDescription className="text-amber-700">
            A conexão com o Kommo foi removida com sucesso.
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={clearParams}
          >
            Fechar
          </Button>
        </Alert>
      )}
      
      {uninstallError && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Erro na desinstalação</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage ? decodeURIComponent(errorMessage) : 'Ocorreu um erro ao desconectar do Kommo.'}
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={clearParams}
          >
            Fechar
          </Button>
        </Alert>
      )}
      
      {/* Componente principal de gerenciamento */}
      <KommoIntegrationManager />
      
      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções para Integração</CardTitle>
          <CardDescription>
            Como integrar seu Kommo com nosso sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Criar um widget no Kommo</h3>
            <p className="text-muted-foreground">
              Acesse a área de desenvolvedor do Kommo e crie um novo widget apontando para os seguintes URLs:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><strong>URL de Instalação:</strong> {window.location.origin}/api/kommo/oauth</li>
              <li><strong>URL de Desinstalação:</strong> {window.location.origin}/api/kommo/uninstall</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">2. Compartilhar o widget</h3>
            <p className="text-muted-foreground">
              Depois de criar o widget, compartilhe o link de instalação com seus clientes ou use o botão "Nova Integração Kommo" acima para instalar em sua própria conta.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">3. Gerenciar licenças</h3>
            <p className="text-muted-foreground">
              Cada instalação criará automaticamente uma licença trial de 7 dias. Monitore as instalações nesta página.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
