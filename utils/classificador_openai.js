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

const GEMINI_RPM_PADRAO = 10;
const GEMINI_RPD_PADRAO = 20;
const GEMINI_MAX_RETRIES_PADRAO = 3;
const GEMINI_BACKOFF_BASE_MS_PADRAO = 2000;
const GEMINI_BACKOFF_MAX_MS_PADRAO = 30000;
const GEMINI_QUOTA_FILE_PADRAO = path.join(__dirname, '..', 'runtime', 'gemini-quota-usage.json');

let proximaChamadaGeminiEm = 0;
let filaGemini = Promise.resolve();
let filaQuotaGemini = Promise.resolve();





function resolverProvider(options = {}) {
  return String(options.provider || process.env.CLASSIFICADOR_PROVIDER || 'openai').toLowerCase();
}

function lerInteiroConfiguracao(valor, padrao) {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isFinite(numero) || numero < 0) {
    return padrao;
  }
  return numero;
}

function resolverLimiteGeminiRpm(options = {}) {
  return lerInteiroConfiguracao(
    options.geminiRpm ?? process.env.GOOGLE_GEMINI_RPM,
    GEMINI_RPM_PADRAO
  );
}

function resolverIntervaloMinimoGeminiMs(options = {}) {
  const rpm = resolverLimiteGeminiRpm(options);
  const intervaloPorRpm = rpm <= 0 ? 0 : Math.ceil(60000 / rpm);

  if (options.geminiMinIntervalMs !== undefined) {
    return lerInteiroConfiguracao(options.geminiMinIntervalMs, intervaloPorRpm);
  }

  if (process.env.GOOGLE_GEMINI_MIN_INTERVAL_MS !== undefined) {
    return Math.max(
      lerInteiroConfiguracao(process.env.GOOGLE_GEMINI_MIN_INTERVAL_MS, intervaloPorRpm),
      intervaloPorRpm
    );
  }

  return intervaloPorRpm;
}

function resolverLimiteGeminiRpd(options = {}) {
  return lerInteiroConfiguracao(
    options.geminiRpd ?? process.env.GOOGLE_GEMINI_RPD,
    GEMINI_RPD_PADRAO
  );
}

function formatarDataLocal(date = new Date()) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function lerUsoGeminiDiario(quotaFilePath, dateKey) {
  try {
    const conteudo = fs.readFileSync(quotaFilePath, 'utf8');
    const uso = JSON.parse(conteudo);
    if (uso?.date === dateKey && Number.isFinite(Number(uso.count))) {
      return Number(uso.count);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      return 0;
    }
  }

  return 0;
}

function gravarUsoGeminiDiario(quotaFilePath, dateKey, count) {
  fs.mkdirSync(path.dirname(quotaFilePath), { recursive: true });
  fs.writeFileSync(quotaFilePath, JSON.stringify({ date: dateKey, count }, null, 2));
}

