---
id: test-runner
version: 1.0.0
name: Test runner (npm test)
description: Executa a suite de testes do projeto (`npm test`) e parsea o resultado em estrutura canônica.
category: testing
tags: [test, npm, validation]
author: meta-refactor
---

# Test runner (npm test)

## Objetivo
Rodar a suite canônica do projeto e produzir um resultado parseável.

## Responsabilidade
- Executar `npm test` (projeto Node.js -> `node --test tests/*.test.js`)
- Capturar stdout/stderr e exit code
- Interpretar resultado do `node:test` reporter padrão

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| timeoutMs | number | nao | Timeout opcional (default 120000) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| status | string | `pass` ou `fail` |
| exitCode | number | Codigo de saida do processo |
| testsTotal | number | Total de testes reportados |
| testsPassed | number | Testes passando |
| testsFailed | number | Testes falhando |
| durationMs | number | Duracao |
| failures | object[] | Lista de falhas com nome + mensagem |
| rawLog | string | Stdout+stderr completo (gravado em tests.log) |

## Pre-requisitos
- `node` no PATH
- `package.json` com script `test` valido
- `node_modules/` instalado (ou autoinstalado via npm)

## Criterios de sucesso
- Processo termina (exit code 0 ou 1)
- Resultado parseado sem ambiguidade

## Limitacoes
- So executa o script `test` do `package.json`; nao roda testes extras declarados em `requiredTests` (essas usam Skills proprias como `dry-run-runner`, `dry-run-corpus-diff`, etc.)
- Nao faz retry
- Nao aplica correcao
