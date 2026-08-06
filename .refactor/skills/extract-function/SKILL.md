---
id: extract-function
version: 1.0.0
name: Extract Function to Module
description: Moves a function (or group of related functions) from a source file to a new module file, updating exports and imports accordingly.
category: refactor
tags: [refactor, extract, module, function]
author: meta-refactor
---

# Extract Function to Module

## Objective
Extract a function or related functions from a large file into a new dedicated module, preserving behavior and updating all references.

## Responsibility
- Read source function(s) from source file
- Create new module file with proper exports
- Remove function(s) from source file
- Update source file exports (remove extracted, add re-export if needed)
- Update all importers via `import-update` skill
- Preserve function signature, JSDoc, and behavior exactly

## Inputs
| Name | Type | Required | Description |
|---|---|---|---|
| sourceFile | string | yes | File containing function(s) to extract |
| functionNames | string[] | yes | Names of functions to extract |
| targetFile | string | yes | New module file path |
| exportStyle | string | no | `named` (default) or `default` |
| updateImports | boolean | no | Auto-run import-update on referrers (default: true) |

## Outputs
| Name | Type | Description |
|---|---|---|
| extracted | boolean | True if extraction succeeded |
| sourceFile | string | Modified source file |
| targetFile | string | Created module file |
| updatedImporters | string[] | Files that had imports updated |

## Pre-requisites
- Source file exists and contains the functions
- Target file does not exist
- Functions are self-contained (no closure over source-file locals)

## Success Criteria
- Target file created with correct exports
- Source file no longer contains extracted functions
- All imports updated to point to new module
- `npm test` passes
- `validate-imports` passes

## Limitations
- Cannot extract functions that close over local variables in source file
- Does not handle class methods (only standalone functions)
- Requires manual review for complex extractions