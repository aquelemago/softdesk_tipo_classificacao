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

module.exports = {
  chamarOpenAI
};