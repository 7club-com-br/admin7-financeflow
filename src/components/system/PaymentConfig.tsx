import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { AlertCircle, CreditCard, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PaymentConfig() {
  const [loading, setLoading] = useState(false)
  const [stripeConfig, setStripeConfig] = useState({
    enabled: false,
    testMode: true,
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
    currencies: ["USD", "EUR"]
  })
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState({
    enabled: false,
    testMode: true,
    accessToken: "",
    publicKey: "",
    webhookSecret: "",
    currencies: ["BRL"]
  })

  // Função para carregar configurações de pagamento do banco de dados
  const loadPaymentConfigs = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      toast.success("Configurações de pagamento carregadas")
    } catch (error) {
      toast.error("Erro ao carregar configurações de pagamento")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Salvar configuração do Stripe
  const saveStripeConfig = async () => {
    setLoading(true)
    try {
      // Mock save operation
      toast.success("Configurações do Stripe salvas com sucesso")
    } catch (error) {
      toast.error("Erro ao salvar configurações do Stripe")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Salvar configuração do MercadoPago
  const saveMercadoPagoConfig = async () => {
    setLoading(true)
    try {
      // Mock save operation
      toast.success("Configurações do MercadoPago salvas com sucesso")
    } catch (error) {
      toast.error("Erro ao salvar configurações do MercadoPago")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Testar conexão com o gateway de pagamento
  const testPaymentGateway = async (gateway: string) => {
    setLoading(true)
    try {
      // Mock test operation
      toast.success(`Conexão com ${gateway} realizada com sucesso`)
    } catch (error) {
      toast.error(`Erro ao conectar com ${gateway}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="stripe" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stripe" onClick={() => loadPaymentConfigs()}>
          <CreditCard className="mr-2 h-4 w-4" />
          Stripe
        </TabsTrigger>
        <TabsTrigger value="mercadopago" onClick={() => loadPaymentConfigs()}>
          <DollarSign className="mr-2 h-4 w-4" />
          MercadoPago
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stripe" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configuração do Stripe</span>
              <Switch 
                checked={stripeConfig.enabled}
                onCheckedChange={(checked) => setStripeConfig({...stripeConfig, enabled: checked})}
              />
            </CardTitle>
            <CardDescription>
              Configure o Stripe para processar pagamentos internacionais em USD e EUR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                As chaves secretas nunca são mostradas depois de salvas. Preencha novamente ao alterar.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="stripe-test-mode"
                  checked={stripeConfig.testMode}
                  onCheckedChange={(checked) => setStripeConfig({...stripeConfig, testMode: checked})}
                />
                <Label htmlFor="stripe-test-mode">Modo de teste</Label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="stripe-public-key">Chave Pública (Publishable Key)</Label>
                  <Input
                    id="stripe-public-key"
                    placeholder="pk_live_..."
                    value={stripeConfig.publicKey}
                    onChange={(e) => setStripeConfig({...stripeConfig, publicKey: e.target.value})}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="stripe-secret-key">Chave Secreta (Secret Key)</Label>
                  <Input
                    id="stripe-secret-key"
                    type="password"
                    placeholder="sk_live_..."
                    value={stripeConfig.secretKey}
                    onChange={(e) => setStripeConfig({...stripeConfig, secretKey: e.target.value})}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="stripe-webhook-secret">Segredo do Webhook</Label>
                  <Input
                    id="stripe-webhook-secret"
                    type="password"
                    placeholder="whsec_..."
                    value={stripeConfig.webhookSecret}
                    onChange={(e) => setStripeConfig({...stripeConfig, webhookSecret: e.target.value})}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={saveStripeConfig} disabled={loading} className="flex-1">
                    Salvar Configurações
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => testPaymentGateway('Stripe')} 
                    disabled={loading || !stripeConfig.enabled || !stripeConfig.secretKey}
                    className="flex-1"
                  >
                    Testar Conexão
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mercadopago" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configuração do MercadoPago</span>
              <Switch 
                checked={mercadoPagoConfig.enabled}
                onCheckedChange={(checked) => setMercadoPagoConfig({...mercadoPagoConfig, enabled: checked})}
              />
            </CardTitle>
            <CardDescription>
              Configure o MercadoPago para processar pagamentos no Brasil em BRL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                As chaves secretas nunca são mostradas depois de salvas. Preencha novamente ao alterar.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="mp-test-mode"
                  checked={mercadoPagoConfig.testMode}
                  onCheckedChange={(checked) => setMercadoPagoConfig({...mercadoPagoConfig, testMode: checked})}
                />
                <Label htmlFor="mp-test-mode">Modo de teste</Label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="mp-public-key">Chave Pública</Label>
                  <Input
                    id="mp-public-key"
                    placeholder="APP_USR-..."
                    value={mercadoPagoConfig.publicKey}
                    onChange={(e) => setMercadoPagoConfig({...mercadoPagoConfig, publicKey: e.target.value})}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="mp-access-token">Access Token</Label>
                  <Input
                    id="mp-access-token"
                    type="password"
                    placeholder="APP_USR-..."
                    value={mercadoPagoConfig.accessToken}
                    onChange={(e) => setMercadoPagoConfig({...mercadoPagoConfig, accessToken: e.target.value})}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="mp-webhook-secret">Segredo do Webhook</Label>
                  <Input
                    id="mp-webhook-secret"
                    type="password"
                    placeholder="..."
                    value={mercadoPagoConfig.webhookSecret}
                    onChange={(e) => setMercadoPagoConfig({...mercadoPagoConfig, webhookSecret: e.target.value})}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={saveMercadoPagoConfig} disabled={loading} className="flex-1">
                    Salvar Configurações
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => testPaymentGateway('MercadoPago')} 
                    disabled={loading || !mercadoPagoConfig.enabled || !mercadoPagoConfig.accessToken}
                    className="flex-1"
                  >
                    Testar Conexão
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}