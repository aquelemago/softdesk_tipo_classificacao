# Documentation Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fragmented documentation with an auditable, code-aligned structure for humans and AI agents.

**Architecture:** `README.md` is the human guide, `CODEX_START_HERE.md` routes AI agents, and `codex-context/` holds six focused technical documents. Legacy Markdown is removed after confirmed content migration; the external API PDF remains a reference only.

**Tech Stack:** Markdown, Git, Node.js source and `node:test` as evidence, and the two user-requested Python validation commands.

## Global Constraints

- Code, tests, `package.json`, and Git are the source of truth.
- Do not read, print, or summarize `.env`, `config/*.env`, cookies, tokens, browser profiles, operational CSVs, or generated queues.
- Do not run Soft4, SMTP, provider automation, cron, `npm start`, or `node main.js` without explicit approval.
- Preserve `docs/reference/API_Softdesk_Documentacao_v1_30.pdf` but label it external.
- Remove legacy `docs/index.md`, `docs/overview.md`, `docs/guide.md`, and `docs/reference.md` after migration.
- Do not change application behavior, dependencies, or runtime configuration.

---

### Task 1: Build human and AI entry points

**Files:** Modify `README.md`; create `CODEX_START_HERE.md`.

**Interfaces:** Consumes verified command/risk behavior from `package.json`, `main.js`, and `server.js`; produces links to `CODEX_START_HERE.md` and `codex-context/README.md`.

- [ ] **Step 1: Rewrite `README.md`**

Include purpose, Node/npm prerequisites, `npm install`, `npm test`, variable names only, links to canonical docs, and explicit warnings that `npm start`/`node main.js` can reach real integrations and cron is enabled unless exactly disabled.

- [ ] **Step 2: Create `CODEX_START_HERE.md`**

Use this exact reading sequence and safety rule:

```markdown
1. Read `codex-context/01-overview.md`.
2. Read `codex-context/02-architecture.md` before changing flow or integrations.
3. Read `codex-context/03-operations.md` before running commands.
4. Consult decisions, backlog, and inventory as needed.

Never run real Softdesk/SMTP automation without approval or inspect sensitive runtime artifacts.
```

- [ ] **Step 3: Verify links and commit**

Run `rg -n "\]\([^)]*\.md\)" README.md CODEX_START_HERE.md`, then commit with `git add README.md CODEX_START_HERE.md` and `git commit -m "Reestrutura pontos de entrada da documentacao"`.

### Task 2: Build core technical context

**Files:** Create `codex-context/README.md`, `01-overview.md`, `02-architecture.md`, and `03-operations.md`.

**Interfaces:** Consumes the entry points, code, tests, and `package.json`; produces detailed context linked by the entry points.

- [ ] **Step 1: Create `codex-context/README.md`**

Index the six numbered documents, with a one-sentence responsibility each and a reading order beginning with `01-overview.md`.

- [ ] **Step 2: Create `01-overview.md`**

Document objective, scope, inputs/outputs, and the confirmed rules: only normalized `nao classificado` tickets advance; valid types are `Duvida/Orientacao`, `Incidente`, `Requisicao`; valid priorities are `Baixa`, `Media`, `Alta`, `Critica`.

- [ ] **Step 3: Create `02-architecture.md`**

Document the verified flow:

```text
Softdesk list -> ticket detail gate -> sanitization -> OpenAI/Gemini
-> parser/static ID mapping -> payload -> DRY_RUN gate -> Softdesk PUT
```

Map `server.js`, `main.js`, `src/`, `utils/`, `public/`, and `tests/`; include WebSocket logs, log files, cron, `POST /run-main`, and `POST /clear-logs`.

- [ ] **Step 4: Create `03-operations.md`**

Cover non-sensitive setup, `npm test`, requested Python validations, default port, PM2 file, provider variable names, `DRY_RUN`, cron default, unauthenticated endpoints, and safe troubleshooting. Explicitly label `src/test-*` as operational Softdesk callers.

- [ ] **Step 5: Verify evidence references and commit**

Run `rg -n "(main\.js|server\.js|classificador_openai\.js|DRY_RUN|AUTO_SCHEDULE_ENABLED)" codex-context`, then commit the four files with message `Adiciona contexto tecnico auditavel`.

### Task 3: Document decisions, risks, and inventory

**Files:** Create `codex-context/04-decisions.md`, `05-backlog.md`, and `06-inventory.md`.

**Interfaces:** Consumes canonical context plus source/tests/Git; produces an explicit separation of implemented facts, decisions, risks, and future work.

- [ ] **Step 1: Create lightweight ADRs**

Record CommonJS/Node, provider selection, JSON parsing with `TIPO|PRIORIDADE` fallback, static Softdesk mappings, `DRY_RUN`, default-enabled cron, Gemini quota/retry controls, and unauthenticated internal endpoints.

- [ ] **Step 2: Create backlog and inventory**

Backlog: missing main/server/gateway tests, static-ID validation, endpoint access control, provider-data privacy policy, production scheduling policy. Inventory: source/public/test/docs files, ignored runtime categories, integrations, npm scripts, branch, and working-tree status—never secret contents.

- [ ] **Step 3: Commit these records**

Commit the three files with `git commit -m "Registra decisoes riscos e inventario"`.

### Task 4: Remove duplicates and verify tracking

**Files:** Modify `.gitignore` only if needed; delete the four legacy `docs/*.md` files; preserve the PDF.

**Interfaces:** Consumes all canonical docs; produces one non-duplicated documentation hierarchy.

- [ ] **Step 1: Check official paths are tracked**

Run `git check-ignore -v README.md CODEX_START_HERE.md codex-context/README.md docs/superpowers/specs/2026-07-28-documentation-alignment-design.md`. Expected: no output. Remove only a precise conflicting ignore rule if output appears.

- [ ] **Step 2: Delete migrated legacy files and verify hierarchy**

Delete exactly `docs/index.md`, `docs/overview.md`, `docs/guide.md`, and `docs/reference.md`. Run `rg --files README.md CODEX_START_HERE.md codex-context docs | Sort-Object`; confirm canonical docs and PDF remain.

- [ ] **Step 3: Commit cleanup**

Commit with `git commit -m "Consolida documentacao canonica"`.

### Task 5: Validate and publish

**Files:** No project files unless a documentation-only correction is required.

**Interfaces:** Consumes final docs; produces verified commits pushed to the current branch.

- [ ] **Step 1: Run requested validations**

Run `python -m compileall app tests` and `python tests/run_unittest_discovery.py`. Record literal results; the project is Node.js so both are expected to fail. Also run `npm test` as the effective validation, recording the real outcome.

- [ ] **Step 2: Review and publish**

Run `git diff --check` and `git status --short --branch`. Commit any final documentation-only correction with `Reorganiza documentacao tecnica`, then push the branch reported by Git status.

## Self-review

- Spec coverage: Tasks 1–4 cover all requested documents, migration, ignore rules, audit evidence, decisions, and risks; Task 5 covers the two requested validations, status, commit, and push.
- Placeholder scan: no TODO/TBD markers or deferred work language remain.
- Consistency: every canonical path matches the approved spec; no operational automation is authorized.
