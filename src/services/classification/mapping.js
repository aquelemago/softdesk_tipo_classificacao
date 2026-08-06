'use strict';

const {
  CODIGO_TIPO_CHAMADO,
  CODIGO_PRIORIDADE
} = require('../../domain/constants');
const {
  normalizarTipo,
  normalizarPrioridade
} = require('./parser');

function mapearClassificacaoSoftdesk(tipo, prioridade) {
  const tipoNormalizado = normalizarTipo(tipo);
  const prioridadeNormalizada = normalizarPrioridade(prioridade);
  const codigoTipo = CODIGO_TIPO_CHAMADO[tipoNormalizado];
  const codigoPrioridade = CODIGO_PRIORIDADE[prioridadeNormalizada];

  if (!codigoTipo) {
    throw new Error(`Tipo sem codigo Softdesk: ${tipoNormalizado}`);
  }

  if (!codigoPrioridade) {
    throw new Error(`Prioridade sem codigo Softdesk: ${prioridadeNormalizada}`);
  }

  return {
    tipo: codigoTipo,
    prioridade: codigoPrioridade,
    tipoDescricao: tipoNormalizado,
    prioridadeDescricao: prioridadeNormalizada
  };
}

function montarPayloadAtualizacao(codigo, classificacao) {
  if (!codigo) {
    throw new Error('Codigo do chamado nao informado');
  }

  if (!classificacao?.tipo || !classificacao?.prioridade) {
    throw new Error('Classificacao incompleta para montar payload');
  }

  return {
    codigo,
    tipo_chamado: {
      codigo: classificacao.tipo
    },
    prioridade: {
      codigo: classificacao.prioridade
    }
  };
}

module.exports = {
  mapearClassificacaoSoftdesk,
  montarPayloadAtualizacao
};
