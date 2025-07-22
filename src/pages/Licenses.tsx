import React, { useState, useEffect } from 'react';
import { useLicenseContext } from '@/contexts/LicenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Plus, Search, Filter, Calendar, Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface License {
  id: string;
  user_id: string;
  tipo_plano: string;
  status: string;
  data_vencimento: string;
  plano_nome?: string;
  chave_licenca?: string;
  data_ativacao?: string;
  ativa: boolean;
}

function Licenses() {
  const { license, plans, activateLicense, fetchLicenseStatus } = useLicenseContext();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLicense, setNewLicense] = useState({
    planId: '',
    licenseKey: '',
    additionalMonths: 1
  });
  const [activating, setActivating] = useState(false);
  const { toast } = useToast();

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('licencas')
        .select(`
          id,
          user_id,
          tipo_plano,
          status,
          data_vencimento,
          chave_licenca,
          data_ativacao,
          ativa,
          plano_id,
          planos_licenca (
            nome
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedLicenses = data?.map((item: any) => ({
        ...item,
        plano_nome: item.planos_licenca?.nome || item.tipo_plano
      })) || [];

      setLicenses(processedLicenses);
      setFilteredLicenses(processedLicenses);
    } catch (error) {
      console.error('Erro ao buscar licenças:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar licenças.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    let filtered = licenses;

    if (searchTerm) {
      filtered = filtered.filter(license => 
        license.plano_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.chave_licenca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.tipo_plano.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(license => 
        statusFilter === 'active' ? license.ativa && license.status === 'ativa' :
        statusFilter === 'expired' ? license.status === 'expirada' :
        statusFilter === 'inactive' ? !license.ativa :
        true
      );
    }

    setFilteredLicenses(filtered);
  }, [licenses, searchTerm, statusFilter]);

  const handleAddLicense = async () => {
    if (!newLicense.planId) {
      toast({
        title: "Erro",
        description: "Selecione um plano para a licença.",
        variant: "destructive"
      });
      return;
    }

    setActivating(true);
    try {
      const success = await activateLicense(
        newLicense.planId, 
        newLicense.licenseKey || undefined
      );
      
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Licença adicionada com sucesso.",
        });
        setNewLicense({ planId: '', licenseKey: '', additionalMonths: 1 });
        setShowAddDialog(false);
        await fetchLicenses();
        await fetchLicenseStatus();
      } else {
        toast({
          title: "Erro",
          description: "Falha ao adicionar a licença. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a licença.",
        variant: "destructive"
      });
    } finally {
      setActivating(false);
    }
  };

  const getStatusBadge = (license: License) => {
    if (!license.ativa) {
      return <Badge variant="secondary">Inativa</Badge>;
    }
    
    const isExpired = new Date(license.data_vencimento) < new Date();
    
    if (isExpired || license.status === 'expirada') {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    
    return <Badge variant="default">Ativa</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Licenças</h1>
          <p className="text-muted-foreground">
            Gerencie todas as licenças do sistema.
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Licença
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Licença</DialogTitle>
              <DialogDescription>
                Configure uma nova licença manualmente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan-select">Plano</Label>
                <Select value={newLicense.planId} onValueChange={(value) => 
                  setNewLicense(prev => ({ ...prev, planId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.nome} - {plan.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="license-key">Chave de Licença (Opcional)</Label>
                <Input
                  id="license-key"
                  placeholder="Digite a chave de licença"
                  value={newLicense.licenseKey}
                  onChange={(e) => setNewLicense(prev => ({ 
                    ...prev, 
                    licenseKey: e.target.value 
                  }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddLicense} disabled={activating}>
                {activating ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por plano, chave ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Licenças */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Lista de Licenças ({filteredLicenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLicenses.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma licença encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Vencimento</TableHead>
                  <TableHead>Chave</TableHead>
                  <TableHead>Data Ativação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-medium">
                      {license.plano_nome || license.tipo_plano}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {license.tipo_plano}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(license)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(license.data_vencimento)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {license.chave_licenca ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {license.chave_licenca.substring(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {license.data_ativacao ? (
                        formatDate(license.data_ativacao)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Licenses;