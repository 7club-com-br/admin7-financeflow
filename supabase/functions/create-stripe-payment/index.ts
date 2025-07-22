import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Iniciando criação de pagamento Stripe')
    
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
      amount, 
      currency = 'usd',
      description,
      transaction_id,
      metadata = {}
    } = await req.json()

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('Chave do Stripe não configurada')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16'
    })

    // Verificar se cliente já existe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined

    console.log('📝 Criando sessão de checkout')

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || 'Pagamento Admin7',
              description: `Transação: ${transaction_id || 'N/A'}`
            },
            unit_amount: Math.round(parseFloat(amount) * 100) // Converter para centavos
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}&ref=${transaction_id}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancelled?ref=${transaction_id}`,
      metadata: {
        user_id: user.id,
        transaction_id: transaction_id || '',
        ...metadata
      }
    })

    console.log('✅ Sessão criada:', session.id)

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
          observacoes: `Pagamento Stripe - Sessão: ${session.id}`
        })
        .eq('id', transaction_id)
        .eq('user_id', user.id)

      console.log('✅ Transação atualizada no banco')
    }

    return new Response(JSON.stringify({
      session_id: session.id,
      url: session.url
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Erro na função create-stripe-payment:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Verifique os logs da função para mais detalhes'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})