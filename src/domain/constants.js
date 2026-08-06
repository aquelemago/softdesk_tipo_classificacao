'use strict';

const TIPOS = [
  'Duvida/Orientacao',
  'Incidente',
  'Requisicao'
];

const PRIORIDADES = [
  'Alta',
  'Baixa',
  'Critica',
  'Media'
];

const CODIGO_TIPO_CHAMADO = {
  'Duvida/Orientacao': 102,
  Incidente: 103,
  Requisicao: 106
};

const CODIGO_PRIORIDADE = {
  Alta: 3,
  Baixa: 1,
  Critica: 4,
  Media: 2
};

const TIPO_ALIASES = {
  'duvidaorientacao': 'Duvida/Orientacao',
  'duvida': 'Duvida/Orientacao',
  'orientacao': 'Duvida/Orientacao',
  'incidente': 'Incidente',
  'requisicao': 'Requisicao'
};

const PRIORIDADE_ALIASES = {
  'alta': 'Alta',
  'baixa': 'Baixa',
  'critica': 'Critica',
  'media': 'Media'
};

module.exports = {
  TIPOS,
  PRIORIDADES,
  CODIGO_TIPO_CHAMADO,
  CODIGO_PRIORIDADE,
  TIPO_ALIASES,
  PRIORIDADE_ALIASES
};
