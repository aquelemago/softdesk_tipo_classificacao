# Organizacao da documentacao

## Objetivo

Registrar a consolidacao final da documentacao humana do projeto para manter `docs/` como unico diretorio principal de documentacao.

## Estado desejado

- `README.md`: curto, com link para `docs/index.md`.
- `docs/`: documentacao humana detalhada.
- `AGENTS.md`: instrucoes curtas para agentes.
- `.agents/`: skills e instrucoes operacionais de IA.

## Conteudo consolidado

| Origem | Destino | Acao |
| --- | --- | --- |
| `planos/` | `docs/01-planos-resumo.md`, `docs/03-comparativo-planos-vs-implementacao.md`, `docs/102-backlog-pos-documentacao.md` e relatorios relacionados | Conteudo util consolidado e resumido. |
| `documentacao softdesk/API_Softdesk_Documentacao_v1_30.pdf` | `docs/reference/API_Softdesk_Documentacao_v1_30.pdf` | PDF preservado dentro de `docs/`. |
| `docs/README.md` | `docs/index.md` | `docs/index.md` virou indice principal; `docs/README.md` mantido como compatibilidade. |

## Diretorios preservados

- `.agents/`: preservado.
- `docs/`: preservado.
- `src/`, `tests/`, `public/`, `node_modules/`: preservados.
- `.gitignore`: preservado.

## Itens Git/GitHub

Este diretorio nao possui `.git/` detectado durante a auditoria. `.gitignore` existe e foi preservado. `.github/`, `.gitattributes` e `agents/` nao foram encontrados no estado atual.

