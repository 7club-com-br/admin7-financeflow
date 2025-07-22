import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-LICENSE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    const body = await req.json();
    const { plan_id, license_key, additional_months } = body;
    
    if (!plan_id) {
      throw new Error("Plan ID is required");
    }

    logStep("Activating license", { 
      planId: plan_id, 
      hasLicenseKey: !!license_key, 
      additionalMonths: additional_months 
    });

    // Verificar se o plano existe e está ativo
    const { data: planData, error: planError } = await supabaseClient
      .from('planos_licenca')
      .select('*')
      .eq('id', plan_id)
      .eq('ativo', true)
      .single();

    if (planError || !planData) {
      logStep("Plan not found or inactive", { planId: plan_id, error: planError });
      throw new Error("Plano não encontrado ou inativo");
    }

    // Verificar se a chave de licença já foi usada (se fornecida)
    if (license_key) {
      const { data: existingLicense, error: keyError } = await supabaseClient
        .from('licencas')
        .select('id')
        .eq('chave_licenca', license_key)
        .maybeSingle();

      if (keyError) {
        logStep("Error checking license key", { error: keyError });
        throw new Error("Erro ao verificar chave de licença");
      }

      if (existingLicense) {
        logStep("License key already used", { licenseKey: license_key });
        throw new Error("Chave de licença já foi utilizada");
      }
    }

    // Chamar função do banco para ativar licença
    const { data: activationData, error: activationError } = await supabaseClient
      .rpc('ativar_licenca', {
        p_user_id: user.id,
        p_plano_id: plan_id,
        p_chave_licenca: license_key || null,
        p_meses_adicionais: additional_months || null
      });

    if (activationError) {
      logStep("Error activating license", { error: activationError });
      throw activationError;
    }

    if (!activationData) {
      logStep("License activation failed");
      throw new Error("Falha ao ativar licença");
    }

    logStep("License activated successfully", { 
      userId: user.id, 
      planId: plan_id,
      success: activationData 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Licença ativada com sucesso",
      plan_name: planData.nome
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in activate-license", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});