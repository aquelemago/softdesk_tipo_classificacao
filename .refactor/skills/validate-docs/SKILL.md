---
id: validate-docs
version: 1.0.0
name: Validate Documentation References
description: Verifies that all file path references in markdown documentation are valid and point to existing files.
category: validation
tags: [validation, docs, markdown, refactor]
author: meta-refactor
---

# Validate Documentation References

## Objective
Ensure all file references in `codex-context/*.md` (and other docs) point to actual existing files after refactoring.

## Responsibility
- Scan markdown files for file path patterns: `src/...`, `utils/...`, `scripts/...`, `tests/...`
- Verify each referenced file exists on disk
- Check that line references (e.g., `src/file.js:42`) are within file bounds
- Report broken references with file, line, and suggested fix

## Inputs
| Name | Type | Required | Description |
|---|---|---|---|
| docFiles | string[] | yes | Markdown files to check (default: all `codex-context/*.md`) |
| projectRoot | string | no | Root directory (default: `.`) |

## Outputs
| Name | Type | Description |
|---|---|---|
| passed | boolean | True if all references valid |
| totalRefs | number | Total references checked |
| brokenRefs | array | `{ file, line, ref, reason }` for each broken ref |
| suggestions | array | Auto-fix suggestions for common patterns |

## Pre-requisites
- Markdown files exist
- Project structure reflects latest stage

## Success Criteria
- `passed === true`
- `brokenRefs.length === 0`

## Limitations
- Only checks static path references (not dynamic requires)
- Line number validation is best-effort (content may have shifted)
- Does not validate external URLs