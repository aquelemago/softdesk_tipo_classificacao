---
id: text-diff
version: 1.0.0
name: Text diff
description: Compara duas strings e reporta igualdade ou diferenca. Usado para validar que dois outputs sao identicos.
category: analysis
tags: [diff, text, validation]
author: meta-refactor
---

# Text diff

## Objetivo
Comparar duas strings (ou dois arquivos) e confirmar se sao identicas. Reportar diferenca se houver.

## Responsabilidade
- Comparar byte-a-byte (ou char-a-char)
- Se diferente, identificar primeira divergencia e trecho
- Nao aplica correcoes

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| left | string | sim | String A ou caminho de arquivo A |
| right | string | sim | String B ou caminho de arquivo B |
| mode | string | nao | `string` (default) ou `file` |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| equal | boolean | true se identicas |
| firstDiffIndex | number | Posicao da primeira divergencia (-1 se equal) |
| summary | string | Linha descritiva curta |

## Pre-requisitos
- Entradas validas

## Criterios de sucesso
- Resposta booleana determinista `equal`

## Limitacoes
- Sem diff estruturado (linhas/contexto); apenas primeira divergencia
- Sensitive a whitespace/encoding; usar normalizacao explicita se necessario
