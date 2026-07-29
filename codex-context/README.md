# codex-context — technical index

This directory is the technical entry point for AI agents and contributors who need to understand, modify, or audit the Softdesk Ticket Type Classifier. Each document has a single responsibility; the human guide lives at [`../README.md`](../README.md) and the AI entry point at [`../CODEX_START_HERE.md`](../CODEX_START_HERE.md).

## Documents

| File | Responsibility |
| --- | --- |
| [`01-overview.md`](01-overview.md) | Purpose, scope, business rules, inputs, outputs. |
| [`02-architecture.md`](02-architecture.md) | End-to-end flow, modules, configuration, side effects. |
| [`03-operations.md`](03-operations.md) | Setup, run, validate, troubleshoot, operational safety. |
| [`04-decisions.md`](04-decisions.md) | Lightweight ADRs explaining non-obvious choices. |
| [`05-backlog.md`](05-backlog.md) | Risks, technical debt, follow-ups. |
| [`06-inventory.md`](06-inventory.md) | Auditable inventory of files, scripts, integrations and Git state. |

## Reading order

1. `01-overview.md`
2. `02-architecture.md`
3. `03-operations.md`
4. `04-decisions.md`
5. `05-backlog.md`
6. `06-inventory.md`

## Conventions

- Facts are evidenced with file and line references (`path:line`).
- Behaviour that is not yet implemented lives in `05-backlog.md`, not in the architecture or overview.
- External references (for example `docs/reference/API_Softdesk_Documentacao_v1_30.pdf`) are explicitly labelled and never used as the source of truth for runtime behaviour.
