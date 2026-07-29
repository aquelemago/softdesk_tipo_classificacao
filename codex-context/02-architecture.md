# 02 — Architecture

## End-to-end flow

```
Softdesk list --> ticket detail gate --> sanitization --> OpenAI/Gemini
   --> parser + static ID mapping --> payload --> DRY_RUN gate --> Softdesk PUT
```

1. `main.js` calls `getChamadosAbertos(limit)` to fetch open tickets (`main.js:37`, `src/test-retorna-ultimos-chamados-abertos.js:62-94`).
2. For each ticket, `buscarDetalhesChamado(codigo)` fetches the detail; only tickets whose `tipo_chamado.descricao` normalizes to `nao classificado` are returned (`src/test-retorna-ultimos-chamados-abertos.js:32-53`).
3. The detail is sanitized and shaped into the prompt by `buildPromptClassificacao` (`utils/classificador_openai.js:97-136`).
4. The configured provider (`CLASSIFICADOR_PROVIDER`) is invoked: `chamarOpenAI` or `chamarGoogleGemini` (`utils/classificador_openai.js:445-528`).
5. The response is parsed as JSON with a `TIPO|PRIORIDADE` fallback (`utils/classificador_openai.js:155-187`).
6. `mapearClassificacaoSoftdesk` translates the text answer to static IDs (`utils/classificador_openai.js:189-209`).
7. `montarPayloadAtualizacao` builds the Softdesk `PUT` body (`utils/classificador_openai.js:211-229`).
8. `DRY_RUN` gates the `PUT`: if not exactly `"true"`, `editarChamado` issues the request (`main.js:72-79`, `src/editarChamado.js:4-13`).

## Server-side flow

- `server.js` boots an Express server, a WebSocket server on the same HTTP listener, and a `node-cron` job (`server.js:12-14`, `server.js:62-78`).
- Static files come from `public/` (`server.js:25`).
- Two HTTP endpoints accept JSON: `POST /run-main` spawns `node main.js`; `POST /clear-logs` empties the current weekly log file (`server.js:87-107`).
- The WebSocket receives the full current log file on connect and is broadcast to whenever the file changes (`server.js:109-122`, `server.js:128-142`).
- A weekly log file watcher is rotated when the active log file changes (`server.js:144-149`).

## Modules

| File | Responsibility |
| --- | --- |
| `main.js` | Orchestrates the classification pipeline. |
| `server.js` | HTTP, WebSocket, cron, child-process orchestration. |
| `src/softdeskConfig.js` | Builds the Softdesk base URL and request headers. |
| `src/test-retorna-ultimos-chamados-abertos.js` | Lists open tickets and gates them on `nao classificado`. |
| `src/listarTiposChamado.js` | Lists Softdesk ticket types when run as a script. |
| `src/test-listar-prioridades.js` | Lists Softdesk priorities when run as a script. |
| `src/test-retorna-chamados-sem-tipo.js` | Queries tickets without a type when run as a script. |
| `src/editarChamado.js` | Issues the Softdesk `PUT` for a ticket. |
| `utils/classificador_openai.js` | Prompt, parser, static mapping, providers (OpenAI and Gemini), Gemini throttling. |
| `utils/logger.js` | Weekly rotating log files, colorized console output, HTML strip helper. |
| `public/index.html`, `public/app.js`, `public/style.css` | Web UI; calls `/run-main`, `/clear-logs`, and the WebSocket. |
| `tests/classificador_openai.test.js` | Mocks `fetch` and exercises prompt, parser, mapping, payload, OpenAI and Gemini paths, retries, quota, and `stripHtmlSeguro`. |
| `ecosystem.config.js` | PM2 configuration: `server.js`, `NODE_ENV=production`, `AUTO_SCHEDULE_ENABLED=true`. |

## Configuration

All configuration is read from `process.env` via `dotenv` with `quiet: true`. `.env.example` is the source of truth for variable names and defaults; never treat a real `.env` as documentation evidence.

Key behaviour:

- `DRY_RUN` is compared with `=== 'true'` (`main.js:13`); only the literal string `"true"` disables writes.
- `AUTO_SCHEDULE_ENABLED` is compared with `!== 'false'` (`server.js:58`); only the literal string `"false"` disables the cron.
- `CLASSIFICADOR_PROVIDER` is case-folded and accepts `openai`, `google`, `gemini` (`utils/classificador_openai.js:246-248`, `utils/classificador_openai.js:537-543`).
- `GOOGLE_GEMINI_QUOTA_FILE` defaults to `runtime/gemini-quota-usage.json` relative to the project (`utils/classificador_openai.js:37`).
- Gemini throttling defaults: `10` RPM, `20` RPD, `3` retries, backoff base `2000` ms, max `30000` ms (`utils/classificador_openai.js:32-36`).

## Side effects

- Network calls: Softdesk list, Softdesk detail, Softdesk `PUT`, OpenAI `chat/completions`, Google Gemini `generateContent`.
- Local writes: weekly log file under `logs/`, Gemini quota file under `runtime/` (or wherever `GOOGLE_GEMINI_QUOTA_FILE` points), runtime spawn of `node main.js` from `server.js`.
- Process: `node-cron` schedules a job in `America/Sao_Paulo` (`server.js:62-78`).
