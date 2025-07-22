import React, { useState } from 'react';
import { useLicenseContext } from '@/contexts/LicenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LicenseDetails } from '@/components/license/LicenseStatus';
import { Crown, Check, Zap, Users, FileText, Package, Calendar, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Licenses() {
  const { license, plans, activateLicense, fetchLicenseStatus } = useLicenseContext();
  const [licenseKey, setLicenseKey] = useState('');
  const [activating, setActivating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const handleActivateLicense = async (planId: string, needsKey = false) => {
    if (needsKey && !licenseKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave de licença válida.",
        variant: "destructive"
      });
      return;
    }

    setActivating(true);
    try {
      const success = await activateLicense(planId, needsKey ? licenseKey : undefined);
      
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Licença ativada com sucesso.",
        });
        setLicenseKey('');
        setSelectedPlan(null);
        await fetchLicenseStatus();
      } else {
        toast({
          title: "Erro",
          description: "Falha ao ativar a licença. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao ativar a licença.",
        variant: "destructive"
      });
    } finally {
      setActivating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getFeaturesList = (recursos: Record<string, boolean>) => {
    const features = [];
    if (recursos.relatorios_basicos) features.push('Relatórios Básicos');
    if (recursos.relatorios_avancados) features.push('Relatórios Avançados');
    if (recursos.recorrencias) features.push('Lançamentos Recorrentes');
    if (recursos.multiplas_contas) features.push('Múltiplas Contas');
    if (recursos.centros_custo) features.push('Centros de Custo');
    if (recursos.integracao_kommo) features.push('Integração Kommo');
    if (recursos.multiplos_usuarios) features.push('Múltiplos Usuários');
    if (recursos.api_acesso) features.push('Acesso API');
    if (recursos.todos_recursos) features.push('Todos os Recursos');
    return features;
  };

  const isCurrentPlan = (planType: string) => {
    return license?.plano_nome?.toLowerCase().includes(planType.toLowerCase());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Licenças</h1>
        <p className="text-muted-foreground">
          Gerencie sua licença e escolha o plano ideal para suas necessidades.
        </p>
      </div>

      {/* Status Atual da Licença */}
      {license && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Status Atual da Licença
            </CardTitle>
            <CardDescription>
              Informações sobre sua licença atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LicenseDetails />
          </CardContent>
        </Card>
      )}

      {/* Ativar com Chave de Licença */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Ativar Licença
          </CardTitle>
          <CardDescription>
            Já possui uma chave de licença? Ative-a aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="license-key">Chave de Licença</Label>
            <Input
              id="license-key"
              placeholder="Digite sua chave de licença"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleActivateLicense('', true)}
            disabled={activating || !licenseKey.trim()}
          >
            {activating ? 'Ativando...' : 'Ativar Licença'}
          </Button>
        </CardFooter>
      </Card>

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Planos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${isCurrentPlan(plan.tipo) ? 'ring-2 ring-primary' : ''}`}>
              {isCurrentPlan(plan.tipo) && (
                <Badge className="absolute -top-2 left-4 bg-primary">
                  Plano Atual
                </Badge>
              )}
              
              {plan.tipo === 'premium' && (
                <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-purple-600 to-blue-600">
                  Mais Popular
                </Badge>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {plan.tipo === 'trial' && <Gift className="w-5 h-5" />}
                    {plan.tipo === 'basic' && <Package className="w-5 h-5" />}
                    {plan.tipo === 'premium' && <Crown className="w-5 h-5" />}
                    {plan.tipo === 'enterprise' && <Zap className="w-5 h-5" />}
                    {plan.nome}
                  </CardTitle>
                </div>
                
                <div className="text-3xl font-bold">
                  {plan.valor_brl > 0 ? formatPrice(plan.valor_brl) : 'Gratuito'}
                  {plan.duracao_meses > 0 && (
                    <span className="text-base font-normal text-muted-foreground">
                      /{plan.duracao_meses} meses
                    </span>
                  )}
                </div>
                
                {plan.periodo_trial_dias > 0 && (
                  <Badge variant="secondary">
                    {plan.periodo_trial_dias} dias gratuitos
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {plan.limite_usuarios === 999 ? 'Usuários ilimitados' : `${plan.limite_usuarios} usuários`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {plan.limite_lancamentos === 999999 ? 'Lançamentos ilimitados' : `${plan.limite_lancamentos} lançamentos`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {plan.limite_produtos === 999 ? 'Produtos ilimitados' : `${plan.limite_produtos} produtos`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recursos inclusos:</h4>
                  <ul className="space-y-1">
                    {getFeaturesList(plan.recursos_liberados).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlan(plan.tipo) ? (
                  <Button disabled className="w-full">
                    Plano Atual
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={plan.tipo === 'premium' ? 'default' : 'outline'}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.tipo === 'trial' ? 'Iniciar Trial' : 'Escolher Plano'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Ativação</DialogTitle>
                        <DialogDescription>
                          Deseja ativar o plano "{plan.nome}"?
                          {plan.valor_brl > 0 && ` Por ${formatPrice(plan.valor_brl)}`}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPlan(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleActivateLicense(plan.id)}
                          disabled={activating}
                        >
                          {activating ? 'Ativando...' : 'Confirmar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}