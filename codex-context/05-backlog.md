# 05 — Backlog

Risks, technical debt, and follow-ups. Each item lists the evidence and the suggested next move. Items here are not implemented and should not be assumed by readers of `01-overview.md` or `02-architecture.md`.

## Operational risks

- **Live cron by default.** `AUTO_SCHEDULE_ENABLED !== 'false'` (`server.js:58`) keeps `node main.js` running every 15 minutes unless the literal `"false"` is set. Production deployment must guard `.env` accordingly.
- **Unauthenticated internal endpoints.** `POST /run-main` and `POST /clear-logs` (`server.js:87-107`) accept requests from anyone who can reach the server. Suggested move: front the server with a reverse proxy that performs authentication or restrict by source IP.
- **Operational scripts.** `scripts/listarPrioridades.js`, `scripts/retornaChamadosSemTipo.js`, and `src/softdesk/retornaChamadosAbertos.js` make real Softdesk API requests. Suggested move: keep current structure or move under an `ops/` directory.
- **No Softdesk sandbox.** The repo does not identify a sandbox host (`src/services/softdesk/config.js:3`). Suggested move: introduce a `SOFTDESK_API_BASE_URL` per environment and document the sandbox host when one exists.
- **Privacy on outbound LLM calls.** The full ticket description and client name are sent to the LLM (`src/services/classification/prompt.js`). Suggested move: document and possibly enforce a redaction policy before any production rollout.

## Behavioural debt

- **Static Softdesk IDs are not validated.** `CODIGO_TIPO_CHAMADO` and `CODIGO_PRIORIDADE` (`src/domain/constants.js`) assume the Softdesk-side codes are stable. Suggested move: add a startup check that calls `listarTiposChamado` and `listarPrioridades` and verifies the IDs.
- **No tests for `main.js`.** `DRY_RUN=true` coverage is missing; the pipeline integration is only validated through manual runs.
- **No tests for `server.js`.** Cron scheduling, WebSocket lifecycle, log rotation, and HTTP endpoints are uncovered.
- **No tests for Softdesk gateways with mocked fetch.** `src/services/softdesk/tickets.js`, `src/services/softdesk/types.js`, and `src/softdesk/retornaChamadosAbertos.js` rely on `node-fetch` directly with no test seam.
- **WebSocket has no reconnection backoff.** `public/app.js:30` reconnects every 5 seconds with no jitter and no max attempts. Suggested move: add jitter and an upper bound.

## Documentation debt

- **External PDF is not authoritative.** `docs/reference/API_Softdesk_Documentacao_v1_30.pdf` is kept as a reference but should not be cited as evidence of current behaviour. Any divergence should be flagged against the code.
- **English-only canonical docs.** The previous PT-BR Markdown has been removed in favour of English. Operators whose first language is Portuguese should rely on translation, not on legacy files.

## Future improvements

- Add authentication to `/run-main` and `/clear-logs`.
- Replace the static ID mapping with a runtime verification step that runs on boot.
- Cover `main.js`, `server.js`, and the Softdesk gateways with mocked tests.
- Add a startup log that prints the resolved `CLASSIFICADOR_PROVIDER`, `DRY_RUN`, and `AUTO_SCHEDULE_ENABLED` interpretation.
- Document a redaction policy for ticket content before any external LLM call.
