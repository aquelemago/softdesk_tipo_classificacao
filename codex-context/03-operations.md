# 03 — Operations

## Setup

Requirements: Node.js with native `node:test` support and `npm`.

```bash
npm install
copy .env.example .env   # Windows
# or: cp .env.example .env
```

`.env` is git-ignored. Fill it only in a safe environment and never commit it.

## Safe validation

```bash
npm test
```

`npm test` runs `node --test tests/*.test.js` (`package.json:12`). All tests use a mocked `fetch` and never reach Softdesk, OpenAI, or Gemini (`tests/classificador_openai.test.js`).

The Python commands from the original request — `python -m compileall app tests` and `python tests/run_unittest_discovery.py` — do not apply. The project is Node.js: there is no `app/`, no `requirements.txt`, and no `tests/run_unittest_discovery.py`. Run them only to capture a literal failure if you need to evidence that they do not apply.

## Operational commands

| Command | Effect | Touches real integrations? |
| --- | --- | --- |
| `npm install` | Install dependencies. | No |
| `npm test` | Run `node --test tests/*.test.js` with mocks. | No |
| `npm start` / `node server.js` | Start HTTP + WebSocket server; cron may run automatically. | Yes — Softdesk + LLM when cron or `/run-main` triggers |
| `node main.js` | Process up to 50 tickets. | Yes |
| `node main.js 25` | Process up to the provided limit. | Yes |
| `node src/listarTiposChamado.js` | List ticket types from Softdesk. | Yes |
| `node src/test-listar-prioridades.js` | List priorities from Softdesk. | Yes |
| `node src/test-retorna-chamados-sem-tipo.js` | Query tickets without a type. | Yes |

For any of the rows marked *Yes*, confirm `DRY_RUN=true` and `AUTO_SCHEDULE_ENABLED=false` in `.env` unless the intent is a real run.

## Variables at a glance

See [`.env.example`](.env.example) for the canonical list and defaults. The names below match the keys read by the code; values are intentionally omitted here.

- LLM providers: `OPENAI_API_KEY`, `OPENAI_MODEL`, `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `GOOGLE_GEMINI_MODEL`, `CLASSIFICADOR_PROVIDER`.
- Gemini throttling: `GOOGLE_GEMINI_RPM`, `GOOGLE_GEMINI_RPD`, `GOOGLE_GEMINI_MIN_INTERVAL_MS`, `GOOGLE_GEMINI_QUOTA_FILE`, `GOOGLE_GEMINI_MAX_RETRIES`, `GOOGLE_GEMINI_BACKOFF_BASE_MS`, `GOOGLE_GEMINI_BACKOFF_MAX_MS`.
- Runtime safety: `DRY_RUN`.
- Server: `PORT`, `AUTO_SCHEDULE_ENABLED`, `AUTO_SCHEDULE_LIMIT`.
- Softdesk: `SOFTDESK_HASH_API`, `SOFTDESK_API_BASE_URL`.

## Operational safety

- `DRY_RUN` is compared with `=== 'true'`; only the literal string `"true"` blocks writes (`main.js:13`).
- `AUTO_SCHEDULE_ENABLED` is opt-out (`!== 'false'`); only the literal string `"false"` disables the cron (`server.js:58`).
- `POST /run-main` and `POST /clear-logs` are unauthenticated (`server.js:87-107`).
- The cron expression is `*/15 * * * *` in `America/Sao_Paulo` (`server.js:62-78`).
- Files in `src/` whose name starts with `test-` look like tests but make real Softdesk API requests when executed.
- `dotenv` is loaded with `quiet: true` (`utils/classificador_openai.js:1`, `src/softdeskConfig.js:1`, `server.js`, `main.js:2`).
- The Gemini provider enforces a local daily quota via `runtime/gemini-quota-usage.json`; the file is created on first write (`utils/classificador_openai.js:313-316`).

## Troubleshooting

- `SOFTDESK_HASH_API nao configurado no ambiente` — `.env` is missing `SOFTDESK_HASH_API`. Set it before running anything real (`src/softdeskConfig.js:12-14`).
- `Limite diario local do Gemini atingido` — the local quota file shows today's count at or above `GOOGLE_GEMINI_RPD`. Reset or raise the limit (`utils/classificador_openai.js:330-336`).
- Cron firing despite attempts to disable it — confirm the value is exactly `"false"`; `AUTO_SCHEDULE_ENABLED=0`, `"no"`, or absence all leave it enabled (`server.js:58`).
- `Provider de classificacao nao reconhecido` — `CLASSIFICADOR_PROVIDER` is something other than `openai`, `google`, or `gemini` (`utils/classificador_openai.js:541-543`).
- Tests timing out — Gemini tests share module-level queues. Run them with the `--test-concurrency=1` flag if needed.

## Deploy

- PM2: `pm2 start ecosystem.config.js`. The shipped config enables cron with `AUTO_SCHEDULE_LIMIT=50` (`ecosystem.config.js`).
- NSSM (Windows): `nssm install SoftdeskTipo`, point `Path` at `node.exe`, `Startup directory` at the project root, `Arguments` at `server.js`. Confirm `.env` before starting.
