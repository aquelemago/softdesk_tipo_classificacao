const fetch = require('node-fetch');
const { log } = require('../utils/logger');
const { buildSoftdeskUrl, getSoftdeskHeaders } = require('../src/softdeskConfig');
const { normalizarTexto } = require('../src/softdesk/mensagem');

async function testarRetornaChamadosSemTipo() {
  try {
    const response = await fetch(buildSoftdeskUrl('chamado?RetornaChamadosSemTipo'), {
      method: 'GET',
      headers: getSoftdeskHeaders()
    });

    const data = await response.json();
    log(`Status: ${response.status}`);
    log(`Resposta: ${JSON.stringify(data, null, 2)}`);

    const mensagem = normalizarTexto(data.mensagem);

    if (response.status === 200 && mensagem.includes('requisicao realizada com sucesso')) {
      log('Teste de sucesso passou!');
    } else if (response.status === 404 && mensagem.includes('filtro nao informado')) {
      log('Teste de erro (filtro nao informado) passou!');
    } else {
      log('Teste retornou resposta inesperada.', 'warn');
    }
  } catch (error) {
    log(`Erro ao testar endpoint: ${error}`, 'error');
  }
}

testarRetornaChamadosSemTipo();
