# Softdesk Ticket Type Classifier - Documentation

This directory contains all the documentation for the **Softdesk Ticket Type Classifier** project.

## 📚 Documentation Structure

```
docs/
├── README.md                      # This file - Documentation index
├── architecture/                  # Architecture and technical design
│   ├── overview.md               # Purpose, scope, business rules, I/O
│   ├── components.md             # Modules, flow, configuration, side effects
│   ├── operations.md             # Setup, execution, validation, troubleshooting
│   └── decisions.md              # Architecture Decision Records (ADRs)
├── project/                      # Project management
│   ├── backlog.md                # Risks, technical debt, future improvements
│   └── inventory.md              # Auditable snapshot of files, scripts, integrations
├── reference/                    # External references
│   └── API_Softdesk_Documentacao_v1_30.pdf
└── superpowers/                  # Historical planning documents
    ├── plans/
    │   └── 2026-07-28-documentation-alignment.md
    └── specs/
        └── 2026-07-28-documentation-alignment-design.md
```

## 📖 How to Use This Documentation

### For Developers
1. Start with **[architecture/overview.md](./architecture/overview.md)** to understand the purpose, scope, and business rules.
2. Read **[architecture/components.md](./architecture/components.md)** to understand the system architecture and modules.
3. Check **[architecture/operations.md](./architecture/operations.md)** for setup, execution, and troubleshooting.
4. Review **[architecture/decisions.md](./architecture/decisions.md)** for key architectural decisions.

### For Maintainers
1. Check **[project/backlog.md](./project/backlog.md)** for known issues, technical debt, and future improvements.
2. Review **[project/inventory.md](./project/inventory.md)** for a complete inventory of files, modules, and integrations.

## 🔗 Quick Links

- **[Overview](./architecture/overview.md)** - Purpose, scope, business rules
- **[Components](./architecture/components.md)** - System architecture and modules
- **[Operations](./architecture/operations.md)** - Setup, execution, troubleshooting
- **[Decisions](./architecture/decisions.md)** - Architecture Decision Records
- **[Backlog](./project/backlog.md)** - Technical debt and future improvements
- **[Inventory](./project/inventory.md)** - Complete project inventory

## 📝 Documentation Standards

- All documentation is written in **English** (canonical source).
- Use **relative paths** for internal references (e.g., `[link](./architecture/overview.md)).
- Reference code with **file:line** format (e.g., `main.js:17`).
- Keep documentation **aligned with the code** - update docs when code changes.

## 🤖 Documentation Agent

This project uses a **Documentation Agent** to automate documentation maintenance. The agent:
- Audits documentation for consistency with code
- Generates new documentation (ADRs, backlog, inventory)
- Detects changes in the codebase
- Validates documentation vs code
- Formats Markdown files

See `.agents/skills/documentation-agent/` for more details.

## 📄 Legacy Documentation

The original `codex-context/` directory has been **reorganized** into this structure. The old files are preserved in the Git history but are no longer maintained in their original location.

## 🔍 Search Tips

- Use `grep` or `rg` to search across all documentation:
  ```bash
  grep -r "CLASSIFICADOR_PROVIDER" docs/
  ```
- Use `find` to locate specific topics:
  ```bash
  find docs/ -name "*.md" -exec grep -l "DeepSeek" {} \;
  ```
