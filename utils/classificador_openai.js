require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { stripHtml: stripHtmlSeguro } = require('../src/utils/text');
const {
  TIPOS,
  PRIORIDADES,
  CODIGO_TIPO_CHAMADO,
  CODIGO_PRIORIDADE,
  TIPO_ALIASES,
  PRIORIDADE_ALIASES
} = require('../src/domain/constants');
const {
  normalizarTextoClassificacao,
  normalizarTipo,
  normalizarPrioridade,
  extrairJson,
  parseClassificacaoOpenAI
} = require('../src/services/classification/parser');
const {
  mapearClassificacaoSoftdesk,
  montarPayloadAtualizacao
} = require('../src/services/classification/mapping');
const {
  buildPromptClassificacao,
  montarChamadoEntrada
} = require('../src/services/classification/prompt');
const { chamarOpenAI } = require('../src/services/classification/providers/openai');
const {
  chamarGoogleGemini,
  resolverProvider,
  resolverIntervaloMinimoGeminiMs,
  resolverLimiteGeminiRpd,
  formatarDataLocal,
  parseRetryAfterMs,
  parseGeminiRetryDelayMs
} = require('../src/services/classification/providers/gemini');







async function classificarChamadoOpenAI(tituloOuChamado, descricao, contexto = '', options = {}) {
  const chamado = montarChamadoEntrada(tituloOuChamado, descricao, contexto);
  const prompt = buildPromptClassificacao(chamado);
  const fetchImpl = options.fetchImpl || fetch;
  const provider = resolverProvider(options);

  let resposta;
  if (provider === 'google' || provider === 'gemini') {
    resposta = await chamarGoogleGemini(prompt, chamado, fetchImpl, options);
  } else if (provider === 'openai') {
    resposta = await chamarOpenAI(prompt, chamado, fetchImpl, options);
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
module.exports.TIPOS = TIPOS;
module.exports.PRIORIDADES = PRIORIDADES;
module.exports.buildPromptClassificacao = buildPromptClassificacao;
module.exports.parseClassificacaoOpenAI = parseClassificacaoOpenAI;
module.exports.mapearClassificacaoSoftdesk = mapearClassificacaoSoftdesk;
module.exports.montarPayloadAtualizacao = montarPayloadAtualizacao;
module.exports.montarChamadoEntrada = montarChamadoEntrada;
module.exports.normalizarTextoClassificacao = normalizarTextoClassificacao;
module.exports.stripHtmlSeguro = stripHtmlSeguro;

