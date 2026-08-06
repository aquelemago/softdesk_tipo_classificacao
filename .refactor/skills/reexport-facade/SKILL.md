---
id: reexport-facade
version: 1.0.0
name: Create Re-export Facade
description: Creates or updates a facade module that re-exports all public API from multiple internal modules, preserving backward compatibility.
category: refactor
tags: [refactor, facade, reexport, compatibility]
author: meta-refactor
---

# Create Re-export Facade

## Objective
Create a facade file that re-exports all public symbols from multiple internal modules, so existing consumers (`require('./old-module')`) continue working unchanged.

## Responsibility
- Analyze original module's `module.exports` (all named exports + default)
- Create facade file that imports from new internal modules and re-exports everything
- Preserve exact export names, order, and values
- Ensure facade passes `validate-imports` and `npm test`

## Inputs
| Name | Type | Required | Description |
|---|---|---|---|
| facadeFile | string | yes | Path to facade file (usually original file location) |
| internalModules | object | yes | Map of `exportName -> internalModulePath` |
| preserveDefault | boolean | no | Keep `module.exports = ...` default export (default: true) |

## Outputs
| Name | Type | Description |
|---|---|---|
| facadeCreated | boolean | True if facade written |
| exportsPreserved | string[] | List of export names re-exported |
| warnings | string[] | Any symbols not found in internal modules |

## Pre-requisites
- All internal modules exist and export the expected symbols
- Facade file path is writable

## Success Criteria
- Facade file exists and re-exports all original symbols
- `npm test` passes (existing tests import from facade)
- `validate-imports` passes
- No external code needs modification

## Limitations
- Cannot handle circular dependencies between internal modules
- Dynamic `require()` calls not analyzed
- Must manually list all exports to preserve (or parse from original)