# 04 — Decisions

Lightweight ADRs. Each entry follows `Context → Decision → Consequences`. Dates are omitted because they are Git-recorded.

## ADR-001 — Node.js with CommonJS

- **Context:** the project was already a Node.js application using `require`, `module.exports`, and `node-cron`.
- **Decision:** keep CommonJS and stay on Node.js with `node:test`.
- **Consequences:** tests run with `node --test tests/*.test.js` and there is no Python entry point; tooling, CI, and operator habits follow the Node ecosystem.

## ADR-002 — OpenAI by default, Gemini as an opt-in provider

- **Context:** the original implementation targeted OpenAI; Gemini was added later with quota and retry controls.
- **Decision:** keep OpenAI as the default (`src/services/classification/providers/openai.js:10`) and treat `google` / `gemini` as first-class providers with rate limiting.
- **Consequences:** every code path must continue to handle both providers; Gemini carries its own local daily quota and retry/backoff logic (`src/services/classification/providers/gemini.js:50-120`, `src/services/classification/providers/gemini.js:150-200`).

## ADR-003 — JSON prompt with `TIPO|PRIORIDADE` fallback

- **Context:** the LLM is asked to return JSON; legacy responses may still arrive as `Tipo | Prioridade`.
- **Decision:** parse JSON first, fall back to `split('|')` only if no JSON object is found (`src/services/classification/parser.js:10-30`).
- **Consequences:** downstream code can rely on `tipo` and `prioridade` text values; tests cover both branches (`tests/classificador_openai.test.js:40-61`).

## ADR-004 — Static Softdesk ID mapping

- **Context:** Softdesk ticket types and priorities are identified by numeric IDs that the system assumes are stable.
- **Decision:** hardcode the mapping in `CODIGO_TIPO_CHAMADO` and `CODIGO_PRIORIDADE` (`src/domain/constants.js:19-30`).
- **Consequences:** changes in Softdesk require a code change; see `05-backlog.md` for the validation gap.

## ADR-005 — `DRY_RUN` as a strict string gate

- **Context:** the pipeline must be runnable in two modes: dry-run (no writes) and live (writes enabled).
- **Decision:** compare `process.env.DRY_RUN === 'true'` (`main.js:17`).
- **Consequences:** only the literal string `"true"` disables writes; `1`, `yes`, or absence all permit writes when the pipeline runs. This is a deliberate safety floor.

## ADR-006 — Cron enabled by default

- **Context:** the system is meant to keep Softdesk triaged on a schedule.
- **Decision:** opt-out via `process.env.AUTO_SCHEDULE_ENABLED !== 'false'` (`server/cron.js:39`).
- **Consequences:** only the literal string `"false"` disables the cron; absence, empty values, or any other string leave it running at `*/15 * * * *` in `America/Sao_Paulo`.

## ADR-007 — Local Gemini daily quota and retry policy

- **Context:** the Gemini free tier has hard daily and per-minute limits; the API surfaces `retryDelay` and `Retry-After` hints.
- **Decision:** track daily usage in `runtime/gemini-quota-usage.json`, space requests by the RPM-derived interval, and parse both `Retry-After` and Gemini `retryDelay` hints (`src/services/classification/providers/gemini.js:100-140`, `src/services/classification/providers/gemini.js:150-200`).
- **Consequences:** the local file is part of runtime state and is intentionally git-ignored; retry behaviour is covered by tests (`tests/classificador_openai.test.js:205-346`).

## ADR-008 — Unauthenticated internal HTTP endpoints

- **Context:** the UI lives behind no reverse proxy in the shipped configuration.
- **Decision:** expose `POST /run-main` and `POST /clear-logs` without authentication (`server/httpEndpoints.js:15-35`).
- **Consequences:** anyone who can reach the server can trigger a real Softdesk write or wipe the current log file. See `05-backlog.md`.

## ADR-009 — Documentation restructure

- **Context:** the docs were previously fragmented (`docs/index.md`, `docs/overview.md`, `docs/guide.md`, `docs/reference.md`) and mixed English/Portuguese.
- **Decision:** consolidate around `README.md` (human guide), `CODEX_START_HERE.md` (AI entry point), and six numbered documents in `codex-context/`; remove the legacy Markdown.
- **Consequences:** there is one editorial source of truth per topic; the Softdesk PDF remains as an external reference, not as behavioural evidence.

## ADR-010 — Architecture Reorganization into Modular Structure

- **Context:** the classification logic in `utils/classificador_openai.js` had grown to ~569 lines with mixed concerns: domain constants, text normalization, parsing, mapping, prompt building, provider calls, and quota/retry logic. This made the code hard to test, maintain, and reason about. Softdesk gateways were also scattered across `src/` with inconsistent naming.
- **Decision:** reorganize the codebase into a modular structure under `src/`: `domain/` for constants, `services/classification/` for the classification pipeline (parser, mapping, prompt, providers), `services/softdesk/` for gateways, and `utils/` for shared utilities. The legacy `utils/classificador_openai.js` remains as a facade for backward compatibility with existing tests and imports.
- **Consequences:** each module has a single responsibility; dependencies are explicit and unidirectional; tests remain unchanged as they import from the facade; the new structure improves maintainability and enables future extensions (e.g., adding new providers). Migration was incremental across 14 stages (E0-E13) to preserve testability at every step.

## ADR-011 — Documentation Agent

- **Context:** The project's documentation in `codex-context/` requires manual updates to stay aligned with the codebase, which is error-prone and time-consuming. As the codebase evolves (e.g., new modules, functions, or variables), the documentation often becomes outdated, leading to inconsistencies and broken references (e.g., `server.js:58` when the file has fewer lines).
- **Decision:** Create a **Documentation Agent** using OpenCode's skill system to automate the maintenance of `codex-context/`. The agent consists of modular skills (`documentation-audit`, `documentation-generator`, `codex-context-manager`, `change-detector`, `markdown-formatter`, `validation-checker`) that can:
  - Audit existing documentation for broken references or links.
  - Generate new documentation (ADRs, backlog, inventory) based on code changes.
  - Detect changes in the codebase (new files, functions, variables) and suggest updates.
  - Validate consistency between documentation and code.
  - Format Markdown files to follow a consistent style.
- **Consequences:**
  - Reduces manual effort and errors in documentation maintenance.
  - Ensures `codex-context/` stays synchronized with the codebase.
  - Requires initial setup and occasional updates to the agent's skills.
  - Depends on OpenCode's tooling (`read`, `write`, `edit`, `glob`, `grep`, `bash`).
  - Skills are loaded on-demand and can be extended with external skills from [skills.sh](https://skills.sh/).
