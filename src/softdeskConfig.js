require('dotenv').config({ quiet: true });

const DEFAULT_SOFTDESK_API_BASE_URL = 'https://mainhardt.soft4.com.br/api/api.php';

function getSoftdeskApiBaseUrl() {
  return (process.env.SOFTDESK_API_BASE_URL || DEFAULT_SOFTDESK_API_BASE_URL).replace(/\/$/, '');
}

function getSoftdeskHeaders() {
  const hashApi = process.env.SOFTDESK_HASH_API;

  if (!hashApi) {
    throw new Error('SOFTDESK_HASH_API nao configurado no ambiente');
  }

  return {
    'Content-Type': 'application/json',
    'hash-api': hashApi
  };
}

function buildSoftdeskUrl(pathAndQuery) {
  const normalizedPath = String(pathAndQuery || '').replace(/^\//, '');
  return `${getSoftdeskApiBaseUrl()}/${normalizedPath}`;
}

module.exports = {
  buildSoftdeskUrl,
  getSoftdeskHeaders,
  getSoftdeskApiBaseUrl
};
