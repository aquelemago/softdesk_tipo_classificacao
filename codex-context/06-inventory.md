# 06 — Inventory

An auditable snapshot of files, scripts, integrations and Git state at the time of the documentation alignment. Secret values are intentionally omitted.

## Project files

| Path | Role |
| --- | --- |
| `main.js` | Pipeline orchestration. |
| `server.js` | HTTP + WebSocket + cron. |
| `package.json` | Dependencies (`chalk`, `dotenv`, `express`, `node-cron`, `node-fetch`, `ws`) and scripts (`start`, `test`). |
| `package-lock.json` | Locked dependency tree. |
| `ecosystem.config.js` | PM2 config; `AUTO_SCHEDULE_ENABLED=true`, `AUTO_SCHEDULE_LIMIT=50`, `PORT=4000`. |
| `.env.example` | Template of every supported environment variable; never contains real values. |

## Source modules

| Path | Role |
| --- | --- |
| `src/softdeskConfig.js` | Softdesk base URL and headers. |
| `src/editarChamado.js` | `PUT /chamado`. |
| `src/test-retorna-ultimos-chamados-abertos.js` | List open tickets + gate on `nao classificado`. |
| `src/listarTiposChamado.js` | `GET /tipo-de-chamado`. |
| `src/test-listar-prioridades.js` | `GET /prioridade`. |
| `src/test-retorna-chamados-sem-tipo.js` | `GET /chamado?RetornaChamadosSemTipo`. |

## Utilities

| Path | Role |
| --- | --- |
| `utils/classificador_openai.js` | Prompt, parser, static mapping, OpenAI + Gemini providers, Gemini throttling. |
| `utils/logger.js` | Weekly rotating logs under `logs/`, colorized output, `stripHtml`. |

## Frontend

| Path | Role |
| --- | --- |
| `public/index.html` | UI shell. |
| `public/app.js` | Calls `/run-main`, `/clear-logs`, and the WebSocket. |
| `public/style.css` | Styles. |

## Tests

| Path | Role |
| --- | --- |
| `tests/classificador_openai.test.js` | `node:test` suite covering prompt, parser, mapping, payload, OpenAI/Gemini with mocked fetch, retry/quota, and `stripHtmlSeguro`. |

## Documentation

| Path | Role |
| --- | --- |
| `README.md` | Human guide. |
| `CODEX_START_HERE.md` | AI entry point. |
| `codex-context/README.md` | Technical index. |
| `codex-context/01-overview.md` | Purpose, scope, business rules, I/O. |
| `codex-context/02-architecture.md` | Flow, modules, configuration, side effects. |
| `codex-context/03-operations.md` | Setup, run, validate, troubleshoot, safety. |
| `codex-context/04-decisions.md` | ADRs. |
| `codex-context/05-backlog.md` | Risks, debt, follow-ups. |
| `codex-context/06-inventory.md` | This file. |
| `docs/superpowers/specs/2026-07-28-documentation-alignment-design.md` | Approved design for the restructure. |
| `docs/superpowers/plans/2026-07-28-documentation-alignment.md` | Implementation plan. |
| `docs/reference/API_Softdesk_Documentacao_v1_30.pdf` | External API reference. |

## Runtime artefacts (git-ignored)

- `node_modules/` — npm install output.
- `logs/` — weekly rotating log files.
- `.env` — environment secrets; never committed.
- `runtime/` — local Gemini quota file; created on first write.

## Local tooling (git-ignored)

- `.agents/` — agent skill sources installed locally.
- `.ai/` — secondary AI tooling directory.
- `skills-lock.json` — pinned hash for `find-skills`.

## Integrations

| Service | Endpoint | Auth | Source of truth |
| --- | --- | --- | --- |
| Softdesk | `${SOFTDESK_API_BASE_URL}` (default `https://mainhardt.soft4.com.br/api/api.php`) | `hash-api` header (`SOFTDESK_HASH_API`) | `src/softdeskConfig.js` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `Authorization: Bearer ${OPENAI_API_KEY}` | `utils/classificador_openai.js:445-461` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | `x-goog-api-key: ${GOOGLE_API_KEY}` (fallback `GEMINI_API_KEY`) | `utils/classificador_openai.js:471-512` |

## npm scripts

- `npm start` → `node server.js`.
- `npm test` → `node --test tests/*.test.js`.

## Git snapshot

The branch and working tree state were captured at the start of the restructure. Use `git status --short --branch` and `git log --oneline -10` for a live view.

## Out of scope for this inventory

- Real `.env` contents, cookies, tokens, browser profiles.
- Operational CSVs and generated queues.
- Historical PM2 logs and arbitrary runtime files outside `logs/`.
