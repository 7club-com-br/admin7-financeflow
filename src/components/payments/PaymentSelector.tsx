import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Globe, MapPin } from 'lucide-react'
import { MercadoPagoPayment } from './MercadoPagoPayment'
import { StripePayment } from './StripePayment'
import { formatCurrency } from '@/lib/utils'

interface PaymentSelectorProps {
  amount: number
  description: string
  transactionId?: string
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
}

export function PaymentSelector({ 
  amount, 
  description, 
  transactionId, 
  onSuccess, 
  onError 
}: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'mercadopago' | 'stripe'>('mercadopago')

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Processar Pagamento
        </CardTitle>
        <CardDescription>
          Valor: <span className="font-medium text-lg">{formatCurrency(amount)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mercadopago" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Brasil
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Internacional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mercadopago" className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
              <div>
                <h4 className="font-medium">Mercado Pago</h4>
                <p className="text-sm text-muted-foreground">PIX, Cartão, Boleto</p>
              </div>
              <Badge variant="outline">BRL</Badge>
            </div>
            <MercadoPagoPayment
              amount={amount}
              description={description}
              transactionId={transactionId}
              onSuccess={onSuccess}
              onError={onError}
            />
          </TabsContent>

          <TabsContent value="stripe" className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border">
              <div>
                <h4 className="font-medium">Stripe</h4>
                <p className="text-sm text-muted-foreground">Cartão Internacional</p>
              </div>
              <Badge variant="outline">USD</Badge>
            </div>
            <StripePayment
              amount={amount}
              description={description}
              transactionId={transactionId}
              onSuccess={onSuccess}
              onError={onError}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}