async function reservarCotaDiariaGemini(options = {}) {
  const limiteDiario = resolverLimiteGeminiRpd(options);
  if (limiteDiario <= 0) {
    return;
  }

  const nowImpl = options.nowImpl || Date.now;
  const quotaFilePath = options.geminiQuotaFilePath || process.env.GOOGLE_GEMINI_QUOTA_FILE || GEMINI_QUOTA_FILE_PADRAO;
  const dateKey = formatarDataLocal(new Date(nowImpl()));
  const slotAnterior = filaQuotaGemini.catch(() => {});

  filaQuotaGemini = slotAnterior.then(async () => {
    const usoAtual = lerUsoGeminiDiario(quotaFilePath, dateKey);
    if (usoAtual >= limiteDiario) {
      throw new Error(`Limite diario local do Gemini atingido: ${usoAtual}/${limiteDiario} requisicoes em ${dateKey}`);
    }

    gravarUsoGeminiDiario(quotaFilePath, dateKey, usoAtual + 1);
  });

  await filaQuotaGemini;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseRetryAfterMs(headers, nowImpl = Date.now) {
  const retryAfter = headers?.get?.('Retry-After') || headers?.get?.('retry-after');
  if (!retryAfter) {
    return null;
  }

  const segundos = Number(retryAfter);
  if (Number.isFinite(segundos)) {
    return Math.max(0, segundos * 1000);
  }

  const data = Date.parse(retryAfter);
  if (Number.isFinite(data)) {
    return Math.max(0, data - nowImpl());
  }

  return null;
}

function parseDuracaoGoogleMs(valor) {
  const match = String(valor || '').match(/^(\d+(?:\.\d+)?)s$/);
  if (!match) {
    return null;
  }

  return Math.ceil(Number(match[1]) * 1000);
}

function parseGeminiRetryDelayMs(data) {
  const detalhes = data?.error?.details;
  if (Array.isArray(detalhes)) {
    for (const detalhe of detalhes) {
      const delay = parseDuracaoGoogleMs(detalhe?.retryDelay);
      if (delay !== null) {
        return delay;
      }
    }
  }

  const mensagem = data?.error?.message || data?.message || '';
  const match = String(mensagem).match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  if (!match) {
    return null;
  }

  return Math.ceil(Number(match[1]) * 1000);
}

function deveTentarNovamenteGemini(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function calcularEsperaGemini(attempt, response, data, options = {}) {
  const nowImpl = options.nowImpl || Date.now;
  const retryAfterMs = parseRetryAfterMs(response?.headers, nowImpl);
  if (retryAfterMs !== null) {
    return retryAfterMs;
  }

  const retryDelayMs = parseGeminiRetryDelayMs(data);
  if (retryDelayMs !== null) {
    return retryDelayMs;
  }

  const baseMs = lerInteiroConfiguracao(
    options.geminiBackoffBaseMs ?? process.env.GOOGLE_GEMINI_BACKOFF_BASE_MS,
    GEMINI_BACKOFF_BASE_MS_PADRAO
  );
  const maxMs = lerInteiroConfiguracao(
    options.geminiBackoffMaxMs ?? process.env.GOOGLE_GEMINI_BACKOFF_MAX_MS,
    GEMINI_BACKOFF_MAX_MS_PADRAO
  );

  return Math.min(maxMs, baseMs * (2 ** attempt));
}

async function aguardarIntervaloMinimoGemini(options = {}) {
  const minIntervalMs = resolverIntervaloMinimoGeminiMs(options);

  if (minIntervalMs <= 0) {
    return;
  }

  const sleepImpl = options.sleepImpl || sleep;
  const nowImpl = options.nowImpl || Date.now;
  const slotAnterior = filaGemini.catch(() => {});

  filaGemini = slotAnterior.then(async () => {
    const agora = nowImpl();
    const esperaMs = Math.max(0, proximaChamadaGeminiEm - agora);
    if (esperaMs > 0) {
      await sleepImpl(esperaMs);
    }

    proximaChamadaGeminiEm = Math.max(agora, proximaChamadaGeminiEm) + minIntervalMs;
  });

  await filaGemini;
}



async function chamarGoogleGemini(prompt, chamado, fetchImpl, options = {}) {
  const model = options.model || process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const maxRetries = lerInteiroConfiguracao(
    options.geminiMaxRetries ?? process.env.GOOGLE_GEMINI_MAX_RETRIES,
    GEMINI_MAX_RETRIES_PADRAO
  );
  const sleepImpl = options.sleepImpl || sleep;

  let ultimoErro;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    await aguardarIntervaloMinimoGemini(options);
    await reservarCotaDiariaGemini(options);

    const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey || ''
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            { text: chamado.contexto || 'Voce e um analista de suporte que classifica chamados Softdesk.' }
          ]
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 180,
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await response.json();
    if (response.ok) {
      return data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim() || '';
    }

    ultimoErro = new Error(`Google Gemini API error: ${data.error?.message || 'Unknown error'}`);
    if (!deveTentarNovamenteGemini(response.status) || attempt >= maxRetries) {
      throw ultimoErro;
    }

    await sleepImpl(calcularEsperaGemini(attempt, response, data, options));
  }

  throw ultimoErro;
}

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
module.exports.resolverProvider = resolverProvider;
module.exports.resolverIntervaloMinimoGeminiMs = resolverIntervaloMinimoGeminiMs;
module.exports.resolverLimiteGeminiRpd = resolverLimiteGeminiRpd;
module.exports.formatarDataLocal = formatarDataLocal;
module.exports.parseRetryAfterMs = parseRetryAfterMs;
module.exports.parseGeminiRetryDelayMs = parseGeminiRetryDelayMs;
