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
    console.log('🚀 Iniciando criação de pagamento Mercado Pago')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    
    if (!user?.email) {
      throw new Error('Usuário não autenticado')
    }

    console.log('✅ Usuário autenticado:', user.email)

    const { 
      title, 
      description, 
      unit_price, 
      quantity = 1,
      transaction_id,
      external_reference 
    } = await req.json()

    const mercadoPagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!mercadoPagoToken) {
      throw new Error('Token do Mercado Pago não configurado')
    }

    // Criar preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          title,
          description,
          unit_price: parseFloat(unit_price),
          quantity: parseInt(quantity),
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: user.email,
        name: user.user_metadata?.name || 'Cliente'
      },
      back_urls: {
        success: `${req.headers.get('origin')}/payment-success?ref=${external_reference}`,
        failure: `${req.headers.get('origin')}/payment-failed?ref=${external_reference}`,
        pending: `${req.headers.get('origin')}/payment-pending?ref=${external_reference}`
      },
      auto_return: 'approved',
      external_reference: external_reference || transaction_id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'Admin7 Financeiro'
    }

    console.log('📝 Criando preferência:', preferenceData)

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    })

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text()
      console.error('❌ Erro Mercado Pago:', errorData)
      throw new Error(`Erro do Mercado Pago: ${mpResponse.status}`)
    }

    const preference = await mpResponse.json()
    console.log('✅ Preferência criada:', preference.id)

    // Atualizar transação no banco se transaction_id foi fornecido
    if (transaction_id) {
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      )

      await supabaseService
        .from('financeiro_lancamentos')
        .update({
          observacoes: `Pagamento Mercado Pago - Preferência: ${preference.id}`
        })
        .eq('id', transaction_id)
        .eq('user_id', user.id)

      console.log('✅ Transação atualizada no banco')
    }

    return new Response(JSON.stringify({
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Erro na função create-mercadopago-payment:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Verifique os logs da função para mais detalhes'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})