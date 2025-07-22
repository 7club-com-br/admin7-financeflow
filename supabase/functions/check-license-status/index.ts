import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-LICENSE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Criar cliente Supabase com service role para executar função
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Getting user from token");
    
    // Verificar usuário autenticado
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    // Chamar função do banco para verificar licença
    const { data: licenseData, error: licenseError } = await supabaseClient
      .rpc('verificar_status_licenca', { p_user_id: user.id });

    if (licenseError) {
      logStep("Error calling verificar_status_licenca", { error: licenseError });
      throw licenseError;
    }

    if (!licenseData || licenseData.length === 0) {
      logStep("No license data returned");
      throw new Error("No license data found");
    }

    const license = licenseData[0];
    logStep("License status retrieved", { 
      status: license.status, 
      dias_restantes: license.dias_restantes,
      plano_nome: license.plano_nome 
    });

    // Atualizar data de último uso
    const { error: updateError } = await supabaseClient
      .from('licencas')
      .update({ 
        data_ultimo_uso: new Date().toISOString(),
        tentativas_uso: supabaseClient.raw('tentativas_uso + 1')
      })
      .eq('user_id', user.id)
      .eq('ativa', true);

    if (updateError) {
      logStep("Warning: Could not update last usage", { error: updateError });
    }

    return new Response(JSON.stringify(license), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-license-status", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});