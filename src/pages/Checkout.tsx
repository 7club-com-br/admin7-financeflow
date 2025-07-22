import { PaymentConfig } from '@/components/system/PaymentConfig'
import { CreditCard } from 'lucide-react'

export default function Checkout() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Pagamento</h1>
          <p className="text-muted-foreground">
            Configure os gateways de pagamento para processar transações
          </p>
        </div>
      </div>

      <PaymentConfig />
    </div>
  )
}