# Variaveis de ambiente

## Implementadas ou usadas no codigo

| Variavel | Usada em | Finalidade | Observacao |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | `utils/classificador_openai.js` | Autenticar OpenAI. | Necessaria quando provider e `openai`. |
| `OPENAI_MODEL` | `utils/classificador_openai.js` | Modelo OpenAI. | Padrao `gpt-4o-mini`. |
| `GOOGLE_API_KEY` | `utils/classificador_openai.js` | Autenticar Gemini. | Alternativa a `GEMINI_API_KEY`. |
| `GEMINI_API_KEY` | `utils/classificador_openai.js` | Autenticar Gemini. | Usada se `GOOGLE_API_KEY` ausente. |
| `GOOGLE_GEMINI_MODEL` | `utils/classificador_openai.js` | Modelo Gemini. | Padrao `gemini-2.5-flash-lite`. |
| `GOOGLE_GEMINI_RPM` | `utils/classificador_openai.js` | Limitar requisicoes Gemini por minuto. | Padrao `10`; gera intervalo minimo efetivo de `6000` ms. |
| `GOOGLE_GEMINI_RPD` | `utils/classificador_openai.js` | Limitar requisicoes Gemini por dia no processo local. | Padrao `20`; cada tentativa de retry tambem conta. |
| `GOOGLE_GEMINI_MIN_INTERVAL_MS` | `utils/classificador_openai.js` | Espacar inicios de chamadas Gemini. | Padrao derivado de `GOOGLE_GEMINI_RPM`; se configurado abaixo do RPM, usa o limite mais conservador. |
| `GOOGLE_GEMINI_QUOTA_FILE` | `utils/classificador_openai.js` | Persistir contador diario local Gemini. | Padrao `runtime/gemini-quota-usage.json`. |
| `GOOGLE_GEMINI_MAX_RETRIES` | `utils/classificador_openai.js` | Definir retries para erros Gemini `429` e `5xx`. | Padrao `3`; respeita `Retry-After` e `retryDelay` da API. |
| `GOOGLE_GEMINI_BACKOFF_BASE_MS` | `utils/classificador_openai.js` | Base do backoff exponencial Gemini. | Padrao `2000`. |
| `GOOGLE_GEMINI_BACKOFF_MAX_MS` | `utils/classificador_openai.js` | Teto do backoff exponencial Gemini. | Padrao `30000`. |
| `CLASSIFICADOR_PROVIDER` | `main.js`, `utils/classificador_openai.js` | Selecionar provider. | Aceita `openai`, `google`, `gemini`. |
| `DRY_RUN` | `main.js` | Impedir escrita no Softdesk. | `true` nao chama `editarChamado`. |
| `PORT` | `server.js` | Porta HTTP. | Padrao `4000`. |
| `AUTO_SCHEDULE_ENABLED` | `server.js` | Habilitar cron. | So desabilita com string `"false"`. |
| `AUTO_SCHEDULE_LIMIT` | `server.js` | Limite do cron. | Padrao `50`. |

## Documentadas no exemplo, mas nao usadas diretamente

| Variavel | Status |
| --- | --- |
| `SOFTDESK_HASH_API` | `src/softdeskConfig.js` | Token/hash da API Softdesk. | Obrigatoria para chamadas Softdesk. |
| `SOFTDESK_API_BASE_URL` | `src/softdeskConfig.js` | Base da API Softdesk. | Padrao `https://mainhardt.soft4.com.br/api/api.php`. |

## Observacao sobre `.env.example`

O arquivo `.env.example` documenta variaveis confirmadas no codigo (`OPENAI_*`, `GOOGLE_*`, `GEMINI_API_KEY`, `CLASSIFICADOR_PROVIDER`, `DRY_RUN`, `PORT`, `AUTO_SCHEDULE_*`, `SOFTDESK_HASH_API`, `SOFTDESK_API_BASE_URL`).

## Riscos

- `main.js`, `server.js` e `utils/classificador_openai.js` carregam `.env` com `dotenv`.
- O arquivo ativo de configuracao local e `.env`; `.env.example` e apenas template.
- `DRY_RUN=false` permite escrita real no Softdesk quando o fluxo chega a `editarChamado`.
- A mitigacao Gemini e implementada no cliente e usa contador local. Chamadas feitas fora deste projeto ainda contam na quota real do Google e nao ficam visiveis no arquivo local.
