import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, CreditCard } from 'lucide-react'

interface StripePaymentProps {
  amount: number
  description: string
  transactionId?: string
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
}

export function StripePayment({ 
  amount, 
  description, 
  transactionId, 
  onSuccess, 
  onError 
}: StripePaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currency, setCurrency] = useState('usd')
  const { toast } = useToast()

  // Converter valor para a moeda selecionada (cotação aproximada)
  const getConvertedAmount = () => {
    switch (currency) {
      case 'eur':
        return (amount / 6.0).toFixed(2) // BRL para EUR
      case 'usd':
        return (amount / 5.5).toFixed(2) // BRL para USD
      default:
        return amount.toFixed(2)
    }
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      
      console.log('🚀 Iniciando pagamento Stripe')

      const convertedAmount = getConvertedAmount()

      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          amount: convertedAmount,
          currency: currency,
          description: description || 'Pagamento Admin7',
          transaction_id: transactionId,
          metadata: {
            original_amount_brl: amount.toString(),
            conversion_rate: currency === 'usd' ? '5.5' : '6.0'
          }
        }
      })

      if (error) {
        console.error('❌ Erro ao criar pagamento:', error)
        throw new Error(error.message || 'Erro ao processar pagamento')
      }

      console.log('✅ Resposta do Stripe:', data)

      if (data.url) {
        // Abrir checkout do Stripe em nova aba
        window.open(data.url, '_blank')
        
        toast({
          title: "Redirecionamento realizado",
          description: "Você foi redirecionado para o Stripe. Complete o pagamento na nova aba.",
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
      <div>
        <Label htmlFor="currency">Moeda</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">USD - Dólar Americano</SelectItem>
            <SelectItem value="eur">EUR - Euro</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Valor convertido: {currency.toUpperCase()} {getConvertedAmount()}
          <br />
          <span className="text-xs">(cotação aproximada)</span>
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Cartões internacionais</p>
        <p>• Visa, Mastercard, American Express</p>
        <p>• Pagamento seguro via Stripe</p>
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
            Pagar com Stripe
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Você será redirecionado para o ambiente seguro do Stripe
      </p>
    </div>
  )
}