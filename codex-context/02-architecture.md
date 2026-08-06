# 02 — Architecture

## End-to-end flow

```
Softdesk list --> ticket detail gate --> sanitization --> OpenAI/Gemini
  --> parser + static ID mapping --> payload --> DRY_RUN gate --> Softdesk PUT
```

1. `main.js` calls `getChamadosAbertos(limit)` to fetch open tickets.
2. For each ticket, `buscarDetalhesChamado(codigo)` fetches the detail; only tickets whose `tipo_chamado.descricao` normalizes to `nao classificado` are returned.
3. The detail is sanitized and shaped into the prompt by `buildPromptClassificacao` (src/services/classification/prompt.js).
4. The configured provider (`CLASSIFICADOR_PROVIDER`) is invoked: `chamarOpenAI` (src/services/classification/providers/openai.js) or `chamarGoogleGemini` (src/services/classification/providers/gemini.js).
5. The response is parsed as JSON with a `TIPO|PRIORIDADE` fallback (`parseClassificacaoOpenAI` in src/services/classification/parser.js).
6. `mapearClassificacaoSoftdesk` translates the text answer to static IDs (src/services/classification/mapping.js).
7. `montarPayloadAtualizacao` builds the Softdesk `PUT` body (src/services/classification/mapping.js).
8. `DRY_RUN` gates the `PUT`: if not exactly `"true"`, `editarChamado` issues the request (src/services/softdesk/tickets.js).

## Server-side flow

- `server.js` boots an Express server, a WebSocket server on the same HTTP listener, and a `node-cron` job.
- Static files come from `public/`.
- Two HTTP endpoints accept JSON: `POST /run-main` (in `server/httpEndpoints.js:15-22`) spawns `node main.js`; `POST /clear-logs` (in `server/httpEndpoints.js:24-35`) empties the current weekly log file.
- The WebSocket receives the full current log file on connect and is broadcast to whenever the file changes.
- A weekly log file watcher is rotated when the active log file changes.

## Modules

### Entry Points

| File | Responsibility |
| --- | --- |
| `main.js` | Orchestrates the classification pipeline. |
| `server.js` | HTTP, WebSocket, cron, child-process orchestration. |

### Services - Softdesk Gateways

| File | Responsibility |
| --- | --- |
| `src/services/softdesk/config.js` | Builds the Softdesk base URL and request headers. |
| `src/services/softdesk/tickets.js` | Issues the Softdesk `PUT` for a ticket. |
| `src/services/softdesk/types.js` | Lists Softdesk ticket types when run as a script. |
| `src/softdesk/retornaChamadosAbertos.js` | Lists open tickets and gates them on `nao classificado`. |

### Scripts

| File | Responsibility |
| --- | --- |
| `scripts/listarPrioridades.js` | Lists Softdesk priorities when run as a script. |
| `scripts/retornaChamadosSemTipo.js` | Queries tickets without a type when run as a script. |

### Services - Classification

| File | Responsibility |
| --- | --- |
| `src/services/classification/classify.js` | Main orchestrator: invokes provider, parses response, maps to Softdesk IDs. |
| `src/services/classification/prompt.js` | Builds the classification prompt and shapes ticket input. |
| `src/services/classification/parser.js` | Text normalization, type/priority parsing, JSON extraction. |
| `src/services/classification/mapping.js` | Maps classification text to Softdesk numeric IDs, builds update payload. |
| `src/services/classification/providers/openai.js` | OpenAI API client. |
| `src/services/classification/providers/gemini.js` | Google Gemini API client with quota and retry/backoff logic. |

### Domain

| File | Responsibility |
| --- | --- |
| `src/domain/constants.js` | Classification domain constants: TIPOS, PRIORIDADES, CODIGO_TIPO_CHAMADO, CODIGO_PRIORIDADE, TIPO_ALIASES, PRIORIDADE_ALIASES. |

### Utilities

| File | Responsibility |
| --- | --- |
| `src/utils/logger.js` | Weekly rotating log files under `logs/`, colorized console output. |
| `src/utils/text.js` | Canonical `stripHtml` implementation (safe version). |
| `src/utils/mensagem.js` | Text normalization and success message detection. |

### Legacy Facade

| File | Responsibility |
| --- | --- |
| `utils/classificador_openai.js` | Facade for backward compatibility with tests; re-exports all public API from the new classification modules. |

### Frontend

| File | Responsibility |
| --- | --- |
| `public/index.html` | UI shell. |
| `public/app.js` | Calls `/run-main`, `/clear-logs`, and the WebSocket. |
| `public/style.css` | Styles. |

### Tests

| File | Responsibility |
| --- | --- |
| `tests/classificador_openai.test.js` | `node:test` suite covering prompt, parser, mapping, payload, OpenAI/Gemini with mocked fetch, retry/quota, and `stripHtmlSeguro`. |

### Server Modules

| File | Responsibility |
| --- | --- |
| `server/cron.js` | Cron job setup and automatic main.js execution. |
| `server/httpEndpoints.js` | HTTP POST endpoints: /run-main, /clear-logs. |
| `server/logBroadcaster.js` | WebSocket server setup and log broadcasting. |

### Configuration

| File | Responsibility |
| --- | --- |
| `ecosystem.config.js` | PM2 configuration: `server.js`, `NODE_ENV=production`, `AUTO_SCHEDULE_ENABLED=true`. |

## Configuration

All configuration is read from `process.env` via `dotenv` with `quiet: true`. `.env.example` is the source of truth for variable names and defaults; never treat a real `.env` as documentation evidence.

Key behaviour:

- `DRY_RUN` is compared with `=== 'true'`; only the literal string `"true"` disables writes.
- `AUTO_SCHEDULE_ENABLED` is compared with `!== 'false'`; only the literal string `"false"` disables the cron.
- `CLASSIFICADOR_PROVIDER` is case-folded and accepts `openai`, `google`, `gemini`.
- `GOOGLE_GEMINI_QUOTA_FILE` defaults to `runtime/gemini-quota-usage.json` relative to the project.
- Gemini throttling defaults: `10` RPM, `20` RPD, `3` retries, backoff base `2000` ms, max `30000` ms.

## Side effects

- Network calls: Softdesk list, Softdesk detail, Softdesk `PUT`, OpenAI `chat/completions`, Google Gemini `generateContent`.
- Local writes: weekly log file under `logs/`, Gemini quota file under `runtime/` (or wherever `GOOGLE_GEMINI_QUOTA_FILE` points), runtime spawn of `node main.js` from `server/httpEndpoints.js` and `server/cron.js`.
- Process: `node-cron` schedules a job in `America/Sao_Paulo`.
