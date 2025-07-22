// supabase/functions/kommo-refresh-tokens/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface OAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Cria um cliente do Supabase usando as variáveis de ambiente
const supabaseClient = createClient(
  // URL do Supabase
  Deno.env.get("SUPABASE_URL") ?? "",
  // Chave de serviço (service key) do Supabase
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Obtém credenciais próximas de expirar
async function getCredentialsToRefresh(credentialId?: string) {
  // Calcular data de expiração próxima (1 dia de margem)
  const expirationThreshold = new Date();
  expirationThreshold.setDate(expirationThreshold.getDate() + 1);
  
  let query = supabaseClient
    .from("oauth_credentials")
    .select("*, oauth_services(*)")
    .lt("expires_at", expirationThreshold.toISOString())
    .eq("oauth_services.name", "Kommo");
    
  if (credentialId) {
    query = query.eq("id", credentialId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// Atualiza os tokens usando o refresh_token
async function refreshTokens(credential: any) {
  const serviceInfo = credential.oauth_services;
  
  // Substituir variáveis de ambiente nos IDs de cliente/segredo
  const clientId = serviceInfo.client_id.includes("_ENV") 
    ? Deno.env.get(serviceInfo.client_id.replace("_ENV", "")) 
    : serviceInfo.client_id;
    
  const clientSecret = serviceInfo.client_secret.includes("_ENV") 
    ? Deno.env.get(serviceInfo.client_secret.replace("_ENV", "")) 
    : serviceInfo.client_secret;

  const response = await fetch(serviceInfo.token_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: credential.refresh_token,
      redirect_uri: `${Deno.env.get("PUBLIC_SITE_URL")}/api/kommo/oauth`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao atualizar token: ${response.status}`);
  }

  return await response.json() as OAuthResponse;
}

// Atualiza as credenciais no banco de dados
async function updateCredentials(credentialId: string, tokens: OAuthResponse) {
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setSeconds(now.getSeconds() + tokens.expires_in);

  const { data, error } = await supabaseClient
    .from("oauth_credentials")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", credentialId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

serve(async (req) => {
  // Lidar com solicitações CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar se há um ID de credencial específico na solicitação
    let credentialId;
    if (req.method === "POST") {
      const body = await req.json();
      credentialId = body.credential_id;
    }
    
    // Obter credenciais para atualizar
    const credentials = await getCredentialsToRefresh(credentialId);
    
    if (credentials.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhuma credencial para atualizar" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // Atualizar cada credencial
    const results = [];
    for (const credential of credentials) {
      try {
        const newTokens = await refreshTokens(credential);
        const updatedCredential = await updateCredentials(credential.id, newTokens);
        results.push({ 
          id: credential.id, 
          success: true, 
          message: "Token atualizado com sucesso" 
        });
      } catch (error) {
        console.error(`Erro ao atualizar credencial ${credential.id}:`, error.message);
        results.push({ 
          id: credential.id, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Erro:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
