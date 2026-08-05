'use strict';

const {
  TIPO_ALIASES,
  PRIORIDADE_ALIASES
} = require('../../domain/constants');

function normalizarTextoClassificacao(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizarTipo(valor) {
  const tipo = TIPO_ALIASES[normalizarTextoClassificacao(valor)];
  if (!tipo) {
    throw new Error(`Tipo nao reconhecido: ${valor}`);
  }
  return tipo;
}

function normalizarPrioridade(valor) {
  const prioridade = PRIORIDADE_ALIASES[normalizarTextoClassificacao(valor)];
  if (!prioridade) {
    throw new Error(`Prioridade nao reconhecida: ${valor}`);
  }
  return prioridade;
}

function extrairJson(texto) {
  const resposta = String(texto || '').trim();
  if (!resposta) {
    throw new Error('Resposta da IA vazia');
  }

  try {
    return JSON.parse(resposta);
  } catch (_) {
    const match = resposta.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    return JSON.parse(match[0]);
  }
}

function parseClassificacaoOpenAI(resposta) {
  const texto = String(resposta || '').trim();
  const json = extrairJson(texto);

  if (json) {
    const tipo = normalizarTipo(json.tipo);
    const prioridade = normalizarPrioridade(json.prioridade);
    const confianca = json.confianca === undefined ? null : Number(json.confianca);

    if (confianca !== null && (!Number.isFinite(confianca) || confianca < 0 || confianca > 1)) {
      throw new Error(`Confianca invalida: ${json.confianca}`);
    }

    return {
      tipo,
      prioridade,
      motivoCurto: String(json.motivo_curto || '').slice(0, 200),
      confianca
    };
  }

  const partes = texto.split('|');
  if (partes.length !== 2) {
    throw new Error(`Resposta da IA em formato invalido: ${texto}`);
  }

  return {
    tipo: normalizarTipo(partes[0]),
    prioridade: normalizarPrioridade(partes[1]),
    motivoCurto: '',
    confianca: null
  };
}

module.exports = {
  normalizarTextoClassificacao,
  normalizarTipo,
  normalizarPrioridade,
  extrairJson,
  parseClassificacaoOpenAI
};
