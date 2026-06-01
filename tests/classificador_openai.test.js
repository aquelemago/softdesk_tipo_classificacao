const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const classificarChamadoOpenAI = require('../utils/classificador_openai');
const {
  buildPromptClassificacao,
  formatarDataLocal,
  parseClassificacaoOpenAI,
  mapearClassificacaoSoftdesk,
  montarPayloadAtualizacao,
  parseGeminiRetryDelayMs,
  parseRetryAfterMs,
  resolverIntervaloMinimoGeminiMs,
  resolverLimiteGeminiRpd,
  stripHtmlSeguro
} = require('../utils/classificador_openai');

test('buildPromptClassificacao remove HTML da descricao e pede JSON', () => {
  const prompt = buildPromptClassificacao({
    codigo: 123,
    titulo: 'Erro ao emitir relatorio',
    descricao: '<p>Falha ao abrir</p><script>alert(1)</script><br>Sem acesso',
    cliente: 'Cliente teste',
    status: 'Aberto',
    tipoAtual: 'Nao Classificado'
  });

  assert.match(prompt, /somente JSON valido/);
  assert.match(prompt, /Duvida\/Orientacao/);
  assert.match(prompt, /Incidente/);
  assert.match(prompt, /Requisicao/);
  assert.doesNotMatch(prompt, /<p>/);
  assert.doesNotMatch(prompt, /<script>/);
  assert.match(prompt, /Falha ao abrir/);
});

test('parseClassificacaoOpenAI aceita JSON valido e normaliza acentos', () => {
  const parsed = parseClassificacaoOpenAI(JSON.stringify({
    tipo: 'Dúvida/Orientação',
    prioridade: 'Média',
    motivo_curto: 'Pergunta de uso',
    confianca: 0.81
  }));

  assert.deepEqual(parsed, {
    tipo: 'Duvida/Orientacao',
    prioridade: 'Media',
    motivoCurto: 'Pergunta de uso',
    confianca: 0.81
  });
});

test('parseClassificacaoOpenAI mantem compatibilidade com TIPO|PRIORIDADE', () => {
  const parsed = parseClassificacaoOpenAI('Incidente | Alta');

  assert.equal(parsed.tipo, 'Incidente');
  assert.equal(parsed.prioridade, 'Alta');
});

test('parseClassificacaoOpenAI rejeita tipo e prioridade invalidos', () => {
  assert.throws(
    () => parseClassificacaoOpenAI('{"tipo":"Problema","prioridade":"Alta","confianca":0.5}'),
    /Tipo nao reconhecido/
  );

  assert.throws(
    () => parseClassificacaoOpenAI('{"tipo":"Incidente","prioridade":"Urgente","confianca":0.5}'),
    /Prioridade nao reconhecida/
  );
});

test('parseClassificacaoOpenAI rejeita confianca fora da faixa', () => {
  assert.throws(
    () => parseClassificacaoOpenAI('{"tipo":"Incidente","prioridade":"Alta","confianca":1.5}'),
    /Confianca invalida/
  );
});

test('mapearClassificacaoSoftdesk preserva codigos atuais', () => {
  assert.deepEqual(mapearClassificacaoSoftdesk('Incidente', 'Alta'), {
    tipo: 103,
    prioridade: 3,
    tipoDescricao: 'Incidente',
    prioridadeDescricao: 'Alta'
  });

  assert.deepEqual(mapearClassificacaoSoftdesk('Duvida/Orientacao', 'Baixa'), {
    tipo: 102,
    prioridade: 1,
    tipoDescricao: 'Duvida/Orientacao',
    prioridadeDescricao: 'Baixa'
  });

  assert.deepEqual(mapearClassificacaoSoftdesk('Requisicao', 'Critica'), {
    tipo: 106,
    prioridade: 4,
    tipoDescricao: 'Requisicao',
    prioridadeDescricao: 'Critica'
  });
});

test('montarPayloadAtualizacao monta payload Softdesk sem chamar PUT', () => {
  const payload = montarPayloadAtualizacao(456, {
    tipo: 103,
    prioridade: 3
  });

  assert.deepEqual(payload, {
    codigo: 456,
    tipo_chamado: {
      codigo: 103
    },
    prioridade: {
      codigo: 3
    }
  });
});

