require('dotenv').config({ quiet: true });
const fetch = require('node-fetch');

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

function stripHtmlSeguro(valor) {
  return String(valor || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

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

function resolverProvider(options = {}) {
  return String(options.provider || process.env.CLASSIFICADOR_PROVIDER || 'openai').toLowerCase();
}

async function chamarOpenAI(prompt, chamado, fetchImpl, options = {}) {
  const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: chamado.contexto || 'Voce e um analista de suporte que classifica chamados Softdesk.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 180,
      temperature: 0
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.choices?.[0]?.message?.content || '';
}

async function chamarGoogleGemini(prompt, chamado, fetchImpl, options = {}) {
  const model = options.model || process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey || ''
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          { text: chamado.contexto || 'Voce e um analista de suporte que classifica chamados Softdesk.' }
        ]
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 180,
        responseMimeType: 'application/json'
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Google Gemini API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim() || '';
}

async function classificarChamadoOpenAI(tituloOuChamado, descricao, contexto = '', options = {}) {
  const chamado = montarChamadoEntrada(tituloOuChamado, descricao, contexto);
  const prompt = buildPromptClassificacao(chamado);
  const fetchImpl = options.fetchImpl || fetch;
  const provider = resolverProvider(options);

  let resposta;
  if (provider === 'google' || provider === 'gemini') {
    resposta = await chamarGoogleGemini(prompt, chamado, fetchImpl, options);
  } else if (provider === 'openai') {
    resposta = await chamarOpenAI(prompt, chamado, fetchImpl, options);
  } else {
    throw new Error(`Provider de classificacao nao reconhecido: ${provider}`);
  }

  const classificacao = parseClassificacaoOpenAI(resposta);
  const codigos = mapearClassificacaoSoftdesk(classificacao.tipo, classificacao.prioridade);

  return {
    ...codigos,
    motivoCurto: classificacao.motivoCurto,
    confianca: classificacao.confianca
  };
}

module.exports = classificarChamadoOpenAI;
module.exports.TIPOS = TIPOS;
module.exports.PRIORIDADES = PRIORIDADES;
module.exports.buildPromptClassificacao = buildPromptClassificacao;
module.exports.parseClassificacaoOpenAI = parseClassificacaoOpenAI;
module.exports.mapearClassificacaoSoftdesk = mapearClassificacaoSoftdesk;
module.exports.montarPayloadAtualizacao = montarPayloadAtualizacao;
module.exports.normalizarTextoClassificacao = normalizarTextoClassificacao;
module.exports.stripHtmlSeguro = stripHtmlSeguro;
module.exports.resolverProvider = resolverProvider;
