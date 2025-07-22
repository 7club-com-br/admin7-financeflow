import { useState, useEffect } from "react";
import { RefreshCw, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";

export function ExchangeRateCard() {
  const [exchangeRate, setExchangeRate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    const { data, error } = await supabase
      .from('cotacoes')
      .select('*')
      .eq('moeda', 'USD')
      .order('data_atualizacao', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading exchange rate:', error);
    } else if (data) {
      setExchangeRate(data);
    }
    
    setLoading(false);
  };

  const updateExchangeRate = async () => {
    setUpdating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-exchange-rates');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Cotação atualizada com sucesso!');
        loadExchangeRate();
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar cotação: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cotação USD/BRL</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-6 bg-muted rounded w-20 mb-2"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </CardContent>
      </Card>
    );
  }

  const isOld = exchangeRate && 
    new Date().getTime() - new Date(exchangeRate.data_atualizacao).getTime() > 2 * 60 * 60 * 1000;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Cotação USD/BRL</CardTitle>
        <div className="flex items-center gap-2">
          {isOld && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Desatualizada
            </Badge>
          )}
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {exchangeRate ? `R$ ${exchangeRate.valor_brl.toFixed(4)}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {exchangeRate ? 
                `Atualizada ${formatDate(exchangeRate.data_atualizacao)}` : 
                'Sem dados'
              }
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={updateExchangeRate}
            disabled={updating}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}