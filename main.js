const getChamadosAbertos = require('./src/test-retorna-ultimos-chamados-abertos');
require('dotenv').config({ quiet: true });

const { buscarDetalhesChamado } = require('./src/test-retorna-ultimos-chamados-abertos');
const { log, stripHtml } = require('./utils/logger');
const classificarChamadoOpenAI = require('./utils/classificador_openai');
const { montarPayloadAtualizacao } = require('./utils/classificador_openai');
const editarChamado = require('./src/editarChamado');

const contexto = 'VocÃª Ã© um analista de suporte que irÃ¡ classificar chamados de acordo com tipo e prioridade.';

const DRY_RUN = process.env.DRY_RUN === 'true';
const CLASSIFICADOR_PROVIDER = process.env.CLASSIFICADOR_PROVIDER || 'openai';

async function main() {
  const limit = parseInt(process.argv[2], 10) || 50;
  log('='.repeat(80));
  log('ðŸš€ Iniciando processamento dos chamados...');
  const chamados = await getChamadosAbertos(limit);
  log(`Total de chamados para classificar: ${chamados.length}`);
  
  for (const chamado of chamados) {
    try {
      let bloco = '';
      
      // Delay entre requisiÃ§Ãµes para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de delay
      
      // Detalhamento do chamado
      const detalhesRetorno = await buscarDetalhesChamado(chamado.codigo, true);
      if (!detalhesRetorno) {
        continue;
      }
      const obj = detalhesRetorno;
      
      // ClassificaÃ§Ã£o via OpenAI
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
      
      bloco += `ðŸ¤– ClassificaÃ§Ã£o IA para chamado ${obj.codigo}:\n    TÃ­tulo: ${obj.titulo}\n    Tipo sugerido: ${classificacao.tipo} - ${classificacao.tipoDescricao}\n    Prioridade sugerida: ${classificacao.prioridade} - ${classificacao.prioridadeDescricao}\n`;
      
      // Editar o chamado com o tipo e prioridade classificados
      log(`ðŸ“ Editando chamado ${obj.codigo} com tipo ${classificacao.tipo} e prioridade ${classificacao.prioridade}...`);
      const payload = montarPayloadAtualizacao(obj.codigo, classificacao);
      
      if (DRY_RUN) {
        bloco += `DRY_RUN ativo: chamado ${obj.codigo} nao foi atualizado no Softdesk. Payload validado: tipo ${payload.tipo_chamado.codigo}, prioridade ${payload.prioridade.codigo}\n`;
      } else {
        const editRes = await editarChamado(payload);
      bloco += `ðŸ“ Resultado ediÃ§Ã£o chamado: Status ${editRes.status} - ${editRes.data?.mensagem || ''}\n`;
      bloco += 'âœ… Processo concluÃ­do para este chamado.\n';
      
      }
      
      log('-'.repeat(80));
      log(bloco.trim());
      log('-'.repeat(80));
      
    } catch (err) {
      log('-'.repeat(80));
      log('âŒ Erro ao processar chamado: ' + err, 'error');
      log('-'.repeat(80));
    }
  }
  
  log('ðŸ Processamento finalizado.');
  log('='.repeat(80));
}

main(); 
