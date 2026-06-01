# Planos vs implementacao

## Resumo

A pasta `planos/` descreve uma investigacao anterior e um plano de correcao para classificacao incorreta. O codigo atual ja implementa parte relevante desse plano, especialmente no classificador e nos testes.

| Item planejado | Estado no codigo | Status |
| --- | --- | --- |
| Criar testes automatizados seguros | `package.json` possui `test`; `tests/classificador_openai.test.js` existe. | implementado |
| Separar funcoes puras de prompt/parser/mapeamento/payload | `utils/classificador_openai.js` exporta funcoes especificas. | implementado |
| Sanitizar descricao antes do prompt | `main.js` usa `stripHtml`; classificador usa `stripHtmlSeguro`. | implementado |
| Exigir JSON estrito da IA | Prompt pede JSON e parser valida JSON. | parcialmente_implementado |
| Manter compatibilidade com formato antigo | Parser aceita `TIPO|PRIORIDADE`. | implementado extra |
| Validar enums | `normalizarTipo` e `normalizarPrioridade` validam aliases. | implementado |
| Adicionar `DRY_RUN` | `main.js` verifica `process.env.DRY_RUN === 'true'`. | implementado |
| Logs seguros com motivo/confianca | Classificador retorna campos, mas `main.js` nao registra todos. | parcialmente_implementado |
| Centralizar mapeamento | Mapas estao centralizados no classificador. | implementado |
| Validar IDs contra Softdesk | Nao ha fixture/dump validado. | ausente |
| Validar taxonomia com suporte | Nao ha evidencia no codigo. | precisa_validacao |
| Remover segredos hardcoded | `ecosystem.config.js` nao contem mais chave real; `hash-api` vem de `SOFTDESK_HASH_API`. | implementado |
| Configurar `.env` para Softdesk | `src/softdeskConfig.js` usa `SOFTDESK_HASH_API` e `SOFTDESK_API_BASE_URL`. | implementado |
| Mitigar rate limit Gemini | `utils/classificador_openai.js` espacou chamadas Gemini e adicionou retry/backoff para `429` e `5xx`. | implementado |
| Proteger endpoints internos | Sem autenticacao identificada. | ausente |
| Corrigir divergencia cron 1h vs 15min | Codigo ainda agenda 15min e mensagens dizem 1h. | divergente |
| Consultar `ctx7old` para libs | Nao foi necessario para documentar comportamento local. | nao_aplicado |

## Implementado fora dos planos originais

- Suporte a Google Gemini como provider alternativo.
- `OPENAI_MODEL` e `GOOGLE_GEMINI_MODEL`.
- `GOOGLE_GEMINI_RPM`, `GOOGLE_GEMINI_RPD`, `GOOGLE_GEMINI_MIN_INTERVAL_MS`, `GOOGLE_GEMINI_QUOTA_FILE`, `GOOGLE_GEMINI_MAX_RETRIES`, `GOOGLE_GEMINI_BACKOFF_BASE_MS` e `GOOGLE_GEMINI_BACKOFF_MAX_MS`.
- Testes de provider Gemini.

## Divergencias principais

- Os planos tratavam ausencia de testes como estado atual; agora ha testes.
- Os planos diziam que `main.js` enviava apenas titulo/descricao; agora envia objeto estruturado com cliente/status/tipo atual.
- Os planos diziam que o parser era apenas `split('|')`; agora ha parser JSON com fallback.
- A documentacao operacional atual reflete o cron real de 15 minutos.
