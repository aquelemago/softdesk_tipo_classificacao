---
id: commit-manager
version: 1.0.0
name: Commit manager
description: Cria exatamente um commit ao final de uma etapa verde, com mensagem canonica. Gera rollback/<id>.json antes do commit.
category: git
tags: [git, commit, audit]
author: meta-refactor
---

# Commit manager

## Objetivo
Produzir um commit por etapa, com mensagem estruturada e auditavel, e gravar mapa de rollback.

## Responsabilidade
- Antes do commit: ler `previousSha` (HEAD corrente) e salvar em `.refactor/rollback/<stageId>.json`
- `git add <files>` apenas para arquivos listados em `filesInvolved` (+ doc-sync derivado)
- Criar commit com mensagem canonica (ver secao Mensagem)
- Apos o commit: retornar `commitSha` para o Progress Manager

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| stageId | string | sim | ID da etapa (ex.: `E1`) |
| stageName | string | sim | Nome curto da etapa |
| summary | string | sim | Uma linha de resumo |
| files | string[] | sim | Arquivos a serem staged |
| skillsUsed | string[] | sim | IDs das Skills utilizadas |
| testsRun | object[] | sim | Resultado de cada teste (`test`, `status`) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| commitSha | string | SHA do commit criado |
| previousSha | string | SHA do HEAD antes do commit |
| rollbackPath | string | Caminho de `.refactor/rollback/<stageId>.json` |

## Mensagem canonica
```
refactor(<stageId>): <stageName>

<summary>

Stage: <stageId>
Phase: <phase>
Files:
  - <arquivo1>
  - <arquivo2>
Skills used:
  - <skillId@version>
Tests:
  - <testName> (pass|fail)
Rollback: .refactor/rollback/<stageId>.json
```

## Pre-requisitos
- Working tree apenas com arquivos de `filesInvolved` (+ doc-sync)
- Todas as validacoes passaram
- Todos os tests em `requiredTests` passaram

## Criterios de sucesso
- `git log -1` mostra o commit
- `commitSha` != `previousSha`
- `.refactor/rollback/<stageId>.json` existe e tem `previousSha` + `commitSha`
- Hook do git passou (sem `--no-verify`)

## Limitacoes
- Nao usa `--amend`, `--no-verify`, `--force`, `--squash`
- Nao faz `git add .` ou `git add -A`
- Se hook falhar, NAO commita; retorna erro e etapa volta para in_progress
- Se `files` incluir arquivo fora de `filesInvolved` da etapa -> recusa
- Nao cria commit se ja existe commit para a etapa (idempotente)
