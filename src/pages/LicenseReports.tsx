import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, Calendar, TrendingUp, Users, Crown, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface LicenseReport {
  id: string;
  user_email: string;
  user_name?: string;
  tipo_plano: string;
  status: string;
  data_vencimento: string;
  data_ativacao?: string;
  plano_nome?: string;
  valor_pago?: number;
  dias_restantes: number;
}

interface LicenseStats {
  total_licencas: number;
  licencas_ativas: number;
  licencas_expiradas: number;
  licencas_trial: number;
  receita_total: number;
}

export default function LicenseReports() {
  const [reports, setReports] = useState<LicenseReport[]>([]);
  const [stats, setStats] = useState<LicenseStats>({
    total_licencas: 0,
    licencas_ativas: 0,
    licencas_expiradas: 0,
    licencas_trial: 0,
    receita_total: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Buscar licenças com informações do usuário
      const { data: licensesData, error: licensesError } = await supabase
        .from('licencas')
        .select(`
          id,
          user_id,
          tipo_plano,
          status,
          data_vencimento,
          data_ativacao,
          plano_id,
          planos_licenca (
            nome,
            valor_brl
          )
        `)
        .order('data_ativacao', { ascending: false });

      if (licensesError) throw licensesError;

      // Buscar informações dos usuários
      const userIds = [...new Set(licensesData?.map(l => l.user_id) || [])];
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Buscar histórico de pagamentos
      const { data: historyData, error: historyError } = await supabase
        .from('historico_licencas')
        .select('licenca_id, valor_pago, acao')
        .eq('acao', 'ativacao');

      if (historyError) throw historyError;

      // Processar dados
      const processedReports = licensesData?.map(license => {
        const user = usersData?.find(u => u.id === license.user_id);
        const payment = historyData?.find(h => h.licenca_id === license.id);
        const diasRestantes = Math.max(0, Math.ceil(
          (new Date(license.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ));

        return {
          id: license.id,
          user_email: user?.email || 'N/A',
          user_name: user?.name,
          tipo_plano: license.tipo_plano,
          status: license.status,
          data_vencimento: license.data_vencimento,
          data_ativacao: license.data_ativacao,
          plano_nome: license.planos_licenca?.nome || license.tipo_plano,
          valor_pago: payment?.valor_pago || license.planos_licenca?.valor_brl || 0,
          dias_restantes: diasRestantes
        };
      }) || [];

      // Calcular estatísticas
      const totalLicencas = processedReports.length;
      const licencasAtivas = processedReports.filter(r => 
        r.status === 'ativa' && r.dias_restantes > 0
      ).length;
      const licencasExpiradas = processedReports.filter(r => 
        r.status === 'expirada' || r.dias_restantes <= 0
      ).length;
      const licencasTrial = processedReports.filter(r => 
        r.tipo_plano === 'trial'
      ).length;
      const receitaTotal = processedReports.reduce((acc, r) => 
        acc + (r.valor_pago || 0), 0
      );

      setStats({
        total_licencas: totalLicencas,
        licencas_ativas: licencasAtivas,
        licencas_expiradas: licencasExpiradas,
        licencas_trial: licencasTrial,
        receita_total: receitaTotal
      });

      setReports(processedReports);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios de licenças.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (report: LicenseReport) => {
    if (report.status === 'expirada' || report.dias_restantes <= 0) {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    if (report.dias_restantes <= 7) {
      return <Badge variant="outline">Expirando</Badge>;
    }
    return <Badge variant="default">Ativa</Badge>;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Nome', 'Plano', 'Status', 'Data Vencimento', 'Valor Pago', 'Dias Restantes'].join(','),
      ...reports.map(report => [
        report.user_email,
        report.user_name || '',
        report.plano_nome,
        report.status,
        formatDate(report.data_vencimento),
        report.valor_pago?.toString() || '0',
        report.dias_restantes.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-licencas-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Licenças</h1>
          <p className="text-muted-foreground">
            Análise detalhada das licenças do sistema.
          </p>
        </div>
        
        <Button onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenças</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_licencas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenças Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.licencas_ativas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenças Expiradas</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.licencas_expiradas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenças Trial</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.licencas_trial}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.receita_total)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Apenas Ativas</SelectItem>
                <SelectItem value="expired">Apenas Expiradas</SelectItem>
                <SelectItem value="expiring">Expirando em 7 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatório Detalhado ({reports.length} licenças)
          </CardTitle>
          <CardDescription>
            Lista completa de todas as licenças do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum relatório encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Vencimento</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead>Data Ativação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.user_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{report.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {report.plano_nome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(report)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(report.data_vencimento)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.valor_pago ? formatCurrency(report.valor_pago) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={report.dias_restantes <= 7 ? 'text-red-600 font-medium' : ''}>
                        {report.dias_restantes} dias
                      </span>
                    </TableCell>
                    <TableCell>
                      {report.data_ativacao ? formatDate(report.data_ativacao) : '-'}
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