---
id: file-write
version: 1.0.0
name: Write/create file
description: Cria ou sobrescreve um arquivo com conteudo especificado. Nao move nem renomeia.
category: filesystem
tags: [fs, refactor, write]
author: meta-refactor
---

# Write/create file

## Objetivo
Criar um arquivo novo ou sobrescrever conteudo de um arquivo existente (geralmente para extracao de funcao ou criacao de modulo compartilhado).

## Responsabilidade
- Verificar que diretorio pai existe (criar se necessario)
- Escrever conteudo
- Preservar line endings do projeto (LF no caso deste repo,exceto se gitattributes indicar outro)
- Nao alterar outros arquivos

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| filePath | string | sim | Caminho relativo do arquivo |
| content | string | sim | Conteudo a escrever |
| overwrite | boolean | nao | Se false, recusa se arquivo ja existe (default: true) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| written | boolean | true se escreveu |
| filePath | string | Caminho final |
| bytesWritten | number | Tamanho em bytes |

## Pre-requisitos
- Diretorio pai existe (ou sera criado)
- Working tree limpa fora do escopo da etapa
- Se `overwrite=false`, arquivo nao existe

## Criterios de sucesso
- `fs.existsSync(filePath) === true`
- Conteudo byte-a-byte igual a `content`
- Linha final tem newline (convencao do repo)

## Limitacoes
- Nao cria 中diretorios explicitamente pedido (somente pai automatico)
- Nao atualiza imports de outros arquivos (use `import-update`)
- Nao valida semantica JS (use `test-runner` apos)
