const fetch = require('node-fetch');
const { log, logSeparator } = require('../utils/logger');
const { buildSoftdeskUrl, getSoftdeskHeaders } = require('../src/softdeskConfig');
const { mensagemSucesso } = require('../src/softdesk/mensagem');

async function listarPrioridades() {
  try {
    log('Testando listagem de prioridades...');
    logSeparator();

    const response = await fetch(buildSoftdeskUrl('prioridade'), {
      method: 'GET',
      headers: getSoftdeskHeaders()
    });

    const data = await response.json();

    log(`Status da resposta: ${response.status}`);
    log(`Mensagem: ${data.mensagem}`);
    logSeparator();

    if (response.status === 200 && mensagemSucesso(data.mensagem)) {
      if (Array.isArray(data.objeto)) {
        log(`Encontradas ${data.objeto.length} prioridades:`);
        logSeparator();

        for (const prioridade of data.objeto) {
          log(`Codigo: ${prioridade.codigo} | Descricao: ${prioridade.descricao}`);
        }

        logSeparator();
        log('Mapeamento para uso no classificador:');
        log('const codigo_prioridade = {');
        for (const prioridade of data.objeto) {
          log(`  "${prioridade.descricao}": ${prioridade.codigo},`);
        }
        log('};');
      } else {
        log('Resposta nao contem array de prioridades', 'warn');
        log(`Resposta completa: ${JSON.stringify(data, null, 2)}`);
      }
    } else {
      log('Erro na requisicao', 'error');
      log(`Resposta completa: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    log(`Erro ao testar endpoint: ${error}`, 'error');
  }
}

listarPrioridades();
