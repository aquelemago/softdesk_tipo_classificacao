---
id: git-status
version: 1.0.0
name: Git status
description: Verifica o estado do working tree via `git status --porcelain` e decide clean/dirty.
category: git
tags: [git, validation]
author: meta-refactor
---

# Git status

## Objetivo
Retornar o estado atual do working tree de forma parseavel e decidir se esta limpo ou sujo, e se a sujeira esta dentro do escopo de uma etapa.

## Responsabilidade
- Executar `git status --porcelain --branch`
- Classificar como `clean` ou `dirty`
- Quando `dirty`, listar arquivos alterados e comparar com `allowedFiles` (escopo da etapa)

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| allowedFiles | string[] | nao | Lista de caminhos permitidos pela etapa corrente; se ausente, qualquer alteracao conta como dirty |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| status | string | `clean` ou `dirty` |
| branch | string | Branch corrente |
| files | string[] | Arquivos modificados (path + status) |
| outOfScope | string[] | Arquivos fora de `allowedFiles`, se fornecido |

## Pre-requisitos
- Estar em um repositorio git
- Sem operacao git concorrente

## Criterios de sucesso
- `git status --porcelain` executa sem erro
- Resultado parseado em estrutura estavel
- Decisao clean/dirty booleana

## Limitacoes
- Nao resolve conflitos
- Nao faz stage
- Nao interpreta submodules
