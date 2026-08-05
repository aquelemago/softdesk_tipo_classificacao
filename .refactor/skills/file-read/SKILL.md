---
id: file-read
version: 1.0.0
name: Read file (for analysis)
description: Carrega conteudo de um arquivo para inspecao, diff, comparacao. Nao modifica nada.
category: filesystem
tags: [fs, analysis, readonly]
author: meta-refactor
---

# Read file (for analysis)

## Objetivo
Ler um arquivo do projeto para analise sem causar qualquer side-effect.

## Responsabilidade
- Abrir arquivo em modo leitura
- Retornar conteudo como string
- Nao executar, nao chamar `require()`, nao fazer parse semantico

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| filePath | string | sim | Caminho relativo do arquivo |
| offset | number | nao | Linha inicial (1-indexado) |
| limit | number | nao | Maximo de linhas |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| content | string | Conteudo |
| lines | number | Total de linhas |
| bytes | number | Tamanho em bytes |

## Pre-requisitos
- Arquivo existe

## Criterios de sucesso
- Retornou conteudo legivel
- Nao gerou side-effect

## Limitacoes
- Nao interpreta conteudo
- Nao valida JSON/schema
- Arquivos muito grandes devem ser paginados com offset/limit
