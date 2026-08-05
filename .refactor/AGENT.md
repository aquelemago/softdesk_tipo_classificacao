# REFACTOR AGENT — Single Entry Point

**Read this file first. It contains everything needed to continue the refactoring task autonomously.**

---

## 🎯 Mission
Execute the incremental refactoring of `softdesk_tipo_classificacao` (Node.js/CommonJS) following the plan in `.refactor/plan/01-etapas.json`. One stage per turn. One commit per stage. Full traceability.

---

## 📁 Project Structure
```
.refactor/
├── AGENT.md                    ← THIS FILE (read first)
├── progress.json               ← Single source of truth (current stage, history, commit SHAs)
├── plan/
│   └── 01-etapas.json          ← 14 stages (E0–E13) with files, deps, skills, criteria
├── skills/
│   ├── registry.json           ← Index of 23 available skills
│   └── <skill-id>/SKILL.md     ← Skill specs (YAML frontmatter + markdown)
├── agents/
│   └── executor.md             ← System prompt (embedded below)
├── runs/
│   └── <timestamp>-etapa-E<N>/ ← Per-stage audit logs (result.json, etc.)
├── rollback/
│   └── E<N>.json               ← Maps stage → previous SHA (for git revert)
└── README.md                   ← Infra docs
```

---

## 🔄 Execution Flow (MANDATORY)

### 1. BOOTSTRAP (run once per new chat)
```bash
# Verify state
git status --porcelain --branch
git log --oneline -3
cat .refactor/progress.json | jq .currentStageId
cat .refactor/progress.json | jq .stages[.currentStageId].status
```

### 2. RECOVERY MANAGER
- Read `progress.json`
- If `currentStageId.status == "in_progress"` with `lastRun.outcome == null` → **crash recovery**: `git reset --hard <rollback/E<N>.json.previousSha>`
- If `completed` → advance to next pending stage with satisfied deps
- If `failed`/`blocked` → report and wait for human

### 3. SKILL MANAGER
- Read `requiredSkills` from current stage in `01-etapas.json`
- Check `skills/registry.json` — if missing, create `<skill>/SKILL.md` and register
- All 23 skills already exist (registry has 23 entries)

### 4. EXECUTOR — Execute ONE Stage
1. Load stage from `01-etapas.json`
2. Verify `deps[]` are `completed`
3. **Risk-check**: read `risks[]` from stage
4. Apply changes using skills (file-read, file-write, import-update, etc.)
5. **VALIDATION GATE** — Run `validation-loop` skill:
   - Inputs: `stageId`, `validations` (from stage), `tests` (from stage.requiredTests), `maxAttempts: 3`
   - Runs ALL validations + ALL tests in loop with auto-fix (max 3 attempts)
   - **Only returns success if 100% validations AND 100% tests pass**
   - If fails after 3 attempts → `failStage`, **STOP**, no commit
5. On success: create rollback file, commit, update `progress.json`
6. **STOP** — do NOT advance to next stage

---

## 📋 Current State (as of last commit)

| Field | Value |
|---|---|
| **Branch** | `refactor/etapas` |
| **HEAD** | `84d07f5` (bookkeeping E3 from old plan) |
| **Current Stage** | **E0** — "Anchor baseline + establish folder architecture" |
| **Phase** | `preparation` |
| **Completed** | (new plan — all stages pending) |
| **Pending** | E0, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12, E13 |
| **Tests** | `npm test` = 16/16 pass |

> **Note**: Previous plan (E0-E3) completed in git history (commits `c348952`, `d2db723`, `c123162`, `991ac6f`). New plan reset to E0 with folder architecture as foundation. Git history preserved.

---

## 📦 Stage E0 — Next Up

**Objective**: Establish green baseline, create target folder structure under `src/`, and move all existing files to their new locations per target architecture.

