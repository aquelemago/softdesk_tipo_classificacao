# Project Inventory

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

### Services - Softdesk Gateways

| Path | Role |
| --- | --- |
| `src/services/softdesk/config.js` | Softdesk base URL and headers. |
| `src/services/softdesk/tickets.js` | `PUT /chamado`. |
| `src/services/softdesk/types.js` | `GET /tipo-de-chamado`. |
| `src/softdesk/retornaChamadosAbertos.js` | List open tickets + gate on `nao classificado`. |

### Scripts

| Path | Role |
| --- | --- |
| `scripts/listarPrioridades.js` | `GET /prioridade`. |
| `scripts/retornaChamadosSemTipo.js` | `GET /chamado?RetornaChamadosSemTipo`. |

### Services - Classification

| Path | Role |
| --- | --- |
| `src/services/classification/classify.js` | Main orchestrator: invokes provider, parses response, maps to Softdesk IDs. |
| `src/services/classification/prompt.js` | Builds the classification prompt and shapes ticket input. |
| `src/services/classification/parser.js` | Text normalization, type/priority parsing, JSON extraction. |
| `src/services/classification/mapping.js` | Maps classification text to Softdesk numeric IDs, builds update payload. |
| `src/services/classification/providers/openai.js` | OpenAI API client. |
| `src/services/classification/providers/gemini.js` | Google Gemini API client with quota and retry/backoff logic. |
| `src/services/classification/providers/deepseek.js` | DeepSeek API client. |

### Domain

| Path | Role |
| --- | --- |
| `src/domain/constants.js` | Classification domain constants: TIPOS, PRIORIDADES, CODIGO_TIPO_CHAMADO, CODIGO_PRIORIDADE, TIPO_ALIASES, PRIORIDADE_ALIASES. |

### Utilities

| Path | Role |
| --- | --- |
| `src/utils/logger.js` | Weekly rotating logs under `logs/`, colorized output. |
| `src/utils/text.js` | Canonical `stripHtml` implementation (safe version). |
| `src/utils/mensagem.js` | Text normalization and success message detection. |

### Legacy Facade

| Path | Role |
| --- | --- |
| `utils/classificador_openai.js` | Facade for backward compatibility with tests; re-exports all public API from the new classification modules. |

### Server Modules

| Path | Role |
| --- | --- |
| `server/cron.js` | Cron job setup and automatic main.js execution. |
| `server/httpEndpoints.js` | HTTP POST endpoints: /run-main, /clear-logs. |
| `server/logBroadcaster.js` | WebSocket server setup and log broadcasting. |

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
| `docs/architecture/overview.md` | Purpose, scope, business rules, I/O. |
| `docs/architecture/components.md` | Flow, modules, configuration, side effects. |
| `docs/architecture/operations.md` | Setup, run, validate, troubleshoot, safety. |
| `docs/architecture/decisions.md` | ADRs. |
| `docs/project/backlog.md` | Risks, debt, follow-ups. |
| `docs/project/inventory.md` | This file. |
| `docs/superpowers/specs/2026-07-28-documentation-alignment-design.md` | Approved design for the restructure. |
| `docs/superpowers/plans/2026-07-28-documentation-alignment.md` | Implementation plan. |
| `docs/reference/API_Softdesk_Documentacao_v1_30.pdf` | External API reference. |

## Agent Skills

| Path | Role |
| --- | --- |
| `.agents/skills/documentation-agent/` | Main documentation agent orchestrator. |
| `.agents/skills/documentation-audit/` | Audits documentation for consistency with code. |
| `.agents/skills/documentation-generator/` | Generates new documentation (ADRs, backlog, inventory). |
| `.agents/skills/codex-context-manager/` | Manages codex-context/ files. |
| `.agents/skills/change-detector/` | Detects changes in the codebase. |
| `.agents/skills/markdown-formatter/` | Formats Markdown files. |
| `.agents/skills/validation-checker/` | Validates documentation vs code. |

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
| Softdesk | `${SOFTDESK_API_BASE_URL}` (default `https://mainhardt.soft4.com.br/api/api.php`) | `hash-api` header (`SOFTDESK_HASH_API`) | `src/services/softdesk/config.js` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `Authorization: Bearer ${OPENAI_API_KEY}` | `src/services/classification/providers/openai.js` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | `x-goog-api-key: ${GOOGLE_API_KEY}` (fallback `GEMINI_API_KEY`) | `src/services/classification/providers/gemini.js` |
| DeepSeek | `https://api.deepseek.com/chat/completions` | `Authorization: Bearer ${DEEPSEEK_API_KEY}` | `src/services/classification/providers/deepseek.js` |

## npm scripts

- `npm start` → `node server.js`.
- `npm test` → `node --test tests/*.test.js`.

## Git snapshot

The branch and working tree state were captured at the start of the restructure. Use `git status --short --branch` and `git log --oneline -10` for a live view.

## Out of scope for this inventory

- Real `.env` contents, cookies, tokens, browser profiles.
- Operational CSVs and generated queues.
- Historical PM2 logs and arbitrary runtime files outside `logs/`.
