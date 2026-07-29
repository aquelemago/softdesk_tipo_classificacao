# Softdesk Ticket Type Classifier

Node.js automation that classifies open Softdesk tickets with an LLM (OpenAI or Google Gemini) and updates the ticket type and priority in Softdesk. It ships with a small web UI that surfaces rotating weekly logs in real time over WebSocket and exposes internal endpoints to trigger the pipeline on demand.

This README is the human guide. AI agents and new contributors should start at [`CODEX_START_HERE.md`](CODEX_START_HERE.md) and then follow the [`codex-context/`](codex-context/README.md) reading order.

## Purpose

- Pull open Softdesk tickets whose current type is *Nao Classificado*.
- Send the sanitized ticket details to the configured LLM provider.
- Map the returned `tipo` / `prioridade` to the static Softdesk IDs.
- `PUT` the update back to Softdesk (unless `DRY_RUN=true`).

## Requirements

- Node.js with native `node:test` support (the project relies on `node --test`).
- `npm` for dependency management.
- Softdesk credentials, OpenAI and/or Google Gemini API keys — only needed for real runs.

## Install

```bash
npm install
copy .env.example .env   # Windows
# or: cp .env.example .env
```

`.env` is git-ignored. Fill it only in a safe environment and never commit it.

## Run

| Command | Effect | Safe? |
| --- | --- | --- |
| `npm install` | Install dependencies. | Yes |
| `npm test` | Run the Node test runner with mocks. | Yes |
| `npm start` / `node server.js` | Start HTTP + WebSocket server; cron may run automatically. | No — see *Risks* below |
| `node main.js` | Process up to 50 tickets. | No — real API calls |
| `node main.js 25` | Process up to the provided limit. | No — real API calls |
| `node src/listarTiposChamado.js` | List ticket types from Softdesk. | No — real API call |
| `node src/test-listar-prioridades.js` | List priorities from Softdesk. | No — real API call |
| `node src/test-retorna-chamados-sem-tipo.js` | Query tickets without a type. | No — real API call |

For real runs, confirm `DRY_RUN=true` and `AUTO_SCHEDULE_ENABLED=false` in `.env` before touching anything that mutates Softdesk.

## Environment variables

Names only — never put real values in this README. See [`.env.example`](.env.example) for the full template and `codex-context/03-operations.md` for the meaning of each variable.

- LLM providers: `OPENAI_API_KEY`, `OPENAI_MODEL`, `GOOGLE_API_KEY` / `GEMINI_API_KEY`, `GOOGLE_GEMINI_MODEL`, `CLASSIFICADOR_PROVIDER`.
- Gemini throttling: `GOOGLE_GEMINI_RPM`, `GOOGLE_GEMINI_RPD`, `GOOGLE_GEMINI_MIN_INTERVAL_MS`, `GOOGLE_GEMINI_QUOTA_FILE`, `GOOGLE_GEMINI_MAX_RETRIES`, `GOOGLE_GEMINI_BACKOFF_BASE_MS`, `GOOGLE_GEMINI_BACKOFF_MAX_MS`.
- Runtime safety: `DRY_RUN`.
- Server: `PORT`, `AUTO_SCHEDULE_ENABLED`, `AUTO_SCHEDULE_LIMIT`.
- Softdesk: `SOFTDESK_HASH_API`, `SOFTDESK_API_BASE_URL`.

## Risks

- `npm start` and `node main.js` reach real Softdesk, OpenAI and Gemini endpoints and can mutate data when `DRY_RUN` is not exactly `"true"`.
- The scheduled run is enabled by default (`*/15 * * * *`) and only stops when `AUTO_SCHEDULE_ENABLED=false`.
- `POST /run-main` and `POST /clear-logs` are unauthenticated internal endpoints.
- Files in `src/` whose name starts with `test-` look like unit tests but are operational Softdesk callers; running them is a real API call.
- There is no documented Softdesk sandbox; production-shaped secrets in `.env` should be guarded accordingly.

## Documentation

- [`CODEX_START_HERE.md`](CODEX_START_HERE.md) — short entry point for AI agents.
- [`codex-context/README.md`](codex-context/README.md) — technical index.
- [`docs/superpowers/specs/2026-07-28-documentation-alignment-design.md`](docs/superpowers/specs/2026-07-28-documentation-alignment-design.md) — approved design that produced this layout.
- [`docs/superpowers/plans/2026-07-28-documentation-alignment.md`](docs/superpowers/plans/2026-07-28-documentation-alignment.md) — implementation plan.
- [`docs/reference/API_Softdesk_Documentacao_v1_30.pdf`](docs/reference/API_Softdesk_Documentacao_v1_30.pdf) — external Softdesk API reference; not the source of truth for runtime behavior.

## Deploy

PM2:

```bash
pm2 start ecosystem.config.js
```

NSSM (Windows service): install with `nssm install SoftdeskTipo`, point `Path` at `node.exe`, `Startup directory` at the project root, and `Arguments` at `server.js`. Confirm `.env` (especially `DRY_RUN` and `AUTO_SCHEDULE_ENABLED`) before starting.
