import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔔 Webhook Mercado Pago recebido')
    
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const body = await req.json()
    console.log('📝 Dados do webhook:', body)

    // Mercado Pago envia notificações de diferentes tipos
    if (body.type === 'payment') {
      const paymentId = body.data.id
      const mercadoPagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

      if (!mercadoPagoToken) {
        throw new Error('Token do Mercado Pago não configurado')
      }

      // Buscar informações do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`
        }
      })

      if (!paymentResponse.ok) {
        throw new Error('Erro ao buscar dados do pagamento')
      }

      const payment = await paymentResponse.json()
      console.log('💰 Dados do pagamento:', {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference
      })

      // Se o pagamento foi aprovado e temos uma referência externa
      if (payment.status === 'approved' && payment.external_reference) {
        const transactionId = payment.external_reference

        // Atualizar a transação no banco
        const { error } = await supabaseService
          .from('financeiro_lancamentos')
          .update({
            status: 'pago',
            data_pagamento: new Date().toISOString().split('T')[0],
            observacoes: `Pago via Mercado Pago - ID: ${payment.id} - Status: ${payment.status}`
          })
          .eq('id', transactionId)

        if (error) {
          console.error('❌ Erro ao atualizar transação:', error)
        } else {
          console.log('✅ Transação atualizada para pago')
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Erro no webhook Mercado Pago:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})