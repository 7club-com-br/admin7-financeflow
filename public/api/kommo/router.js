// Proxy para encaminhar chamadas das API do Kommo para as funções Edge no Supabase
// Coloque este arquivo na pasta /public para que o Vite o disponibilize como um endpoint

// Este script é executado pelo navegador, então usamos fetch para fazer as chamadas
// Funciona como um redirecionador para as funções Edge

// Função para extrair parâmetros da URL
function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  
  return params;
}

// Função para construir a URL da função Edge com os parâmetros atuais
function buildEdgeFunctionUrl(endpoint) {
  const params = getQueryParams();
  const supabaseUrl = 'https://mitevjfisvxnhvzyxded.supabase.co'; // Substitua pelo seu URL Supabase
  
  let url = `${supabaseUrl}/functions/v1/${endpoint}?`;
  
  // Adicionar todos os parâmetros atuais à URL
  Object.keys(params).forEach(key => {
    url += `${key}=${encodeURIComponent(params[key])}&`;
  });
  
  // Adicionar o referer atual
  url += `referer=${encodeURIComponent(window.location.origin + '/kommo-integration')}`;
  
  return url;
}

// Determinar qual endpoint chamar com base no caminho
const path = window.location.pathname;

if (path.includes('/api/kommo/oauth')) {
  // Redirecionar para a função Edge de OAuth
  window.location.href = buildEdgeFunctionUrl('kommo-oauth-handler');
} else if (path.includes('/api/kommo/uninstall')) {
  // Redirecionar para a função Edge de desinstalação
  window.location.href = buildEdgeFunctionUrl('kommo-uninstall-handler');
} else {
  // Exibir erro se o endpoint não for reconhecido
  document.body.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h1>Erro 404</h1>
      <p>Endpoint não encontrado: ${path}</p>
      <p><a href="/">Voltar para a página inicial</a></p>
    </div>
  `;
}
