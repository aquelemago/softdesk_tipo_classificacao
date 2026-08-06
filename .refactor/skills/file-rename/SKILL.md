---
id: file-rename
version: 1.0.0
name: Rename file (same dir)
description: Caso especial de file-move onde origem e destino estao no mesmo diretorio. Usa `git mv`.
category: filesystem
tags: [fs, git, refactor]
author: meta-refactor
---

# Rename file (same dir)

## Objetivo
Renomear um arquivo no mesmo diretorio preservando historico Git.

## Responsabilidade
- Verificar que `dirname(source) === dirname(destination)`
- Verificar que origem existe e destino nao existe
- Executar `git mv <src> <dst>`
- Nao atualizar imports (use `import-update`)

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| sourcePath | string | sim | Caminho relativo da origem |
| destinationPath | string | sim | Caminho relativo do destino (mesmo dir) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| renamed | boolean | true se executou |
| sourcePath | string | |
| destinationPath | string | |

## Pre-requisitos
- `dirname(source) === dirname(destination)` (senao usar `file-move`)
- origem existe, destino nao existe
- working tree limpa fora do escopo da etapa

## Criterios de sucesso
- `git status` mostra `R source -> destination`
- `fs.existsSync(destination) === true && !fs.existsSync(source)`

## Limitacoes
- Nao move entre diretorios (use `file-move`)
- Nao atualiza imports
