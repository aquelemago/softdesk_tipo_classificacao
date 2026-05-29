const fetch = require('node-fetch');
const { buildSoftdeskUrl, getSoftdeskHeaders } = require('./softdeskConfig');

async function editarChamado(payload) {
  const response = await fetch(buildSoftdeskUrl('chamado'), {
    method: 'PUT',
    headers: getSoftdeskHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return { status: response.status, data };
}

module.exports = editarChamado;
