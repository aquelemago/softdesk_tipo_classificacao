# Documentation Agent Guide

## 📌 Overview
The **Documentation Agent** is a specialized assistant for managing the documentation of the **Softdesk Ticket Type Classifier** project. It automates tasks such as:
- Auditing documentation for consistency with the codebase.
- Generating new documentation (ADRs, backlog, inventory).
- Detecting changes in the code and suggesting updates.
- Validating documentation vs. code.
- Formatting Markdown files.

---

## 🚀 How to Use

### 1. Load the Agent
To start using the Documentation Agent, load it with the `skill` tool:
```
skill(name: "documentation-agent")
```

---

### 2. Available Workflows
The agent provides the following high-level workflows:

| Command | Description | Example |
|---------|-------------|---------|
| `update-after-commit()` | Updates documentation after a `git commit` (detects new files, functions, variables). | `documentation-agent:update-after-commit()` |
| `create-adr()` | Creates a new **Architecture Decision Record (ADR)** interactively. | `documentation-agent:create-adr()` |
| `audit-all()` | Audits all documentation for consistency with the codebase. | `documentation-agent:audit-all()` |
| `document-module(file)` | Documents a new module added to the code. | `documentation-agent:document-module(file: "src/services/new-feature.js")` |
| `validate-all()` | Validates all documentation against the codebase. | `documentation-agent:validate-all()` |

---

### 3. Internal Skills
The agent orchestrates the following internal skills. You can also use them directly:

| Skill | Description | Example |
|-------|-------------|---------|
| `documentation-audit` | Audits documentation for broken references or links. | `documentation-audit:audit-references(path: "codex-context")` |
| `documentation-generator` | Generates new documentation (ADRs, backlog, inventory). | `documentation-generator:generate-adr(title, context, decision, consequences)` |
| `codex-context-manager` | Manages `codex-context/` files. | `codex-context-manager:read-context(file: "codex-context/01-overview.md")` |
| `change-detector` | Detects changes in the codebase. | `change-detector:detect-new-files()` |
| `markdown-formatter` | Formats Markdown files. | `markdown-formatter:format-tables(path: "codex-context")` |
| `validation-checker` | Validates documentation vs. code. | `validation-checker:validate-modules()` |

---

## 📂 Managed Files
The agent manages the following files in `codex-context/`:

| File | Responsibility | Format |
|------|----------------|--------|
| `01-overview.md` | Purpose, scope, business rules, inputs, outputs. | Markdown with code references (e.g., `main.js:17`). |
| `02-architecture.md` | End-to-end flow, modules, configuration, side effects. | Markdown with tables and ASCII diagrams. |
| `03-operations.md` | Setup, execution, validation, troubleshooting, operational safety. | Markdown with commands and tables. |
| `04-decisions.md` | Architecture Decision Records (ADRs). | Markdown with `Context → Decision → Consequences`. |
| `05-backlog.md` | Risks, technical debt, future improvements. | Markdown with lists and suggestions. |
| `06-inventory.md` | Auditable inventory of files, scripts, integrations. | Markdown with tables. |

---

## 🎯 Use Cases

### Use Case 1: Update Documentation After a Commit
**Scenario:** You added a new file (`src/services/new-feature.js`) and want to update the documentation.

**Steps:**
1. Commit your changes:
   ```bash
   git add src/services/new-feature.js
   git commit -m "feat: add new feature"
   ```
2. Run the agent to update documentation:
   ```
   documentation-agent:update-after-commit()
   ```
3. The agent will:
   - Detect the new file.
   - Update `06-inventory.md` and `02-architecture.md`.
   - Ask for confirmation before committing.

---

### Use Case 2: Create a New ADR
**Scenario:** You made an architectural decision (e.g., "Add authentication to endpoints") and want to document it.

**Steps:**
1. Run the agent to create an ADR:
   ```
   documentation-agent:create-adr()
   ```
2. The agent will ask for:
   - **Title** (e.g., "ADR-012 — Add Authentication to Endpoints").
   - **Context** (e.g., "`POST /run-main` and `POST /clear-logs` are unauthenticated").
   - **Decision** (e.g., "Add API key validation").
   - **Consequences** (e.g., "Clients must include `X-API-KEY` header").
3. The agent will:
   - Add the ADR to `04-decisions.md`.
   - Optionally update `05-backlog.md`.
   - Ask for confirmation before committing.

---

### Use Case 3: Audit Documentation
**Scenario:** You want to check if the documentation is consistent with the codebase.

**Steps:**
1. Run the agent to audit all documentation:
   ```
   documentation-agent:audit-all()
   ```
2. The agent will:
   - Check all references to `file:line` in `codex-context/`.
   - Check all internal links between `.md` files.
   - Validate modules, variables, and inventory.
   - Generate a report in `reports/audit-YYYY-MM-DD.md`.

---

### Use Case 4: Document a New Module
**Scenario:** You added a new module (`src/services/new-feature.js`) and want to document it.

**Steps:**
1. Run the agent to document the module:
   ```
   documentation-agent:document-module(file: "src/services/new-feature.js")
   ```
