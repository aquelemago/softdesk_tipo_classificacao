---
id: import-update
version: 1.0.0
name: Update require/import paths
description: Substitui referencias de caminho de require() em arquivos .js apos movimentacao/renomeacao.
category: refactor
tags: [refactor, imports, require]
author: meta-refactor
---

# Update require/import paths

## Objetivo
Atualizar caminhos em `require('...')` (CommonJS) quando um modulo e movido/renomeado ou quando o proprio arquivo que faz o require e movido (mudanca de profundidade relativa).

## Responsabilidade
- Identificar arquivos que referenciam o modulo movido/renomeado (via `find-references`)
- Identificar o proprio arquivo movido que precisa atualizar seus requires por mudanca de profundidade
- Aplicar substituicao textual precisa (regex ou string replace)
- Preservar estilo de aspas (simples/dupla) do require original
- Nao alterar logica

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| updates | array | sim | Lista de `{ file, from, to }` aplicaveis |
| file | string | nao | Se restrito a um arquivo especifico |

Cada `update`:
```json
{
  "file": "main.js",
  "from": "require('./src/test-retorna-ultimos-chamados-abertos')",
  "to": "require('./src/softdesk/retornaChamadosAbertos')"
}
```

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| updated | array | Lista de `{ file, linesChanged, oldLine, newLine }` |
| untouched | array | Arquivos do input que nao tiveram match |

## Pre-requisitos
- Arquivos alvo existem
- Padrao `from` ocorre pelo menos uma vez no arquivo (senao `untouched`)

## Criterios de sucesso
- Para cada `update` aplicado:
  - `from` nao aparece mais no arquivo alvo
  - `to` aparece exatamente uma vez por ocorrencia original
- Sintaxe JS preservada (sem chaves/parenteses desbalanceados)
- Confirmado por validacao require-time: `node -e "require('./<file>')"` nao lanca `MODULE_NOT_FOUND` para nenhum modulo alterado

## Limitacoes
- Suporta apenas CommonJS (`require`/`module.exports`)
- Nao suporta ESM `import`/`export` (projeto nao usa)
- Nao refatora exports, apenas caminhos de importacao
- Recusa aplicar se `from` aparece em comentario (gera falso positivo)
