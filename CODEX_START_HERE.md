# CODEX START HERE

You are an AI agent or a new contributor. This file is your short entry point. The full evidence-backed context lives in [`codex-context/`](codex-context/README.md).

## Source of truth

Code, tests (`tests/*.test.js`), `package.json`, `.env.example`, `.gitignore`, and the Git state. Anything else is either evidence-derived or labelled as external (for example, the Softdesk PDF in `docs/reference/`).

## Reading order

1. [`codex-context/01-overview.md`](codex-context/01-overview.md) — purpose, scope, inputs, outputs, business rules.
2. [`codex-context/02-architecture.md`](codex-context/02-architecture.md) — flow, modules, configuration, side effects.
3. [`codex-context/03-operations.md`](codex-context/03-operations.md) — setup, run, validate, troubleshoot, operational safety.
4. [`codex-context/04-decisions.md`](codex-context/04-decisions.md) — lightweight ADRs.
5. [`codex-context/05-backlog.md`](codex-context/05-backlog.md) — risks, debts, improvements.
6. [`codex-context/06-inventory.md`](codex-context/06-inventory.md) — auditable inventory of files, scripts, integrations and Git state.

## Operational safety rules

- Never run real Softdesk, SMTP, provider or cron automation without explicit human approval.
- Never open, print, or summarize `.env`, `config/*.env`, cookies, tokens, browser profiles, operational CSVs, or generated queues.
- `DRY_RUN=true` is enforced by an exact string comparison (`=== 'true'`); anything else, including absence, allows writes when the pipeline runs.
- `AUTO_SCHEDULE_ENABLED` is opt-out (`!== 'false'`); only the literal string `"false"` disables it.
- Files under `src/` whose name starts with `test-` are operational callers, not unit tests, and make real Softdesk API requests.
- The only safe validation is `npm test` (runs `node --test tests/*.test.js` with mocks). `python -m compileall app tests` and `python tests/run_unittest_discovery.py` from the original request do not apply because this is a Node.js project.

## When you change something

- Update the relevant `codex-context/*.md` file in the same commit.
- Record any non-trivial choice as a new ADR in `codex-context/04-decisions.md`.
- Note new debt or follow-up in `codex-context/05-backlog.md`.
- Re-run `npm test` before declaring work done.
