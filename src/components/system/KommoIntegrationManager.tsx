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
type OAuthCredential = Tables<'oauth_credentials'>;

export function KommoIntegrationManager() {
  const [loading, setLoading] = useState(true);
  const [kommoUsers, setKommoUsers] = useState<(User & { licenca?: License, credential?: OAuthCredential })[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Função para carregar usuários com integração Kommo
  const loadKommoUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários com ID Kommo
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .not('id_kommo', 'is', null);
        
      if (error) throw error;
      
      if (!users || users.length === 0) {
        setKommoUsers([]);
        return;
      }
      
      // Para cada usuário, buscar a licença e credencial OAuth
      const usersWithData = await Promise.all(users.map(async (user) => {
        // Buscar licença do usuário
        const { data: licencas } = await supabase
          .from('licencas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        const licenca = licencas && licencas.length > 0 ? licencas[0] : undefined;
        
        // Se tiver licença, buscar credencial OAuth
        let credential;
        if (licenca) {
          const { data: credentials } = await supabase
            .from('oauth_credentials')
            .select('*')
            .eq('licenca_id', licenca.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          credential = credentials && credentials.length > 0 ? credentials[0] : undefined;
        }
        
        return {
          ...user,
          licenca,
          credential
        };
      }));
      
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
  const refreshTokens = async (credentialId: string) => {
    try {
      setRefreshing(true);
      
      // Chamar a função Edge para atualizar o token
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/kommo-refresh-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ credential_id: credentialId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar token');
      }
      
      // Recarregar dados
      await loadKommoUsers();
      
      toast({
        title: 'Token atualizado',
        description: 'O token de acesso foi atualizado com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar token',
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
    const clientId = process.env.NEXT_PUBLIC_KOMMO_CLIENT_ID;
    
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
                      {user.credential ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="mr-1 h-3 w-3" /> Conectado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" /> Desconectado
                        </Badge>
                      )}
                      {user.licenca && (
                        <Badge variant={user.licenca.ativa ? 'outline' : 'destructive'} className={user.licenca.ativa ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}>
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
                      {user.credential && (
                        <p>Token expira em: {new Date(user.credential.expires_at).toLocaleDateString('pt-BR')} às {new Date(user.credential.expires_at).toLocaleTimeString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                  
                  {user.credential && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => refreshTokens(user.credential!.id)}
                      disabled={refreshing}
                    >
                      {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Atualizar Token
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