test('classificarChamadoOpenAI usa fetch mockado e nao chama rede real', async () => {
  const urls = [];
  const fetchMock = async (url, options) => {
    urls.push(url);
    assert.equal(url, 'https://api.openai.com/v1/chat/completions');
    assert.doesNotMatch(options.body, /<br>/);

    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              tipo: 'Incidente',
              prioridade: 'Alta',
              motivo_curto: 'Erro impede uso',
              confianca: 0.9
            })
          }
        }]
      })
    };
  };

  const result = await classificarChamadoOpenAI({
    titulo: 'Sistema nao abre',
    descricao: 'Erro <br> impeditivo',
    contexto: 'Teste'
  }, undefined, '', { fetchImpl: fetchMock, provider: 'openai' });

  assert.equal(urls.length, 1);
  assert.equal(result.tipo, 103);
  assert.equal(result.prioridade, 3);
  assert.equal(result.tipoDescricao, 'Incidente');
  assert.equal(result.prioridadeDescricao, 'Alta');
  assert.equal(result.motivoCurto, 'Erro impede uso');
  assert.equal(result.confianca, 0.9);
});

test('classificarChamadoOpenAI usa Google Gemini quando provider google', async () => {
  process.env.GOOGLE_API_KEY = 'fake-google-key';
  const urls = [];
  const fetchMock = async (url, options) => {
    urls.push(url);
    assert.match(url, /^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-2\.5-flash-lite:generateContent$/);
    assert.equal(options.headers['x-goog-api-key'], 'fake-google-key');
    assert.doesNotMatch(options.body, /<br>/);

    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                tipo: 'Requisicao',
                prioridade: 'Baixa',
                motivo_curto: 'Melhoria solicitada',
                confianca: 0.74
              })
            }]
          }
        }]
      })
    };
  };

  const result = await classificarChamadoOpenAI({
    titulo: 'Melhoria de mensagem',
    descricao: 'Solicito ajuste <br> no texto',
    contexto: 'Teste'
  }, undefined, '', { fetchImpl: fetchMock, provider: 'google', geminiRpd: 0 });

  assert.equal(urls.length, 1);
  assert.equal(result.tipo, 106);
  assert.equal(result.prioridade, 1);
  assert.equal(result.tipoDescricao, 'Requisicao');
  assert.equal(result.prioridadeDescricao, 'Baixa');
  assert.equal(result.motivoCurto, 'Melhoria solicitada');
  assert.equal(result.confianca, 0.74);
  delete process.env.GOOGLE_API_KEY;
});

test('classificarChamadoOpenAI tenta novamente Gemini em 429 antes de falhar', async () => {
  process.env.GOOGLE_API_KEY = 'fake-google-key';
  const sleeps = [];
  let chamadas = 0;
  const fetchMock = async () => {
    chamadas += 1;

    if (chamadas === 1) {
      return {
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            message: 'Too Many Requests'
          }
        })
      };
    }

    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                tipo: 'Incidente',
                prioridade: 'Media',
                motivo_curto: 'Falha com retry',
                confianca: 0.8
              })
            }]
          }
        }]
      })
    };
  };

  const result = await classificarChamadoOpenAI({
    titulo: 'Erro intermitente',
    descricao: 'Falha',
    contexto: 'Teste'
  }, undefined, '', {
    fetchImpl: fetchMock,
    provider: 'gemini',
    geminiMinIntervalMs: 0,
    geminiRpd: 0,
    geminiBackoffBaseMs: 10,
    sleepImpl: async ms => sleeps.push(ms)
  });

  assert.equal(chamadas, 2);
  assert.deepEqual(sleeps, [10]);
  assert.equal(result.tipo, 103);
  assert.equal(result.prioridade, 2);
  delete process.env.GOOGLE_API_KEY;
});

