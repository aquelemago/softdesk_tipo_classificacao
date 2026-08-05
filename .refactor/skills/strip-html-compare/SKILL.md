---
id: strip-html-compare
version: 1.0.0
name: Compare stripHtml variants over corpus
description: Especifica para Etapa E3. Compara output das duas versoes de stripHtml (regex simples vs seguro) sobre um corpus de descricoes de chamados para validar que a unificacao e segura.
category: validation
tags: [validation, texto, html, etapae3]
author: meta-refactor
---

# Compare stripHtml variants over corpus

## Objetivo
Antes de unificar as duas implementacoes de stripHtml (logger vs classificador), confirmar sobre um corpus que o output seria o mesmo (ou reportar onde diverge para decisao).

## Responsabilidade
- Carregar corpus de descricoes de chamados (>=20 amostras)
- Aplicar cada uma das duas versoes de stripHtml
- Comparar resultados via `text-diff`
- Reportar: igual | diferente (com contagem e amostras de divergencia)
- Nao modifica codigo-fonte; apenas analisa

## Entradas
| Nome | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| corpus | array | sim | Array de strings (descricoes de chamados) |
| stripHtmlSimple | function | sim | Versao do logger (regex simples) |
| stripHtmlSafe | function | sim | Versao do classificador (script/style/entities) |

## Saidas
| Nome | Tipo | Descricao |
|---|---|---|
| equalSamples | number | Amostras onde os dois outputs sao identicos |
| divergentSamples | number | Amostras onde divergem |
| divergentDetails | array | Lista de `{ index, sample, diff }` para as primeiras 5 divergencias |
| safe | boolean | true se `divergentSamples === 0` |

## Pre-requisitos
- Corpus com >=20 amostras
- Duas funcoes stripHtml acessiveis em runtime
- Corpus pode ser hardcoded ou obtido de chamados reais DRY_RUN (mas sempre com DRY_RUN=true)

## Criterios de sucesso
- Reporte deterministic das diferencas
- Se safe=true, autoriza a unificacao
- Se divergentSamples>0, **NAO** unificar automaticamente; reportar como BLOCKED e aguardar decisao humana

## Limitacoes
- Corpus limitado a amostras disponiveis no momento
- Nao garante zero divergencia para casos nao testados
- Em caso de divergencia, nao decide qual versao e correta; apenas reporta
