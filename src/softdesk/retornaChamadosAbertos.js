const fetch = require('node-fetch');
const { log, logSeparator } = require('../utils/logger');
const { buildSoftdeskUrl, getSoftdeskHeaders } = require('../softdeskConfig');
const { normalizarTexto, mensagemSucesso } = require('./mensagem');
const { stripHtml } = require('../utils/text');

async function buscarDetalhesChamado(codigo) {
  try {
    const response = await fetch(buildSoftdeskUrl(`chamado?codigo=${codigo}`), {
      method: 'GET',
      headers: getSoftdeskHeaders()
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      log(`Erro ao processar resposta JSON do chamado ${codigo}: ${error.message}`);
      log(`Status da resposta: ${response.status}`);
      return null;
    }

    if (
      data &&
      data.objeto &&
      data.objeto.tipo_chamado &&
      normalizarTexto(data.objeto.tipo_chamado.descricao) === 'nao classificado'
    ) {
      const obj = data.objeto;
      const clienteNome = obj.cliente?.nome || obj.cliente?.descricao || '';
      const info = [
        `Chamado: ${obj.codigo}`,
        `Cliente: ${clienteNome}`,
        `Atendente: ${obj.atendente?.nome || 'N/A'}`,
        `Tipo: ${obj.tipo_chamado?.descricao || 'N/A'}`,
        `Status: ${obj.status?.descricao || 'N/A'}`,
        `Titulo: ${obj.titulo || 'N/A'}`,
        `Descricao: ${stripHtml(obj.descricao) || 'N/A'}`
      ].join('\n');

      log(info);
      logSeparator();
      return obj;
    }

    return null;
  } catch (error) {
    log(`Erro ao buscar detalhes do chamado ${codigo}: ${error}`);
    return null;
  }
}

async function getChamadosAbertos(limit = 50) {
  const chamados = [];

  try {
    const response = await fetch(buildSoftdeskUrl(`chamado?RetornaUltimosChamadosAbertos&limit=${limit}`), {
      method: 'GET',
      headers: getSoftdeskHeaders()
    });

    const data = await response.json();
    logSeparator();

    if (response.status === 200 && mensagemSucesso(data.mensagem)) {
      if (Array.isArray(data.objeto)) {
        for (const chamado of data.objeto) {
          adicionarChamado(chamados, chamado);
        }
      } else if (data.objeto && data.objeto.codigo) {
        adicionarChamado(chamados, data.objeto);
      }

      log(`Consulta de chamados concluida: ${chamados.length} chamado(s) retornado(s).`, 'success');
    } else if (response.status === 404) {
      log('Nenhum chamado encontrado.', 'warn');
    } else {
      log('Consulta de chamados retornou resposta inesperada.', 'warn');
    }
  } catch (error) {
    log(`Erro ao consultar chamados abertos: ${error}`, 'error');
  }

  return chamados;
}

function adicionarChamado(chamados, chamado) {
  const clienteNome = chamado.cliente?.nome || chamado.cliente?.descricao || '';
  const statusDesc = chamado.status?.descricao || '';
  log(`Chamado: ${chamado.codigo} | Cliente: ${clienteNome} | Status: ${statusDesc}`);

  chamados.push({
    titulo: chamado.titulo || '',
    descricao: stripHtml(chamado.descricao || ''),
    codigo: chamado.codigo
  });
}

module.exports = getChamadosAbertos;
module.exports.buscarDetalhesChamado = buscarDetalhesChamado;
