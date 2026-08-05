---
id: server-boot-check
version: 1.0.0
name: Server Boot Check
description: Starts the server in background, verifies it boots without errors, then shuts it down. Used as integration test for server.js changes.
category: testing
tags: [test, integration, server, boot]
author: meta-refactor
---

# Server Boot Check

## Objective
Verify that `node server.js` starts successfully (binds port, initializes cron, WebSocket, HTTP endpoints) without throwing errors.

## Responsibility
- Spawn `node server.js` as child process with `DRY_RUN=true` and `AUTO_SCHEDULE_ENABLED=false`
- Wait for "Servidor rodando em http://localhost:PORT" message (or timeout)
- Verify process is alive and listening on port
- Send SIGTERM and verify clean shutdown
- Capture stdout/stderr for analysis

## Inputs
| Name | Type | Required | Description |
|---|---|---|---|
| script | string | no | Entry point (default: `server.js`) |
| env | object | no | Extra env vars (default: `{DRY_RUN: 'true', AUTO_SCHEDULE_ENABLED: 'false'}`) |
| timeoutMs | number | no | Max wait for boot (default: 10000) |
| port | number | no | Expected port (default: from env PORT or 4000) |

## Outputs
| Name | Type | Description |
|---|---|---|
| passed | boolean | True if server booted and shut down cleanly |
| bootTimeMs | number | Time from spawn to "listening" message |
| stdout | string | Captured stdout |
| stderr | string | Captured stderr |
| exitCode | number | Process exit code after SIGTERM |

## Pre-requisites
- `server.js` exists
- Port not already in use
- Dependencies installed (`npm install`)

## Success Criteria
- Process starts within timeout
- Logs "Servidor rodando em http://localhost:PORT"
- Clean shutdown on SIGTERM (exit code 0 or null)
- No unhandled errors in stderr

## Limitations
- Only tests boot, not full functionality
- Requires free port (may conflict in parallel CI)
- Does not test WebSocket/HTTP endpoints (separate test)