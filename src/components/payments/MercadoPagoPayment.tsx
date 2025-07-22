import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, CreditCard } from 'lucide-react'

interface MercadoPagoPaymentProps {
  amount: number
  description: string
  transactionId?: string
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
}

export function MercadoPagoPayment({ 
  amount, 
  description, 
  transactionId, 
  onSuccess, 
  onError 
}: MercadoPagoPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      
      console.log('🚀 Iniciando pagamento Mercado Pago')

      const { data, error } = await supabase.functions.invoke('create-mercadopago-payment', {
        body: {
          title: description || 'Pagamento Admin7',
          description: description,
          unit_price: amount,
          quantity: 1,
          transaction_id: transactionId,
          external_reference: transactionId || `tx_${Date.now()}`
        }
      })

      if (error) {
        console.error('❌ Erro ao criar pagamento:', error)
        throw new Error(error.message || 'Erro ao processar pagamento')
      }

      console.log('✅ Resposta do Mercado Pago:', data)

      if (data.init_point) {
        // Abrir checkout do Mercado Pago em nova aba
        window.open(data.init_point, '_blank')
        
        toast({
          title: "Redirecionamento realizado",
          description: "Você foi redirecionado para o Mercado Pago. Complete o pagamento na nova aba.",
        })

        onSuccess?.(data)
      } else {
        throw new Error('Link de pagamento não recebido')
      }

    } catch (error: any) {
      console.error('❌ Erro no pagamento:', error)
      const errorMessage = error.message || 'Erro ao processar pagamento'
      
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      })

      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p>• PIX (instantâneo)</p>
        <p>• Cartão de crédito/débito</p>
        <p>• Boleto bancário</p>
        <p>• Saldo Mercado Pago</p>
      </div>

      <Button 
        onClick={handlePayment} 
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar com Mercado Pago
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Você será redirecionado para o ambiente seguro do Mercado Pago
      </p>
    </div>
  )
}