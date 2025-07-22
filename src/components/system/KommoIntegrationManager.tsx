import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { Tables } from '../../integrations/supabase/types';
import { useToast } from '../../hooks/use-toast';

type User = Tables<'users'>;
type License = Tables<'licencas'>;

export function KommoIntegrationManager() {
  const [loading, setLoading] = useState(true);
  const [kommoUsers, setKommoUsers] = useState<(User & { licenca?: License })[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Função para carregar usuários com integração Kommo
  const loadKommoUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários com ID Kommo
      const { data: kommoUsersData, error } = await supabase
        .from('users')
        .select('*')
        .not('id_kommo', 'is', null);
        
      if (error) throw error;
      
      if (!kommoUsersData || kommoUsersData.length === 0) {
        setKommoUsers([]);
        return;
      }
      
      // Buscar licenças para esses usuários
      const userIds = kommoUsersData.map(user => user.id);
      const { data: licenses } = await supabase
        .from('licencas')
        .select('*')
        .in('user_id', userIds);
      
      // Combinar dados
      const usersWithData = kommoUsersData.map(user => {
        const licenca = licenses?.find(l => l.user_id === user.id);
        return {
          ...user,
          licenca
        };
      });

      setKommoUsers(usersWithData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar integrações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar manualmente os tokens
  const refreshTokens = async () => {
    try {
      setRefreshing(true);
      
      // Recarregar dados
      await loadKommoUsers();
      
      toast({
        title: 'Dados atualizados',
        description: 'Os dados foram atualizados com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Função para criar um link de instalação
  const getInstallUrl = () => {
    const baseUrl = `${window.location.origin}/api/kommo/oauth`;
    const redirectUri = encodeURIComponent(baseUrl);
    
    // Obter client_id do serviço OAuth Kommo da sua aplicação
    const clientId = process.env.NEXT_PUBLIC_KOMMO_CLIENT_ID || 'your-kommo-client-id';
    
    return `https://www.kommo.com/oauth?client_id=${clientId}&mode=post_message&redirect_uri=${redirectUri}&state=kommo-integration`;
  };
  
  // Carregar dados ao inicializar
  useEffect(() => {
    loadKommoUsers();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Integrações Kommo</CardTitle>
            <CardDescription>
              Gerenciamento de contas Kommo integradas ao sistema
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadKommoUsers()}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button 
            variant="default" 
            onClick={() => window.open(getInstallUrl(), '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Nova Integração Kommo
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : kommoUsers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma integração Kommo encontrada
          </div>
        ) : (
          <div className="space-y-4">
            {kommoUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{user.name || 'Sem nome'}</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <CheckCircle className="mr-1 h-3 w-3" /> Kommo
                      </Badge>
                      {user.licenca && (
                        <Badge variant={user.licenca.ativa ? 'outline' : 'destructive'} className={user.licenca.ativa ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                          {user.licenca.status || 'Sem status'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Email: {user.email}</p>
                      <p>ID Kommo: {user.id_kommo}</p>
                      {user.subdominio && <p>Subdomínio: {user.subdominio}</p>}
                      {user.licenca && (
                        <>
                          <p>Licença válida até: {new Date(user.licenca.data_vencimento).toLocaleDateString('pt-BR')}</p>
                          <p>Plano: {user.licenca.tipo_plano}</p>
                        </>
                      )}
                      <p className="text-sm text-muted-foreground">Integração OAuth não implementada</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={refreshTokens}
                      disabled={refreshing}
                    >
                      {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Atualizar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}