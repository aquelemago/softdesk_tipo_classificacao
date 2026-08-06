// Facade for backward compatibility with tests
// Re-exports all public API from the new classification modules

const { TIPOS, PRIORIDADES } = require('../src/domain/constants');
const { buildPromptClassificacao, montarChamadoEntrada } = require('../src/services/classification/prompt');
const { parseClassificacaoOpenAI } = require('../src/services/classification/parser');
const { mapearClassificacaoSoftdesk, montarPayloadAtualizacao } = require('../src/services/classification/mapping');
const { normalizarTextoClassificacao } = require('../src/services/classification/parser');
const { stripHtmlSeguro } = require('../src/utils/text');
const { resolverProvider, resolverIntervaloMinimoGeminiMs, resolverLimiteGeminiRpd, formatarDataLocal, parseRetryAfterMs, parseGeminiRetryDelayMs } = require('../src/services/classification/providers/gemini');
const classificarChamadoOpenAI = require('../src/services/classification/classify');

// Re-export all functions for test compatibility
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
module.exports.resolverProvider = resolverProvider;
module.exports.resolverIntervaloMinimoGeminiMs = resolverIntervaloMinimoGeminiMs;
module.exports.resolverLimiteGeminiRpd = resolverLimiteGeminiRpd;
module.exports.formatarDataLocal = formatarDataLocal;
module.exports.parseRetryAfterMs = parseRetryAfterMs;
module.exports.parseGeminiRetryDelayMs = parseGeminiRetryDelayMs;