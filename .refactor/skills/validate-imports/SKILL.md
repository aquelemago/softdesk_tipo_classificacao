---
id: validate-imports
version: 1.0.0
name: Validate imports (static parse)
description: Verifica estaticamente que todos os require() em uma lista de arquivos resolvem para arquivos existentes, SEM carregar os modulos (evita side-effects).
category: validation
tags: [validation, refactor, require]
author: meta-refactor
---

# Validate imports (static parse)

## Objetivo
Confirmar que cada `require('...')` em arquivos JS aponta para um arquivo existente ou modulo npm instalado, por parse estatico (regex), sem chamar `require()` de fato.

## Responsabilidade
- Parsear `require('...')` em arquivos alvo via regex
- Resolver caminho relativo contra `dirname` do arquivo-fonte
- Testar existencia (com e sem extensao `.js`)
- Para packages nao-relativos: verificar `node_modules/<pkg>/package.json` existe
- Reportar OK / FAIL por require
- NUNCA executar `node -e "require(...)"` em arquivos auto-executaveis (main.js, server.js)

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| files | string[] | sim | Arquivos a parsear |
| projectRoot | string | nao | Default `.` (cwd) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| totalRequire | number | Total de require() encontrados |
| ok | number | Resolvem |
| external | number | node_modules |
| failed | array | `{ file, require, reason }` |

## Pre-requisitos
- Arquivos alvo existem
- Projeto tem `node_modules/` e `package.json`

## Criterios de sucesso
- Todos os require resolvem (`failed.length === 0`) OU
- Apenas externais (npm) que nao foram o alvo da etapa

## Limitacoes
- Nao valida semantica (apenas path existence)
- Para `require()` dinamico com template string, nao consegue resolver
- Nao detecta ciclos
- Poweshell/Node implementation differences em path resolution edge-cases
