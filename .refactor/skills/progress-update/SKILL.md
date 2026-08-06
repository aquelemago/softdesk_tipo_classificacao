---
id: progress-update
version: 1.0.0
name: Progress update
description: Atualiza `progress.json` de forma atomica (escreve .tmp e renomeia) apos uma etapa ser concluida ou falhar.
category: progress
tags: [progress, persistence]
author: meta-refactor
---

# Progress update

## Objetivo
Persistir o estado corrente em `.refactor/progress.json` sem deixar o arquivo em estado parcial.

## Responsabilidade
- Carregar `progress.json` atual
- Aplicar a transformacao passada (markCompleted, markFailed, markBlocked, appendHistory, etc.)
- Escrever `progress.json.tmp`
- Renomear `progress.json.tmp` -> `progress.json`
- Atualizar `lastRun` e `history[]`

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| operation | string | sim | Uma de: `startStage`, `completeStage`, `failStage`, `blockStage`, `appendHistory`, `recordSkill`, `recordValidation`, `recordError`, `setPlanHash` |
| payload | object | sim | Dados da operacao (ex.: `{ stageId, commitSha, filesTouched, skillsUsed, validations, tests }`) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| ok | boolean | true se persistido com sucesso |
| progress | object | Novo estado de `progress.json` |

## Pre-requisitos
- `.refactor/` existe e tem permissao de escrita
- schemaVersion de `progress.json` e compativel

## Criterios de sucesso
- `progress.json` e valido JSON apos a operacao
- `history[]` cresceu em uma entrada
- `lastRun` atualizado
- Nao existe `progress.json.tmp` residual

## Limitacoes
- Nao reescreve o passado (history e append-only)
- Nao cria novas etapas; so atualiza estado das existentes
- Nao decide proxima etapa; apenas atualiza `currentStageId` em operacao explicita
