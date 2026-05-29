# Backlog pos-documentacao

| ID | Tarefa | Tipo | Prioridade | Evidencia | Status |
| --- | --- | --- | --- | --- | --- |
| B001 | Remover segredo real de `ecosystem.config.js` e mover para ambiente seguro. | bug/seguranca | alta | `ecosystem.config.js`, `docs/deployment.md` | concluido |
| B002 | Remover `hash-api` hardcoded de `src/` e usar variavel/configuracao segura. | melhoria tecnica/seguranca | alta | `src/softdeskConfig.js`, `src/editarChamado.js`, `src/test-retorna-ultimos-chamados-abertos.js` | concluido |
| B003 | Fazer `server.js` carregar `.env` ou documentar oficialmente que o ambiente deve ser externo. | bug/configuracao | alta | `server.js`, `.env.example`, `docs/environment.md` | concluido |
| B004 | Corrigir divergencia entre cron real `*/15 * * * *` e mensagens/documentacao antiga de 1 hora. | bug/documentacao | alta | `server.js`, `docs/modules.md`, `README.md` | concluido |
| B005 | Criar teste de `main.js` com mocks provando que `DRY_RUN=true` nao chama `editarChamado`. | teste | alta | `main.js`, `docs/testing.md` | pendente |
| B006 | Criar testes dos gateways Softdesk com `fetch` mockado e bloqueio de URLs reais. | teste | media | `src/*.js`, `docs/testing.md` | pendente |
| B007 | Validar IDs atuais de tipo/prioridade do Softdesk com fixture controlada ou consulta autorizada. | validacao humana | alta | `utils/classificador_openai.js`, `src/listarTiposChamado.js` | precisa_validacao |
| B008 | Validar taxonomia oficial de tipo/prioridade com suporte. | validacao humana | alta | `docs/business-rules.md`, `docs/open-questions.md` | precisa_validacao |
| B009 | Adicionar autenticacao, token interno ou restricao de rede a `/run-main` e `/clear-logs`. | arquitetura/seguranca | alta | `server.js` | pendente |
| B010 | Registrar `motivoCurto` e `confianca` em logs seguros, sem descricao sensivel. | melhoria tecnica | media | `main.js`, `utils/classificador_openai.js` | pendente |
| B011 | Decidir provider operacional padrao: OpenAI ou Gemini. | validacao humana | media | `utils/classificador_openai.js`, `.env.example` | precisa_validacao |
| B012 | Criar politica operacional para `AUTO_SCHEDULE_ENABLED` e `DRY_RUN` em producao. | documentacao/operacao | media | `server.js`, `.env.example` | pendente |
| B013 | Revisar nomes dos scripts `src/test-*`, pois fazem chamadas reais e podem induzir erro. | melhoria tecnica | media | `src/test-listar-prioridades.js`, `src/test-retorna-chamados-sem-tipo.js` | pendente |
| B014 | Criar CI simples para rodar `npm.cmd test` ou equivalente em ambiente Windows/Linux. | arquitetura/teste | baixa | `package.json` | pendente |