**Target Architecture**:
```
src/
├── config/                 # Configuration
├── domain/                 # Domain constants & types
│   └── constants.js        # TIPOS, PRIORIDADES, CODIGOS
├── services/               # Business logic
│   ├── classification/     # Classification pipeline
│   │   ├── constants.js    # (re-export from domain)
│   │   ├── prompt.js       # Prompt building
│   │   ├── parser.js       # Response parsing
│   │   ├── mapping.js      # Softdesk ID mapping
│   │   ├── providers/      # LLM providers
│   │   │   ├── openai.js
│   │   │   └── gemini.js
│   │   └── classify.js     # Main orchestration
│   └── softdesk/           # Softdesk API gateways
│       ├── client.js       # HTTP client
│       ├── config.js       # Softdesk config
│       ├── tickets.js      # Ticket operations
│       └── types.js        # Type/priority operations
├── utils/                  # Shared utilities
│   ├── logger.js
│   ├── text.js             # stripHtml, normalizeText
│   └── mensagem.js         # mensagemSucesso, normalizarTexto
scripts/                    # CLI scripts
tests/
```

**Files Involved** (all existing files moved):
- `main.js`, `server.js`, `package.json`
- `src/softdeskConfig.js`, `src/editarChamado.js`, `src/listarTiposChamado.js`
- `src/softdesk/retornaChamadosAbertos.js`, `src/softdesk/mensagem.js`, `src/softdeskConfig.js`, `src/utils/texto.js`
- `utils/classificador_openai.js`, `utils/logger.js`
- `scripts/listarPrioridades.js`, `scripts/retornaChamadosSemTipo.js`

**Risks**:
- Moving files breaks imports — must update all `require()` paths
- `main.js` and `server.js` are entry points — must keep working
- `package.json` scripts must continue to work

**Completion Criteria**:
- `npm test` passes (16/16)
- Target folder structure created under `src/`
- All existing files moved to new locations per target architecture
- All imports updated and `validate-imports` passes
- `main.js` and `server.js` run without errors (DRY_RUN)
- `npm test` passes
- `git status` clean except intended changes
- `baselineCommit` recorded in `progress.json`

**Required Tests**: `npm test`, `validate-imports`, `main-dry-run`

**Required Skills**: `file-move`, `file-write`, `import-update`, `find-references`, `validate-imports`, `validate-structure`, `git-status`, `git-diff`, `test-runner`, `commit-manager`, `progress-update`

**Rollback Strategy**: `git revert do commit da etapa`

---

## 📦 All Stages Overview (E0–E13)

| ID | Name | Phase | Deps |
|---|---|---|---|
| **E0** | Anchor baseline + establish folder architecture | preparation | — |
| **E1** | Extract classification domain constants | restructure | E0 |
| **E2** | Extract classification parser & normalizers | restructure | E0, E1 |
| **E3** | Extract classification mapping & payload | restructure | E0, E1 |
| **E4** | Extract classification prompt builder | restructure | E0, E1 |
| **E5** | Extract OpenAI provider | restructure | E0–E4 |
| **E6** | Extract Gemini provider (quota/retry) | restructure | E0–E5 |
| **E7** | Create classification orchestrator & facade | restructure | E0–E6 |
| **E8** | Standardize Softdesk gateways & shared mensagem | restructure | E0 |
| **E9** | Unify stripHtml (logger vs classificador) | restructure | E0, E8 |
| **E10** | Decompose server.js into server/ modules | restructure | E0, E9 |
| **E11** | Clean logger global state | cleanup | E0, E10 |
| **E12** | Update docs & add ADR-010 | docs | E1–E11 |
| **E13** | Cleanup empty utils/ (optional) | cleanup | E0, E11 |

---

## ✅ Validation Commands

```bash
# 1. Static import validation (run on ALL modified files)
# Uses the validate-imports skill pattern (static parse, no require())
node -e "
const fs = require('fs');
function check(file, reqs) {
  const dir = require('path').dirname(file) || '.';
  const external = ['node-fetch','dotenv','ws','node-cron','express','chalk','fs','path','http','child_process'];
  reqs.filter(r => r && !external.includes(r)).forEach(r => {
    const p = require('path').join(dir, r + '.js');
    if (!fs.existsSync(p)) console.error('FAIL:', file, '->', r);
  });
}
// Add each file + its requires here (see .refactor/skills/validate-imports/SKILL.md)
"

# 2. Run test suite
npm test

# 3. Git scope check
git status --porcelain
# Only files in stage's filesInvolved[] + .refactor/ infra should appear
```

---

## 🛠 Skills Available (registry.json — 23 skills)

