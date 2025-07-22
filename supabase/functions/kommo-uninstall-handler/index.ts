// supabase/functions/kommo-uninstall-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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

// Marca licenças como inativas para um ID de conta Kommo
async function deactivateLicensesByKommoAccount(kommoAccountId: string) {
  // Primeiro, encontrar o usuário com esse ID Kommo
  const { data: user, error: userError } = await supabaseClient
    .from("users")
    .select("id")
    .eq("id_kommo", kommoAccountId)
    .maybeSingle();

  if (userError) throw userError;
  if (!user) throw new Error(`Usuário com ID Kommo ${kommoAccountId} não encontrado`);

  // Buscar credenciais OAuth do usuário
  const { data: credentials, error: credError } = await supabaseClient
    .from("oauth_credentials")
    .select("licenca_id")
    .eq("user_id", user.id)
    .eq("account_id", kommoAccountId.toString());

  if (credError) throw credError;
  if (!credentials || credentials.length === 0) {
    throw new Error(`Credenciais para usuário ${user.id} não encontradas`);
  }

  // Extrair os IDs de licença únicos
  const licenseIds = [...new Set(credentials.map(cred => cred.licenca_id))];

  // Atualizar cada licença para inativa
  for (const licenseId of licenseIds) {
    const { error: updateError } = await supabaseClient
      .from("licencas")
      .update({
        ativa: false,
        status: "cancelado",
        data_cancelamento: new Date().toISOString(),
      })
      .eq("id", licenseId);

    if (updateError) throw updateError;
  }

  return { success: true, licenseIds };
}

serve(async (req) => {
  // Lidar com solicitações CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const accountId = url.searchParams.get("account_id");
    const referer = url.searchParams.get("referer") || Deno.env.get("PUBLIC_SITE_URL");
    
    if (!accountId) {
      // Redirecionar para a página de erro se não houver ID de conta
      return Response.redirect(`${referer}?uninstall_error=true&error_message=${encodeURIComponent("ID da conta Kommo não fornecido")}`);
    }

    // Marcar licenças como inativas
    await deactivateLicensesByKommoAccount(accountId);
    
    // Redirecionar para a página de sucesso
    return Response.redirect(`${referer}?uninstall_success=true`);
  } catch (error) {
    console.error("Erro na desinstalação:", error.message);
    const referer = new URL(req.url).searchParams.get("referer") || Deno.env.get("PUBLIC_SITE_URL");
    
    // Redirecionar para a página de erro
    return Response.redirect(`${referer}?uninstall_error=true&error_message=${encodeURIComponent(error.message)}`);
  }
});
