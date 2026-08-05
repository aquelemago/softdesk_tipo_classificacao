function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function mensagemSucesso(mensagem) {
  return normalizarTexto(mensagem).includes('requisicao realizada com sucesso');
}

module.exports = { normalizarTexto, mensagemSucesso };