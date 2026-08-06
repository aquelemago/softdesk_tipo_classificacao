# Documentation Moved

⚠️ **This directory has been reorganized.**

The documentation previously located in `codex-context/` has been moved to `docs/` with a new, more organized structure.

## 📁 New Documentation Structure

All documentation is now located in the [`docs/`](../docs/) directory:

```
docs/
├── README.md                      # Documentation index
├── architecture/                  # Technical architecture
│   ├── overview.md               # Purpose, scope, business rules
│   ├── components.md             # System modules and flow
│   ├── operations.md             # Setup, execution, troubleshooting
│   └── decisions.md              # Architecture Decision Records (ADRs)
└── project/                      # Project management
    ├── backlog.md                # Technical debt and future improvements
    └── inventory.md              # Project inventory
```

## 🔗 Quick Access

- **[New Documentation Index](../docs/README.md)**
- **[Overview](../docs/architecture/overview.md)**
- **[Components](../docs/architecture/components.md)**
- **[Operations](../docs/architecture/operations.md)**
- **[Decisions (ADRs)](../docs/architecture/decisions.md)**
- **[Backlog](../docs/project/backlog.md)**
- **[Inventory](../docs/project/inventory.md)**

## 🗑️ Cleanup

This directory (`codex-context/`) is now **deprecated** and will be removed in a future commit. Please update your bookmarks and references to point to the new [`docs/`](../docs/) directory.

## 📝 Why This Change?

The documentation was reorganized to:
1. **Improve clarity** with a more intuitive structure
2. **Separate concerns** between architecture, project management, and reference materials
3. **Make it easier** to find and maintain documentation
4. **Follow best practices** for project documentation organization

## 🔍 How to Find What You Need

- **For architecture and technical details**: Check the [`architecture/`](../docs/architecture/) directory
- **For project management**: Check the [`project/`](../docs/project/) directory
- **For reference materials**: Check the [`reference/`](../docs/reference/) directory

---

*Last updated: August 6, 2026*
