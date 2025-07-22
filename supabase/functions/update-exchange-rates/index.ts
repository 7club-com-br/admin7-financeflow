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
    console.log('🔄 Iniciando atualização de cotações')
    
    // Buscar cotação do dólar de uma API pública
    const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    
    if (!exchangeResponse.ok) {
      throw new Error(`Erro na API de câmbio: ${exchangeResponse.status}`)
    }
    
    const exchangeData = await exchangeResponse.json()
    const usdToBrl = exchangeData.rates.BRL
    
    if (!usdToBrl) {
      throw new Error('Cotação BRL não encontrada na resposta da API')
    }

    console.log('💰 Cotação USD/BRL obtida:', usdToBrl)

    // Atualizar no banco de dados
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Inserir ou atualizar cotação
    const { error: upsertError } = await supabaseService
      .from('cotacoes')
      .upsert({
        moeda: 'USD',
        valor_brl: usdToBrl,
        data_atualizacao: new Date().toISOString(),
        fonte: 'exchangerate-api.com'
      }, {
        onConflict: 'moeda'
      })

    if (upsertError) {
      throw new Error(`Erro ao salvar cotação: ${upsertError.message}`)
    }

    console.log('✅ Cotação salva no banco de dados')

    // Chamar função para atualizar preços dos produtos Kommo
    const { error: functionError } = await supabaseService.rpc('atualizar_precos_kommo')
    
    if (functionError) {
      console.error('⚠️ Erro ao atualizar produtos Kommo:', functionError.message)
      // Não falhar a operação por este erro
    } else {
      console.log('✅ Preços dos produtos Kommo atualizados')
    }

    return new Response(JSON.stringify({
      success: true,
      usd_brl_rate: usdToBrl,
      updated_at: new Date().toISOString(),
      message: 'Cotação atualizada com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Erro na atualização de cotações:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      updated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})