# Instrucoes para agentes

## Antes de alterar

- Leia `README.md` e `docs/README.md`.
- Use `docs/index.md` como indice principal da documentacao humana.
- Leia `planos/contexto-completo-md/00-LEIA-PRIMEIRO.md` quando o trabalho envolver classificacao, arquitetura ou roadmap.
- Os planos historicos foram consolidados em `docs/01-planos-resumo.md`, `docs/03-comparativo-planos-vs-implementacao.md` e `docs/102-backlog-pos-documentacao.md`. Se um diretorio `planos/` reaparecer, trate-o como intencao/contexto historico, nao como implementacao real.
- Nao invente funcionalidades. Se nao houver evidencia, registre como `precisa de validacao`.

## Seguranca operacional

- Nao abra nem copie valores reais de `.env`, `env`, tokens, senhas ou chaves.
- Nao reproduza o valor do `hash-api` hardcoded em `src/`.
- Nao execute `npm start`, `node server.js`, `node main.js`, PM2, cron ou scripts de `src/` sem autorizacao explicita.
- Esses comandos podem chamar Softdesk/OpenAI/Gemini reais e alterar chamados.
- Para validacao local, prefira `npm.cmd test` no PowerShell.

## Documentacao

- Mantenha README curto e detalhes em `docs/`.
- Nao crie novos diretorios de documentacao humana fora de `docs/`.
- Separe `implementado`, `planejado`, `ausente`, `divergente` e `precisa de validacao`.
- Cite caminhos reais dos arquivos usados como evidencia.
- Atualize `docs/plan-vs-implementation.md`, `docs/roadmap.md` e `docs/open-questions.md` quando o estado mudar.

## Checks antes de finalizar

- Rode `npm.cmd test` quando a mudanca afetar JS, classificacao ou documentacao de testes.
- Se comandos nao existirem, registre isso em vez de criar expectativa falsa.
- Registre pendencias relevantes em `docs/102-backlog-pos-documentacao.md` quando aplicavel.
