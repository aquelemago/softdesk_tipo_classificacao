---
id: file-move
version: 1.0.0
name: Move file (git mv)
description: Move um arquivo preservando historico via `git mv`. Nao altera imports; use `import-update` para isso.
category: filesystem
tags: [fs, git, refactor]
author: meta-refactor
---

# Move file (git mv)

## Objetivo
Mover/renomear um arquivo mantendo rastreabilidade Git via `git mv`.

## Responsabilidade
- Criar diretorio de destino se necessario
- Verificar que origem existe e destino nao existe
- Executar `git mv <src> <dst>`
- Nao modificar conteudo do arquivo movido
- Nao atualizar imports (responsabilidade de `import-update`)

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| sourcePath | string | sim | Caminho relativo da origem |
| destinationPath | string | sim | Caminho relativo do destino |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| moved | boolean | true se `git mv` executou |
| sourcePath | string | Caminho de origem confirmado |
| destinationPath | string | Caminho de destino confirmado |

## Pre-requisitos
- `fs.existsSync(sourcePath) === true`
- `fs.existsSync(destinationPath) === false`
- Working tree limpa fora do escopo da etapa
- `git` disponivel

## Criterios de sucesso
- `git status` mostra `R <sourcePath> -> <destinationPath>` (rename detectado)
- `fs.existsSync(sourcePath) === false`
- `fs.existsSync(destinationPath) === true`
- Conteudo byte-a-byte identico ao original

## Limitacoes
- Nao move diretorios (usar `directory-move` se existente; para listar `git mv` recursivo)
- Nao atualiza imports
- Recusa se destino ja existe
- Recusa se working tree esta suja fora do escopo da etapa