2. The agent will:
   - Detect the module.
   - Update `06-inventory.md` and `02-architecture.md`.
   - Format the tables.
   - Ask for confirmation before committing.

---

### Use Case 5: Validate Documentation
**Scenario:** You want to ensure all documentation is aligned with the code.

**Steps:**
1. Run the agent to validate all documentation:
   ```
   documentation-agent:validate-all()
   ```
2. The agent will:
   - Validate business rules in `01-overview.md`.
   - Validate modules in `02-architecture.md`.
   - Validate variables in `03-operations.md`.
   - Validate inventory in `06-inventory.md`.
   - Generate a report in `reports/validation-YYYY-MM-DD.md`.

---

## 🛡️ Safety Rules
1. **Never expose secrets:** The agent will **never** read or expose `.env`, `config/*.env`, or any file containing secrets.
2. **Always confirm:** The agent will **always** ask for confirmation (`question`) before modifying files or committing changes.
3. **Code consistency:** All references in `.md` files (e.g., `main.js:17`) must be verifiable in the codebase.
4. **No code changes:** The agent will **only** manage documentation (`.md` files) and **never** modify application code (e.g., `main.js`, `server.js`).
5. **Follow existing style:** The agent follows the same Markdown style as the existing files in `codex-context/`.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Broken references** (e.g., `main.js:999` does not exist). | Run `documentation-agent:audit-all()` and manually correct the references. |
| **Undocumented modules** (e.g., `src/services/new-feature.js` not in `02-architecture.md`). | Run `documentation-agent:document-module(file: "src/services/new-feature.js")`. |
| **Inconsistent formatting** (e.g., misaligned tables). | Run `markdown-formatter:format-tables(path: "codex-context")`. |
| **Skills not loading** (e.g., `documentation-agent` not found). | Check permissions in `opencode.json` and ensure the skill files exist in `.agents/skills/`. |
| **Git conflicts** when committing. | Run `git pull` before committing and resolve conflicts manually. |

---

## 📌 Examples

### Example 1: Update Documentation After Adding a New File
**User:**
```
I added a new file `src/services/new-feature.js`. Update the documentation.
```

**Agent:**
1. Detects the new file with `change-detector:detect-new-files()`.
2. Updates `06-inventory.md` and `02-architecture.md` with `documentation-generator`.
3. Formats the tables with `markdown-formatter`.
4. Asks for confirmation:
   ```
   The following updates are suggested:
   - Add `src/services/new-feature.js` to `06-inventory.md`.
   - Add `src/services/new-feature.js` to `02-architecture.md`.
   Confirm? (Yes/No)
   ```
5. If confirmed, commits the changes with `git`.

---

### Example 2: Create an ADR for Authentication
**User:**
```
I need to document the decision to add authentication to the internal endpoints.
```

**Agent:**
1. Asks for ADR details:
   ```
   Title: ADR-012 — Add Authentication to Endpoints
   Context: POST /run-main and /clear-logs are unauthenticated (server/httpEndpoints.js:15-35).
   Decision: Add API key validation to these endpoints.
   Consequences: Clients must include X-API-KEY header; requires changes to server/httpEndpoints.js and public/app.js.
   ```
2. Adds the ADR to `04-decisions.md`.
3. Optionally updates `05-backlog.md`.
4. Asks for confirmation to commit.

---

### Example 3: Audit All Documentation
**User:**
```
Check if the documentation is aligned with the code.
```

**Agent:**
1. Runs `documentation-audit:audit-references(path: "codex-context")`.
2. Runs `validation-checker:validate-modules()`.
3. Runs `validation-checker:validate-inventory()`.
4. Generates a report in `reports/audit-YYYY-MM-DD.md` with:
   ```markdown
   # Audit Report - 06/08/2026

   ## Broken References
   - `main.js:999` → Does not exist (line 999 not found in main.js).

   ## Missing Modules
   - `src/services/new-feature.js` → Not documented in 02-architecture.md.

   ## Missing Files in Inventory
   - `src/services/new-feature.js` → Not listed in 06-inventory.md.
   ```

---

## 📦 Dependencies
- **OpenCode** (latest version) for tools like `read`, `write`, `edit`, `glob`, `grep`, `bash`, and `question`.
- **Git** for commands like `git diff`, `git log`, and `git commit`.
- **Node.js** for running `npm test` and validating the project.

---

## 📚 Additional Resources
- [OpenCode Documentation on Skills](https://opencode.ai/docs/skills/)
- [Skills.sh - Open Agent Skills Ecosystem](https://skills.sh/)
- [Example SKILL.md](https://github.com/anomalyco/opencode/blob/dev/.agents/skills/find-skills/SKILL.md)

---

## 🎯 Next Steps
1. **Load the agent:**
   ```
   skill(name: "documentation-agent")
   ```
2. **Try a workflow:**
   - `documentation-agent:audit-all()`
   - `documentation-agent:update-after-commit()`
   - `documentation-agent:create-adr()`
3. **Review reports:**
   - `reports/audit-YYYY-MM-DD.md` (for audits).
   - `codex-context/04-decisions.md` (for ADRs).