test('classificarChamadoOpenAI respeita retryDelay do corpo Gemini em quota exceeded', async () => {
  process.env.GOOGLE_API_KEY = 'fake-google-key';
  const sleeps = [];
  let chamadas = 0;
  const fetchMock = async () => {
    chamadas += 1;

    if (chamadas === 1) {
      return {
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            message: 'Quota exceeded. Please retry in 40.380551662s.',
            details: [{
              '@type': 'type.googleapis.com/google.rpc.RetryInfo',
              retryDelay: '40.380551662s'
            }]
          }
        })
      };
    }

    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                tipo: 'Requisicao',
                prioridade: 'Baixa',
                motivo_curto: 'Retry informado pela API',
                confianca: 0.7
              })
            }]
          }
        }]
      })
    };
  };

  const result = await classificarChamadoOpenAI({
    titulo: 'Criacao de usuario',
    descricao: 'Solicito criar usuario',
    contexto: 'Teste'
  }, undefined, '', {
    fetchImpl: fetchMock,
    provider: 'google',
    geminiMinIntervalMs: 0,
    geminiRpd: 0,
    sleepImpl: async ms => sleeps.push(ms)
  });

  assert.equal(chamadas, 2);
  assert.deepEqual(sleeps, [40381]);
  assert.equal(result.tipo, 106);
  assert.equal(result.prioridade, 1);
  delete process.env.GOOGLE_API_KEY;
});

test('parseRetryAfterMs interpreta segundos e data HTTP', () => {
  const headersSegundos = new Map([['Retry-After', '2']]);
  assert.equal(parseRetryAfterMs(headersSegundos), 2000);

  const headersData = new Map([['Retry-After', 'Mon, 01 Jun 2026 15:00:03 GMT']]);
  assert.equal(parseRetryAfterMs(headersData, () => Date.parse('Mon, 01 Jun 2026 15:00:00 GMT')), 3000);
});

test('parseGeminiRetryDelayMs interpreta RetryInfo e mensagem de quota', () => {
  assert.equal(parseGeminiRetryDelayMs({
    error: {
      details: [{
        retryDelay: '12.5s'
      }]
    }
  }), 12500);

  assert.equal(parseGeminiRetryDelayMs({
    error: {
      message: 'Please retry in 40.380551662s.'
    }
  }), 40381);
});

test('limites Gemini padrao refletem 10 RPM e 20 RPD', () => {
  assert.equal(resolverIntervaloMinimoGeminiMs({}), 6000);
  assert.equal(resolverLimiteGeminiRpd({}), 20);
});

test('classificarChamadoOpenAI bloqueia Gemini ao atingir RPD local', async () => {
  process.env.GOOGLE_API_KEY = 'fake-google-key';
  const quotaFilePath = path.join(os.tmpdir(), `gemini-quota-${process.pid}-${Date.now()}.json`);
  const dateKey = formatarDataLocal(new Date(Date.parse('2026-06-01T15:00:00Z')));
  fs.writeFileSync(quotaFilePath, JSON.stringify({ date: dateKey, count: 20 }));

  let chamadas = 0;
  const fetchMock = async () => {
    chamadas += 1;
    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                tipo: 'Incidente',
                prioridade: 'Alta',
                motivo_curto: 'Nao deve chamar API',
                confianca: 0.9
              })
            }]
          }
        }]
      })
    };
  };

  await assert.rejects(
    () => classificarChamadoOpenAI({
      titulo: 'Erro',
      descricao: 'Falha',
      contexto: 'Teste'
    }, undefined, '', {
      fetchImpl: fetchMock,
      provider: 'google',
      geminiMinIntervalMs: 0,
      geminiRpd: 20,
      geminiQuotaFilePath: quotaFilePath,
      nowImpl: () => Date.parse('2026-06-01T15:00:00Z')
    }),
    /Limite diario local do Gemini atingido: 20\/20/
  );

  assert.equal(chamadas, 0);
  fs.unlinkSync(quotaFilePath);
  delete process.env.GOOGLE_API_KEY;
});

test('stripHtmlSeguro limpa tags, scripts e espacos repetidos', () => {
  assert.equal(
    stripHtmlSeguro('<style>x</style><p>Erro&nbsp;grave</p><script>x</script>'),
    'Erro grave'
  );
});
