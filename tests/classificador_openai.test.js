const test = require('node:test');
const assert = require('node:assert/strict');

const classificarChamadoOpenAI = require('../utils/classificador_openai');
const {
  buildPromptClassificacao,
  parseClassificacaoOpenAI,
  mapearClassificacaoSoftdesk,
  montarPayloadAtualizacao,
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
  }, undefined, '', { fetchImpl: fetchMock, provider: 'google' });

  assert.equal(urls.length, 1);
  assert.equal(result.tipo, 106);
  assert.equal(result.prioridade, 1);
  assert.equal(result.tipoDescricao, 'Requisicao');
  assert.equal(result.prioridadeDescricao, 'Baixa');
  assert.equal(result.motivoCurto, 'Melhoria solicitada');
  assert.equal(result.confianca, 0.74);
  delete process.env.GOOGLE_API_KEY;
});

test('stripHtmlSeguro limpa tags, scripts e espacos repetidos', () => {
  assert.equal(
    stripHtmlSeguro('<style>x</style><p>Erro&nbsp;grave</p><script>x</script>'),
    'Erro grave'
  );
});
