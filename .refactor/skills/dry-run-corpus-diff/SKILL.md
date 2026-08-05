---
id: dry-run-corpus-diff
version: 1.0.0
name: Dry-run Corpus Diff
description: Runs the classification pipeline in DRY_RUN mode over a corpus of tickets and compares classification results before/after a refactoring to ensure behavioral equivalence.
category: testing
tags: [test, dry-run, corpus, behavioral, equivalence]
author: meta-refactor
---

# Dry-run Corpus Diff

## Objective
Execute the full classification pipeline (`main.js`) in `DRY_RUN=true` mode over a corpus of real or synthetic tickets, capturing the classification output (tipo, prioridade, confidence) and comparing it against a baseline to detect behavioral changes.

## Responsibility
- Load corpus of ticket data (from file or captured from previous DRY_RUN)
- Run `node main.js <limit>` with `DRY_RUN=true` for each ticket (or batch)
- Parse output logs for classification results: `tipo`, `prioridade`, `confianca`
- Compare against baseline results (from previous run or committed baseline)
- Report any tickets where classification changed

## Inputs
| Name | Type | Required | Description |
|---|---|---|---|
| corpusFile | string | no | JSON file with ticket corpus (default: generate synthetic) |
| baselineFile | string | no | JSON file with baseline classifications |
| limit | number | no | Max tickets to process (default: 20) |
| outputDir | string | no | Where to save current results (default: `.refactor/runs/.../corpus-diff/`) |

## Outputs
| Name | Type | Description |
|---|---|---|
| passed | boolean | True if zero classification changes |
| totalProcessed | number | Tickets processed |
| unchanged | number | Tickets with identical classification |
| changed | array | `{ ticketId, before, after, diff }` for changed tickets |
| currentResultsFile | string | Path to saved current classifications |

## Pre-requisites
- `main.js` works in DRY_RUN mode
- Corpus available (real tickets or synthetic generator)
- `DRY_RUN=true` actually prevents Softdesk PUT (verified in code)

## Success Criteria
- `passed === true` (zero changes)
- If changes detected: report details, **fail the gate**

## Limitations
- Consumes Gemini quota (even in DRY_RUN, LLM calls are made)
- Slow (sequential LLM calls with delays)
- Real tickets require Softdesk API access
- Synthetic corpus may not cover all edge cases