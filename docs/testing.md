# Testes

## Estado atual

Ha testes automatizados em `tests/classificador_openai.test.js`, executados por:

```bash
npm test
```

## Cobertura confirmada

- Prompt remove HTML e pede JSON.
- Parser aceita JSON valido.
- Parser normaliza acentos.
- Parser mantem compatibilidade com `TIPO|PRIORIDADE`.
- Parser rejeita tipo/prioridade invalidos.
- Parser rejeita confianca fora de faixa.
- Mapeamento preserva codigos atuais.
- Payload Softdesk e montado sem PUT.
- Provider OpenAI usa `fetch` mockado.
- Provider Google Gemini usa `fetch` mockado.
- `stripHtmlSeguro` remove tags, scripts e espacos repetidos.

## Lacunas

- Nao ha teste de `main.js` garantindo que `DRY_RUN=true` nao chama `editarChamado`.
- Nao ha teste de `server.js` para cron, endpoints ou WebSocket.
- Nao ha teste dos gateways Softdesk com mocks.
- Nao ha fixture oficial de tipos/prioridades retornada pelo Softdesk.
- Nao ha exemplos reais anonimizados de erro de classificacao.

## Regra de seguranca

Testes novos devem bloquear chamadas para:

- `https://mainhardt.soft4.com.br`
- `https://api.openai.com`
- `https://generativelanguage.googleapis.com`

