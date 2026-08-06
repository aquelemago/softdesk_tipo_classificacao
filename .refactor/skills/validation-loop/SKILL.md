---
id: validation-loop
version: 1.0.0
name: Validation Loop
description: Executes all validations and tests in a loop with auto-fix attempts. Only returns success when ALL validations AND ALL tests pass. Enforces max retry limit.
category: validation
tags: [validation, loop, gate, quality-gate]
author: meta-refactor
---

# Validation Loop

## Objective
Gate that runs all required validations and tests repeatedly with auto-fix attempts. **Only returns success when 100% of validations AND 100% of tests pass.** Fails fast if max retries exceeded.

## Responsibility
- Execute all `validations[]` declared for the stage (git-status, validate-imports, validate-structure, validate-docs, etc.)
- Execute all `requiredTests[]` declared for the stage (npm test, dry-run-corpus-diff, server-boot-check, etc.)
- If ANY validation or test fails:
  - Log what failed
  - Trigger auto-fix attempt (via `auto-fix` skill if available, or generic import/structure fix)
  - Re-run ALL validations + tests (not just the failed ones)
  - Repeat up to `maxAttempts` (default 3)
- If all pass → return `success: true`
- If max attempts exceeded → return `success: false` with full failure report

## Inputs
| Name | Type | Required | Description |
|---|---|---|---|
| stageId | string | yes | Current stage ID (for loading stage config) |
| validations | array | yes | List of validation skill IDs to run (from stage.requiredValidations or inferred) |
| tests | array | yes | List of test skill IDs to run (from stage.requiredTests) |
| maxAttempts | number | no | Max auto-fix + revalidation cycles (default 3) |
| autoFixSkills | array | no | Skills to try for auto-fix (default: ["import-update", "validate-imports", "validate-structure"]) |

## Outputs
| Name | Type | Description |
|---|---|---|
| success | boolean | True only if ALL validations AND ALL tests pass |
| attemptsUsed | number | How many cycles executed (1 = first try) |
| validationResults | array | Per-validation: `{name, passed, details, attempt}` |
| testResults | array | Per-test: `{name, status, passed, failed, durationMs, attempt}` |
| finalError | string | If failed, summary of what still fails |
| logs | array | Full log of each cycle for audit |

## Pre-requisites
- Stage config loaded (from `01-etapas.json`)
- All validation skills registered in registry
- All test skills registered in registry
- Working tree clean before first attempt (except intentional changes)

## Success Criteria
- `success === true` ONLY when:
  - Every validation in `validations[]` returns `passed: true`
  - Every test in `tests[]` returns `status: "pass"`
- If any single validation or test fails on final attempt → `success: false`

## Auto-Fix Strategy (per attempt)
1. **Import errors** → run `import-update` on failing files + `validate-imports`
2. **Structure errors** → run `validate-structure` → create missing dirs/files if declared
3. **Doc sync errors** → run `doc-sync` on affected markdown
4. **Test failures** → if test is `npm test` and failure is import-related, retry import fix
5. **Git scope errors** → unstage files outside `filesInvolved[]`

## Limits
- **Max 3 attempts** (configurable via `maxAttempts`)
- Each attempt runs **ALL** validations + tests (not incremental)
- No partial success — either 100% green or fail
- Timebox: each attempt max 120s (npm test timeout)

## Failure Report (when max attempts exceeded)
```json
{
  "success": false,
  "attemptsUsed": 3,
  "finalError": "Validation 'validate-imports' failed after 3 attempts: main.js -> ./src/missing/module",
  "validationResults": [...],
  "testResults": [...],
  "logs": [
    {"attempt": 1, "validations": {...}, "tests": {...}, "fixesApplied": ["import-update on main.js"]},
    {"attempt": 2, "validations": {...}, "tests": {...}, "fixesApplied": []},
    {"attempt": 3, "validations": {...}, "tests": {...}, "fixesApplied": []}
  ]
}
```

## Integration Point
Called by Executor **after applying stage changes**, before Commit Manager.
Replaces manual "validate → test → fix → repeat" with single deterministic gate.

## Example Usage (Executor pseudo-code)
```
const gate = loadSkill('validation-loop');
const result = gate.execute({
  stageId: 'E4',
  validations: ['git-status', 'validate-imports', 'validate-structure', 'validate-docs'],
  tests: ['npm test'],
  maxAttempts: 3
});
if (!result.success) {
  progress.failStage(stageId, result.finalError);
  return; // STOP - no commit
}
// success → proceed to commit-manager
```