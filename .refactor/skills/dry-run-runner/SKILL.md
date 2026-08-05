---
id: dry-run-runner
version: 1.0.0
name: Dry-run runner (DRY_RUN=true)
description: Executa um pipeline/arquivo em modo seguro, forçando DRY_RUN=true e capturando o resultado sem side-effects.
category: testing
tags: [test, safety, dry-run]
author: meta-refactor
---

# Dry-run runner (DRY_RUN=true)

## Objetivo
Rodar scripts ou pipelines que fariam mutacoes reais forçando `DRY_RUN=true` via override de env, capturando stdout/stderr, e comparando resultados antes/depois de uma mudanca de codigo.

## Responsabilidade
- Setar `process.env.DRY_RUN='true'` explicitamente via variavel de ambiente no processo fillo
- Setar tambem `AUTO_SCHEDULE_ENABLED=false` se aplicavel
- Executar o alvo (ex.: `node main.js`)
- Capturar stdout/stderr/exitCode
- NUNCA passar .env valores reais que possam sobrescrever o override
- Timeout curto (segundos) para evitar tavamento
- Nao chamar APIs reais que mutam estado (DRY_RUN deve impedir)

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| script | string | sim | Arquivo a rodar (ex.: `main.js`) |
| args | string[] | nao | Argumentos (ex.: `['5']` para limit=5) |
| timeoutMs | number | nao | Default 30s |
| extraEnv | object | nao | Outras env (ex.: `{AUTO_SCHEDULE_ENABLED:'false'}`) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| exitCode | number | Codigo de saida |
| stdout | string | Saida padrao |
| stderr | string | Saida de erro |
| durationMs | number | Duracao |
| timedOut | boolean | True se timeout |

## Pre-requisitos
- Script existe
- `DRY_RUN=true` realmente suprime writes (validar codigo-fonte antes de confiar)
- Sem network real se gravacao importar (mesmo em DRY_RUN chamadas GET podem ocorrer)

## Criterios de sucesso
- Processo terminou antes do timeout
- Exit code 0
- Nenhum log de "PUT" ou "Registro alterado" no DRY_RUN

## Limitacoes
- Ainda faz GET em APIs (Softdesk list, LLM) se o pipeline faz essas chamadas em modo dry-run
- SLA real/429/quota ainda aplicam
- Pode consumir quota Gemini mesmo sem mutar Softdesk
