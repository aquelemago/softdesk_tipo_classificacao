const getChamadosAbertos = require('./src/test-retorna-ultimos-chamados-abertos');
require('dotenv').config({ quiet: true });

const { buscarDetalhesChamado } = require('./src/test-retorna-ultimos-chamados-abertos');
const { log, stripHtml } = require('./utils/logger');
const classificarChamadoOpenAI = require('./utils/classificador_openai');
const { montarPayloadAtualizacao } = require('./utils/classificador_openai');
const { resolverLimiteGeminiRpd } = require('./utils/classificador_openai');
const editarChamado = require('./src/editarChamado');

const contexto = 'Voce e um analista de suporte que ira classificar chamados de acordo com tipo e prioridade.';

const DRY_RUN = process.env.DRY_RUN === 'true';
const CLASSIFICADOR_PROVIDER = process.env.CLASSIFICADOR_PROVIDER || 'openai';

function resolverLimiteExecucao() {
  const limiteSolicitado = parseInt(process.argv[2], 10) || 50;
  const provider = String(CLASSIFICADOR_PROVIDER).toLowerCase();

  if (provider !== 'google' && provider !== 'gemini') {
    return limiteSolicitado;
  }

  const limiteDiarioGemini = resolverLimiteGeminiRpd();
  if (limiteDiarioGemini <= 0) {
    return limiteSolicitado;
  }

  return Math.min(limiteSolicitado, limiteDiarioGemini);
}

async function main() {
  const limit = resolverLimiteExecucao();
  log('='.repeat(80));
  log('[INICIO] Iniciando processamento dos chamados...');
  log(`Limite desta execucao: ${limit}`);
  const chamados = await getChamadosAbertos(limit);
  log(`Total de chamados para classificar: ${chamados.length}`);
  
  for (const chamado of chamados) {
    try {
      let bloco = '';
      
      // Delay entre requisicoes para evitar rate limiting.
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de delay
      
      // Detalhamento do chamado
      const detalhesRetorno = await buscarDetalhesChamado(chamado.codigo, true);
      if (!detalhesRetorno) {
        continue;
      }
      const obj = detalhesRetorno;
      
      // Classificacao via IA.
      log(`Classificando chamado ${obj.codigo} via ${CLASSIFICADOR_PROVIDER}...`);
      const classificacao = await classificarChamadoOpenAI({
        codigo: obj.codigo,
        titulo: obj.titulo || '',
        descricao: stripHtml(obj.descricao || ''),
        cliente: obj.cliente?.nome || obj.cliente?.descricao || '',
        status: obj.status?.descricao || '',
        tipoAtual: obj.tipo_chamado?.descricao || '',
        contexto
      });
      
      bloco += `[IA] Classificacao IA para chamado ${obj.codigo}:\n    Titulo: ${obj.titulo}\n    Tipo sugerido: ${classificacao.tipo} - ${classificacao.tipoDescricao}\n    Prioridade sugerida: ${classificacao.prioridade} - ${classificacao.prioridadeDescricao}\n`;
      
      // Editar o chamado com o tipo e prioridade classificados
      log(`[SOFTDESK] Editando chamado ${obj.codigo} com tipo ${classificacao.tipo} e prioridade ${classificacao.prioridade}...`);
      const payload = montarPayloadAtualizacao(obj.codigo, classificacao);
      
      if (DRY_RUN) {
        bloco += `DRY_RUN ativo: chamado ${obj.codigo} nao foi atualizado no Softdesk. Payload validado: tipo ${payload.tipo_chamado.codigo}, prioridade ${payload.prioridade.codigo}\n`;
      } else {
        const editRes = await editarChamado(payload);
        bloco += `[SOFTDESK] Resultado edicao chamado: Status ${editRes.status} - ${editRes.data?.mensagem || ''}\n`;
        bloco += '[OK] Processo concluido para este chamado.\n';
      
      }
      
      log('-'.repeat(80));
      log(bloco.trim());
      log('-'.repeat(80));
      
    } catch (err) {
      log('-'.repeat(80));
      log('[ERRO] Erro ao processar chamado: ' + err, 'error');
      log('-'.repeat(80));
    }
  }
  
  log('[FIM] Processamento finalizado.');
  log('='.repeat(80));
}

main(); 
