const fetch = require('node-fetch');
const { buildSoftdeskUrl, getSoftdeskHeaders } = require('./config');

async function listarTiposChamado() {
  const response = await fetch(buildSoftdeskUrl('tipo-de-chamado'), {
    method: 'GET',
    headers: getSoftdeskHeaders()
  });

  const data = await response.json();
  return { status: response.status, data };
}

if (require.main === module) {
  listarTiposChamado()
    .then((result) => {
      console.log('Resultado da listagem de tipos de chamado:');
      console.dir(result, { depth: null, colors: true });
    })
    .catch((err) => {
      console.error('Erro ao listar tipos de chamado:', err);
    });
}

module.exports = listarTiposChamado;
