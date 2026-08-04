# .refactor

Infraestrutura de orquestracao do Executor de refatoracao. Especificacao
completa na conversa de arquitetura (Meta-Agente de Refatoracao).

## Fontes da verdade (em ordem de prioridade)

1. `progress.json` — estado corrente da execucao.
2. `plan/01-etapas.json` — declaracao canonica das etapas.
3. `plan/<id>-<slug>.md` — documentacao de uma etapa especifica.
4. `skills/registry.json` — indice de Skills disponiveis.
5. `skills/<id>/SKILL.md` — especificacao de cada Skill.

## Branch de trabalho

- `main` permanece intocada durante a refatoracao.
- Toda a refatoracao acontece na branch `refactor/etapas`.
- Cada etapa (E1..E8) vira exatamente um commit nessa branch.
- Ao final, a branch pode ser mergeada ou squash-mergeada para `main`.
- O campo `project.workBranch` em `progress.json` registra a branch escolhida
  e `project.workBranchFromSha` aponta para o SHA de onde ela partiu.

## Fluxo do Executor

1. Ler `progress.json`.
2. Descobrir `currentStageId`.
3. Carregar `plan/<id>-<slug>.md` apenas da etapa atual.
4. Ler `requiredSkills` da etapa; consultar `skills/registry.json`.
5. Se faltar Skill -> interromper e pedir ao Skill Manager.
6. Executar a etapa (uma only).
7. Validar.
8. Testar.
9. Auto-correcao (max 3 tentativas).
10. Commit (exatamente um).
11. Atualizar `progress.json`.
12. Encerrar.

## Regras

- Uma etapa por execucao.
- Um commit por etapa.
- Nunca duas etapas juntas.
- Nunca `--amend`, `--force`, `--squash`, `--no-verify`.
- Fora do escopo de `filesInvolved` -> interromper.
