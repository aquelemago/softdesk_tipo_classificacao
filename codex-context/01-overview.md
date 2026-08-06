# 01 — Overview

## Purpose

The Softdesk Ticket Type Classifier automates the triage of open Softdesk tickets by asking an LLM (OpenAI or Google Gemini) to assign a `tipo` (type) and a `prioridade` (priority), then writing the result back to Softdesk through its REST API. A small Express server exposes the operation through a web UI, internal HTTP endpoints, and a 15-minute cron loop.

## Scope

In scope:

- Pulling open tickets whose current type normalizes to `nao classificado`.
- Sanitizing HTML, building the prompt, calling the LLM, parsing the response.
- Mapping the textual answer to the static Softdesk IDs and sending a `PUT` to `chamado` (or skipping it when `DRY_RUN=true`).
- Serving a static UI, a WebSocket log stream, and `POST /run-main` and `POST /clear-logs`.
- Running the pipeline automatically every 15 minutes when `AUTO_SCHEDULE_ENABLED` is not exactly `"false"`.

Out of scope:

- Authentication on internal HTTP endpoints.
- Validating the static Softdesk type and priority IDs against live data.
- Anything other than ticket type and priority updates (no notes, status, or assignee changes).

## Business rules (confirmed in code)

- Only tickets whose `tipo_chamado.descricao` normalizes to `nao classificado` are advanced to the LLM step. `src/softdesk/retornaChamadosAbertos.js:35`.
- Accepted `tipo` values: `Duvida/Orientacao`, `Incidente`, `Requisicao`. `src/domain/constants.js:6-10`.
- Accepted `prioridade` values: `Alta`, `Baixa`, `Critica`, `Media`. `src/domain/constants.js:12-17`.
- Softdesk IDs are static and hardcoded:

  | Text | Code |
  | --- | --- |
  | `Duvida/Orientacao` | 102 |
  | `Incidente` | 103 |
  | `Requisicao` | 106 |
  | `Baixa` | 1 |
  | `Media` | 2 |
  | `Alta` | 3 |
  | `Critica` | 4 |

  `src/domain/constants.js:19-30`.

- `DRY_RUN=true` blocks the `PUT`; any other value (including unset) allows the write. `main.js:17`, `main.js:75-82`.

## Inputs

- Open tickets returned by Softdesk `GET /chamado?RetornaUltimosChamadosAbertos&limit={limit}`. `src/softdesk/retornaChamadosAbertos.js:60-90`.
- Ticket details from Softdesk `GET /chamado?codigo={codigo}`. `src/softdesk/retornaChamadosAbertos.js:15-55`.
- HTTP `POST /run-main` with a JSON body `{ "limit": number }`. `server/httpEndpoints.js:15-22`.
- A web UI served from `public/`.

## Outputs

- `PUT /chamado` with the new `tipo_chamado.codigo` and `prioridade.codigo`. `src/services/softdesk/tickets.js:4-13`.
- A weekly log file under `logs/log-chamados-YYYY-MM-DD_YYYY-MM-DD.txt`. `src/utils/logger.js:22-25`, `src/utils/logger.js:63-77`.
- Real-time log lines over the WebSocket at `/`. `server/logBroadcaster.js:20-27`, `server/logBroadcaster.js:38-47`.
- A local Gemini quota file at `runtime/gemini-quota-usage.json` (or wherever `GOOGLE_GEMINI_QUOTA_FILE` points). `src/services/classification/providers/gemini.js:37`, `src/services/classification/providers/gemini.js:100-105`.

## Side effects

- Writes to Softdesk when `DRY_RUN` is not exactly `"true"`.
- Writes to the active weekly log file under `logs/`.
- Writes to the local Gemini quota file.
- Spawns `node main.js` as a child process from `server.js` (`server/httpEndpoints.js:17`, `server/cron.js:10`).
- Schedules a recurring cron job (`server/cron.js:43-59`).
