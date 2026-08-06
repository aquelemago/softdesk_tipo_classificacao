---
id: doc-sync
version: 1.0.0
name: Sync documentation references
description: Atualiza referencias de caminhos de arquivos em documentacao markdown apos movimentacao/renomeacao.
category: docs
tags: [docs, markdown, refactor]
author: meta-refactor
---

# Sync documentation references

## Objetivo
Manter a documentacao canonica (`codex-context/*.md`) sincronizada com a arvore de arquivos apos uma etapa de refactor.

## Responsabilidade
- Localizar referencias a caminhos antigos em arquivos `.md` (especificamente arquivos listados em `filesInvolved` da etapa)
- Substituir pelos novos caminhos
- Atualizar referencias de linha (`src/foo.js:42`) apenas quando a etapa tambem explicitou mudancas de linha; caso contrario manter o caminho novo e marcar a linha como `?` ou remover a referencia de linha
- Nao alterar prose, apenas caminhos de arquivos referenciados

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| files | string[] | sim | Arquivos `.md` alvo (devem estar em `filesInvolved[]` da etapa) |
| mapping | object | sim | Mapa `oldPath -> newPath` (string) |
| lineMapping | object | nao | Mapa `oldPath:line -> newPath:line` se necessario |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| updated | array | `{ file, linesChanged }` |
| untouched | array | Arquivos sem match |

## Pre-requisitos
- `files[]` listados em `filesInvolved[]` da etapa (escopo respeitado)
- `mapping{}` nao vazio

## Criterios de sucesso
- Cada `oldPath` em `mapping` nao aparece mais nos arquivos processados
- Cada `newPath` que substituiu um `oldPath` aparece pelo menos uma vez
- Markdown permanece valido (sem quebra de tabela/lista)
- Confirmado por `git diff` apenas nos arquivos listados em `files`

## Limitacoes
- Nao reescreve tabela inteira automaticamente (posicao de colunas pode mudar)
- Nao cria novos paragrafos
- Nao atualiza ADRs por conta propria (fica para etapa de docs dedicada, ex.: E7)
- Se referencia de linha `src/foo.js:42` ficar obsoleta por mudanca de codigo em outra etapa, so sera corrigida emE7 (canonica) ou por etapa explicita
