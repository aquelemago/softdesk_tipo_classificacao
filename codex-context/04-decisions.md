# 04 — Decisions

Lightweight ADRs. Each entry follows `Context → Decision → Consequences`. Dates are omitted because they are Git-recorded.

## ADR-001 — Node.js with CommonJS

- **Context:** the project was already a Node.js application using `require`, `module.exports`, and `node-cron`.
- **Decision:** keep CommonJS and stay on Node.js with `node:test`.
- **Consequences:** tests run with `node --test tests/*.test.js` and there is no Python entry point; tooling, CI, and operator habits follow the Node ecosystem.

## ADR-002 — OpenAI by default, Gemini as an opt-in provider

- **Context:** the original implementation targeted OpenAI; Gemini was added later with quota and retry controls.
- **Decision:** keep OpenAI as the default (`utils/classificador_openai.js:247`) and treat `google` / `gemini` as first-class providers with rate limiting.
- **Consequences:** every code path must continue to handle both providers; Gemini carries its own local daily quota and retry/backoff logic (`utils/classificador_openai.js:258-339`, `utils/classificador_openai.js:471-528`).

## ADR-003 — JSON prompt with `TIPO|PRIORIDADE` fallback

- **Context:** the LLM is asked to return JSON; legacy responses may still arrive as `Tipo | Prioridade`.
- **Decision:** parse JSON first, fall back to `split('|')` only if no JSON object is found (`utils/classificador_openai.js:155-187`).
- **Consequences:** downstream code can rely on `tipo` and `prioridade` text values; tests cover both branches (`tests/classificador_openai.test.js:40-61`).

## ADR-004 — Static Softdesk ID mapping

- **Context:** Softdesk ticket types and priorities are identified by numeric IDs that the system assumes are stable.
- **Decision:** hardcode the mapping in `CODIGO_TIPO_CHAMADO` and `CODIGO_PRIORIDADE` (`utils/classificador_openai.js:19-30`).
- **Consequences:** changes in Softdesk require a code change; see `05-backlog.md` for the validation gap.

## ADR-005 — `DRY_RUN` as a strict string gate

- **Context:** the pipeline must be runnable in two modes: dry-run (no writes) and live (writes enabled).
- **Decision:** compare `process.env.DRY_RUN === 'true'` (`main.js:13`).
- **Consequences:** only the literal string `"true"` disables writes; `1`, `yes`, or absence all permit writes when the pipeline runs. This is a deliberate safety floor.

## ADR-006 — Cron enabled by default

- **Context:** the system is meant to keep Softdesk triaged on a schedule.
- **Decision:** opt-out via `process.env.AUTO_SCHEDULE_ENABLED !== 'false'` (`server.js:58`).
- **Consequences:** only the literal string `"false"` disables the cron; absence, empty values, or any other string leave it running at `*/15 * * * *` in `America/Sao_Paulo`.

## ADR-007 — Local Gemini daily quota and retry policy

- **Context:** the Gemini free tier has hard daily and per-minute limits; the API surfaces `retryDelay` and `Retry-After` hints.
- **Decision:** track daily usage in `runtime/gemini-quota-usage.json`, space requests by the RPM-derived interval, and parse both `Retry-After` and Gemini `retryDelay` hints (`utils/classificador_openai.js:297-339`, `utils/classificador_openai.js:345-419`).
- **Consequences:** the local file is part of runtime state and is intentionally git-ignored; retry behaviour is covered by tests (`tests/classificador_openai.test.js:205-346`).

## ADR-008 — Unauthenticated internal HTTP endpoints

- **Context:** the UI lives behind no reverse proxy in the shipped configuration.
- **Decision:** expose `POST /run-main` and `POST /clear-logs` without authentication (`server.js:87-107`).
- **Consequences:** anyone who can reach the server can trigger a real Softdesk write or wipe the current log file. See `05-backlog.md`.

## ADR-009 — Documentation restructure

- **Context:** the docs were previously fragmented (`docs/index.md`, `docs/overview.md`, `docs/guide.md`, `docs/reference.md`) and mixed English/Portuguese.
- **Decision:** consolidate around `README.md` (human guide), `CODEX_START_HERE.md` (AI entry point), and six numbered documents in `codex-context/`; remove the legacy Markdown.
- **Consequences:** there is one editorial source of truth per topic; the Softdesk PDF remains as an external reference, not as behavioural evidence.
