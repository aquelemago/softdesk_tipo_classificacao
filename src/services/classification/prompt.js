const { stripHtml: stripHtmlSeguro } = require('../../utils/text');
const { TIPOS, PRIORIDADES } = require('../../domain/constants');

function buildPromptClassificacao(chamado) {
  const dados = {
    codigo: chamado.codigo || '',
    titulo: String(chamado.titulo || '').trim(),
    descricao: stripHtmlSeguro(chamado.descricao || ''),
    cliente: String(chamado.cliente || '').trim(),
    status: String(chamado.status || '').trim(),
    tipoAtual: String(chamado.tipoAtual || '').trim()
  };
  return `Classifique o chamado Softdesk retornando somente JSON valido.

Enums permitidos:
- tipo: ${TIPOS.join(' | ')}
- prioridade: ${PRIORIDADES.join(' | ')}

Criterios de tipo:
- Duvida/Orientacao: duvida de uso, pedido de orientacao ou informacao.
- Incidente: erro, falha, indisponibilidade ou comportamento incorreto.
- Requisicao: solicitacao de servico, ajuste, recurso ou funcionalidade.

Criterios de prioridade:
- Critica: sistema parado, perda de dados ou impacto geral.
- Alta: impacto relevante em operacao principal ou usuario critico.
- Media: impacto parcial, contornavel ou em funcionalidade secundaria.
- Baixa: duvida, informacao, melhoria ou impacto pequeno.

Se faltar informacao de impacto, escolha a menor prioridade compativel.

Schema obrigatorio:
{
  "tipo": "Duvida/Orientacao | Incidente | Requisicao",
  "prioridade": "Baixa | Media | Alta | Critica",
  "motivo_curto": "texto curto sem dado sensivel",
  "confianca": 0.0
}

Chamado:
${JSON.stringify(dados, null, 2)}`;
}

function montarChamadoEntrada(tituloOuChamado, descricao, contexto) {
  if (tituloOuChamado && typeof tituloOuChamado === 'object') {
    return {
      contexto: tituloOuChamado.contexto || contexto || '',
      ...tituloOuChamado
    };
  }

  return {
    titulo: tituloOuChamado,
    descricao,
    contexto
  };
}

module.exports = {
  buildPromptClassificacao,
  montarChamadoEntrada
};