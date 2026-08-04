---
id: git-diff
version: 1.0.0
name: Git diff
description: Mostra o diff do working tree ou de um commit especifico em formato parseavel.
category: git
tags: [git, diff, audit]
author: meta-refactor
---

# Git diff

## Objetivo
Produzir um diff que permita ao Validator conferir que apenas arquivos do escopo da etapa foram alterados.

## Responsabilidade
- Executar `git diff` e/ou `git diff --staged` e/ou `git diff <sha>..<sha>`
- Listar arquivos alterados via `git diff --name-only`

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| scope | string | nao | `working`, `staged` ou `range` (default `working`) |
| from | string | nao | SHA inicial (quando scope=range) |
| to | string | nao | SHA final (quando scope=range) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| files | string[] | Arquivos modificados |
| added | number | Linhas adicionadas |
| removed | number | Linhas removidas |
| fullDiff | string | Diff completo (gravado em run) |

## Pre-requisitos
- Repositorio git

## Criterios de sucesso
- Diff executou sem erro
- Lista de arquivos corresponde ao `git diff --name-only`

## Limitacoes
- Nao aplica patch
- Nao interpreta conflitos de merge
- Limite de tamanho: se `fullDiff` >51200 bytes, truncar e salvar em arquivo
