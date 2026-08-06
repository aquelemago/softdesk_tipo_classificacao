---
id: find-references
version: 1.0.0
name: Find references
description: Localiza todas as referencias (require/import + doc-texto) a um modulo ou path no projeto.
category: analysis
tags: [search, refactor, deps]
author: meta-refactor
---

# Find references

## Objetivo
Antes de mover/renomear um arquivo, listar todas as referencias a ele para atualizar de forma completa.

## Responsabilidade
- Buscar em arquivos `.js`, `.json`, `.md`
- Identificar padroes:
  - `require('./path/to/module')` e `require("../path/to/module")`
  - Referencias textual a `src/path/to/file.js` em markdown
- Destacar caminhos relativos vs absolutos
- Saida parseavel para alimentar `import-update` e `doc-sync`

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| targets | string[] | sim | Caminhos ou nomes de base a buscar (ex.: `['src/test-retorna-ultimos-chamados-abertos.js', 'test-retorna-ultimos-chamados-abertos']`) |
| include | string[] | nao | Padroes de arquivo para escopo (default: `['*.js','*.json','*.md']`) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| references | array | `{ file, line, column, match, type }` onde `type` e `require` ou `doc-text` |
| summary | object | `{ totalFiles, totalMatches, byType: { require, doc-text } }` |

## Pre-requisitos
- Projeto existe
- `targets[]` nao vazio

## Criterios de sucesso
- Toda ocorrencia exata do target aparece na saida
- Linha e coluna corretas
- Diferenciacao entre `require` e texto em markdown

## Limitacoes
- Nao encontra referencias dinamicas (template strings com variaveis)
- Nao analisa AST; usa regex/grep
- Distincao string-indexed: pode haver falso positivo em comentarios
