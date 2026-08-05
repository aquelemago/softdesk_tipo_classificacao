---
id: validate-structure
version: 1.0.0
name: Validate project structure
description: Confirma que a arvore de arquivos esperada apos a etapa bate com a real (arquivos criados, movidos, removidos conforme plano).
category: validation
tags: [validation, fs]
author: meta-refactor
---

# Validate project structure

## Objetivo
Garantir que a estrutura do projeto apos a etapa corresponde ao declarado no plano da etapa.

## Responsabilidade
- Para cada arquivo em `expectedExists[]`: confirmar `fs.existsSync`
- Para cada arquivo em `expectedMissing[]`: confirmar `!fs.existsSync`
- Para cada diretorio em `expectedDirs[]`: confirmar exists + isDirectory
- Comparar optionally com `git ls-files` para confirmar rastreio

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| expectedExists | string[] | nao | Arquivos que devem existir |
| expectedMissing | string[] | nao | Arquivos que NAO devem existir |
| expectedDirs | string[] | nao | Diretorios que devem existir |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| pass | boolean | true se todas as expectativas match |
| checked | object | `{ exists: ok/fail[], missing: ok/fail[], dirs: ok/fail[] }` |

## Pre-requisitos
- Working tree paar corresponder a aplicacao da etapa

## Criterios de sucesso
- `pass === true`

## Limitacoes
- Nao valida conteudo dos arquivos, apenas existencia
- Nao detecta arquivos extras fora de expectedExists (use git-status separado)
