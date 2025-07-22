// supabase/functions/kommo-oauth-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface OAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface KommoAccount {
  id: number;  // ID da conta Kommo
  name: string; // Nome da conta
  subdomain: string; // Subdomínio da conta (ex: empresa.kommo.com)
  created_at: number; // Data de criação da conta em timestamp
  country: string; // País da conta
  currency: string; // Moeda da conta
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

// Obtém informações de um serviço OAuth pelo nome
async function getOAuthServiceInfo(serviceName: string) {
  const { data, error } = await supabaseClient
    .from("oauth_services")
    .select("*")
    .eq("name", serviceName)
    .single();

  if (error) throw error;
  return data;
}

// Verifica se um usuário com o ID Kommo específico já existe
async function getUserByKommoId(kommoId: number) {
  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id_kommo", kommoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Cria um novo usuário com informações do Kommo
async function createUserFromKommo(kommoData: KommoAccount, email: string) {
  const { data, error } = await supabaseClient
    .from("users")
    .insert({
      name: kommoData.name,
      email: email || `kommo_${kommoData.id}@example.com`,
      id_kommo: kommoData.id,
      subdominio: kommoData.subdomain,
      origem: "kommo",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Cria uma nova licença trial para um usuário
async function createTrialLicense(userId: string) {
  const now = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(now.getDate() + 7); // 7 dias de trial

  const { data, error } = await supabaseClient
    .from("licencas")
    .insert({
      user_id: userId,
      ativa: true,
      data_inicio: now.toISOString(),
      data_vencimento: expirationDate.toISOString(),
      status: "trial",
      tipo_plano: "trial",
      valor: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Armazena as credenciais OAuth para um usuário/licença
async function storeOAuthCredentials(userId: string, licenseId: string, serviceId: string, data: OAuthResponse, kommoId: number) {
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setSeconds(now.getSeconds() + data.expires_in);

  const { data: credential, error } = await supabaseClient
    .from("oauth_credentials")
    .insert({
      user_id: userId,
      licenca_id: licenseId,
      service_id: serviceId,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_at: expiresAt.toISOString(),
      account_id: kommoId.toString(),
    })
    .select()
    .single();

  if (error) throw error;
  return credential;
}

// Troca um código de autorização por tokens
async function exchangeCodeForToken(code: string, serviceInfo: any) {
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
      grant_type: "authorization_code",
      code: code,
      redirect_uri: `${Deno.env.get("PUBLIC_SITE_URL")}/api/kommo/oauth`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao trocar o código:", errorText);
    throw new Error(`Falha ao obter token: ${response.status} ${errorText}`);
  }

  return await response.json() as OAuthResponse;
}

// Obtém informações da conta Kommo
async function getKommoAccountInfo(accessToken: string) {
  const response = await fetch("https://api.kommo.com/api/v4/account", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter informações da conta: ${response.status}`);
  }

  const data = await response.json();
  return data.account as KommoAccount;
}

serve(async (req) => {
  // Lidar com solicitações CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const referer = url.searchParams.get("referer") || Deno.env.get("PUBLIC_SITE_URL");
    
    if (!code) {
      // Redirecionar para a página de erro se não houver código
      return Response.redirect(`${referer}?installation_error=true&error_message=${encodeURIComponent("Código de autorização não fornecido")}`);
    }

    // Obter informações do serviço OAuth para Kommo
    const serviceInfo = await getOAuthServiceInfo("Kommo");
    
    // Trocar o código por tokens
    const tokens = await exchangeCodeForToken(code, serviceInfo);
    
    // Obter informações da conta Kommo
    const accountInfo = await getKommoAccountInfo(tokens.access_token);
    
    // Verificar se o usuário já existe pelo ID Kommo
    let user = await getUserByKommoId(accountInfo.id);
    
    // Criar um novo usuário se não existir
    if (!user) {
      user = await createUserFromKommo(accountInfo, "");
    }
    
    // Buscar a licença ativa do usuário
    const { data: existingLicenses } = await supabaseClient
      .from("licencas")
      .select("*")
      .eq("user_id", user.id)
      .eq("ativa", true)
      .order("created_at", { ascending: false })
      .limit(1);
      
    // Criar uma nova licença trial se não houver nenhuma ativa
    let license;
    if (!existingLicenses || existingLicenses.length === 0) {
      license = await createTrialLicense(user.id);
    } else {
      license = existingLicenses[0];
    }
    
    // Armazenar credenciais OAuth
    await storeOAuthCredentials(user.id, license.id, serviceInfo.id, tokens, accountInfo.id);
    
    // Redirecionar para a página de sucesso
    return Response.redirect(`${referer}?installation_success=true`);
  } catch (error) {
    console.error("Erro:", error.message);
    const referer = new URL(req.url).searchParams.get("referer") || Deno.env.get("PUBLIC_SITE_URL");
    
    // Redirecionar para a página de erro
    return Response.redirect(`${referer}?installation_error=true&error_message=${encodeURIComponent(error.message)}`);
  }
});
