const fetch = require('node-fetch');

async function chamarDeepSeek(prompt, chamado, fetchImpl, options = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  const response = await (fetchImpl || fetch)('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: chamado.contexto || 'Classifique chamados Softdesk. Responda SOMENTE com JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.choices?.[0]?.message?.content || '';
}

module.exports = { chamarDeepSeek };