| Skill | Purpose |
|---|---|
| `file-read` | Read file for analysis |
| `file-write` | Create/overwrite file |
| `file-move` | `git mv` preserving history |
| `file-rename` | `git mv` same directory |
| `import-update` | Update `require()` paths |
| `find-references` | Locate all references to a module |
| `extract-function` | Move function to new file + adjust exports |
| `reexport-facade` | Create façade reexporting all public API |
| `validate-imports` | Static parse `require()` → confirm paths exist |
| `validate-structure` | Confirm expected files exist/missing |
| `validate-docs` | Verify doc references point to existing files |
| `text-diff` | Compare two strings |
| `strip-html-compare` | Compare stripHtml variants over corpus |
| `dry-run-runner` | Run with `DRY_RUN=true` env override |
| `dry-run-corpus-diff` | Run DRY_RUN pipeline over corpus, compare classifications |
| `server-boot-check` | Start server, verify boot, shutdown clean |
| `validation-loop` | **Gate: runs all validations + tests in loop with auto-fix (max 3). Only succeeds if 100% pass.** |
| `git-status` | Check working tree clean/dirty |
| `git-diff` | Show diff / list changed files |
| `test-runner` | Run `npm test` and parse results |
| `commit-manager` | Create single commit with canonical message |
| `progress-update` | Atomic update of `progress.json` |
| `doc-sync` | Update markdown references in `codex-context/` |

---

## 🔀 Git Workflow

```bash
# Stage ONLY files in scope
git add <files-from-filesInvolved> .refactor/progress.json .refactor/skills/registry.json .refactor/skills/<new> .refactor/rollback/E<N>.json .refactor/runs/.../result.json

# Commit with canonical message
git commit -m "refactor(E<N>): <Stage Name>

<one-line summary>

Stage: E<N>
Phase: <phase>
Files:
  - <file1>
  - <file2>
Skills used:
  - <skill>@1.0.0
Tests:
  - npm test (pass)
Rollback: .refactor/rollback/E<N>.json
"

# Post-commit: update rollback with commitSha + progress.json
git add .refactor/progress.json .refactor/rollback/E<N>.json
git commit -m "chore(E<N>): registrar commitSha no rollback e marcar E<N> completed"
```

---

## 🚫 Guardrails (NEVER VIOLATE)

- ❌ No `--amend`, `--no-verify`, `--squash`, `--force`
- ❌ No two stages in one commit
- ❌ No changes outside `filesInvolved[]` + direct derivatives (imports, docs)
- ❌ No new architecture/patterns/abstractions
- ❌ No `node -e "require('./main.js')"` — **main.js is auto-executable**; use static `validate-imports` only
- ❌ No modifying `01-etapas.json` or `progress.json` outside Progress Manager
- ❌ No advancing to next stage in same turn

---

## 📝 Quick Start for New Chat

```bash
# 1. Clone / open repo
# 2. Switch to branch
git checkout refactor/etapas

# 3. Read this file (AGENT.md) — DONE
# 4. Read current stage
cat .refactor/plan/01-etapas.json | jq '.stages[] | select(.id=="E0")'

# 3. Verify deps satisfied (E0 has none)
cat .refactor/progress.json | jq '.stages.E0.status'  # should be "pending"

# 6. Begin E0 execution following the flow above
```

---

## 📌 Key Files to Inspect Before E0

| File | Why |
|---|---|
| `main.js` | Entry point — must keep working after moves |
| `server.js` | Entry point — must keep working after moves |
| `utils/classificador_openai.js` | 569 lines — will be split across E1–E7 |
| `utils/logger.js` | Has `stripHtml` to unify in E9 |
| `src/softdesk/mensagem.js` | Pattern for shared module (E8 target) |

---

## 📌 Target Folder Structure (Post-E0)

```
src/
├── config/
├── domain/
│   └── constants.js
├── services/
│   ├── classification/
│   │   ├── prompt.js
│   │   ├── parser.js
│   │   ├── mapping.js
│   │   ├── providers/
│   │   │   ├── openai.js
│   │   │   └── gemini.js
│   │   └── classify.js
│   └── softdesk/
│       ├── client.js
│       ├── config.js
│       ├── tickets.js
│       └── types.js
├── utils/
│   ├── logger.js
│   ├── text.js
│   └── mensagem.js
scripts/
tests/
```

---

**This agent system is self-contained in `.refactor/`. Any AI reading this file can continue the refactoring from exactly where it left off.**

---

*Generated: 2026-08-05 | Current: E0 ready to start | Branch: refactor/etapas | Base: main@c49b04d*