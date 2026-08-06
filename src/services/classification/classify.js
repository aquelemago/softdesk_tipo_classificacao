const { resolverProvider } = require('./providers/gemini');
const { chamarOpenAI } = require('./providers/openai');
const { chamarGoogleGemini } = require('./providers/gemini');
const { chamarDeepSeek } = require('./providers/deepseek');
const { buildPromptClassificacao, montarChamadoEntrada } = require('./prompt');
const { parseClassificacaoOpenAI } = require('./parser');
const { mapearClassificacaoSoftdesk } = require('./mapping');

async function classificarChamadoOpenAI(tituloOuChamado, descricao, contexto = '', options = {}) {
  const chamado = montarChamadoEntrada(tituloOuChamado, descricao, contexto);
  const prompt = buildPromptClassificacao(chamado);
  const fetchImpl = options.fetchImpl || require('node-fetch');
  const provider = resolverProvider(options);

  let resposta;
  if (provider === 'google' || provider === 'gemini') {
    resposta = await chamarGoogleGemini(prompt, chamado, fetchImpl, options);
  } else if (provider === 'openai') {
    resposta = await chamarOpenAI(prompt, chamado, fetchImpl, options);
  } else if (provider === 'deepseek') {
    resposta = await chamarDeepSeek(prompt, chamado, fetchImpl, options);
  } else {
    throw new Error(`Provider de classificacao nao reconhecido: ${provider}`);
  }

  const classificacao = parseClassificacaoOpenAI(resposta);
  const codigos = mapearClassificacaoSoftdesk(classificacao.tipo, classificacao.prioridade);

  return {
    ...codigos,
    motivoCurto: classificacao.motivoCurto,
    confianca: classificacao.confianca
  };
}

module.exports = classificarChamadoOpenAI;