# Comparativo detalhado planos vs implementacao

| Area | Planejado em `planos/` | Implementado no codigo | Status | Evidencia |
| --- | --- | --- | --- | --- |
| Testes | Criar runner e mocks. | `npm test` e `tests/classificador_openai.test.js`. | implementado | `package.json`, `tests/classificador_openai.test.js` |
| Prompt | Criar prompt estruturado com JSON. | `buildPromptClassificacao` pede JSON. | implementado | `utils/classificador_openai.js` |
| Parser | Trocar `split('|')` por parser robusto. | Parser JSON com fallback `TIPO|PRIORIDADE`. | implementado | `utils/classificador_openai.js` |
| Sanitizacao | Limpar descricao antes da IA. | `main.js` chama `stripHtml`; classificador chama `stripHtmlSeguro`. | implementado | `main.js`, `utils/classificador_openai.js` |
| Dados enviados | Enviar objeto estruturado. | Envia codigo, titulo, descricao, cliente, status, tipoAtual, contexto. | implementado | `main.js` |
| Mapeamento | Centralizar e testar. | Centralizado e testado. | implementado | `utils/classificador_openai.js`, `tests/classificador_openai.test.js` |
| Validar IDs reais | Comparar com Softdesk ou fixture. | Nao ha fixture validada. | ausente | `src/listarTiposChamado.js`, `src/test-listar-prioridades.js` |
| `DRY_RUN` | Impedir PUT em validacao. | Implementado em `main.js`. | implementado | `main.js` |
| Logs seguros | Registrar decisao com motivo/confianca. | Retorno existe, mas log principal ainda nao mostra motivo/confianca. | parcialmente_implementado | `main.js`, `utils/classificador_openai.js` |
| Cron | Documentar e controlar risco. | Cron segue 15min e textos atuais refletem 15min. | implementado | `server.js`, `docs/modules.md`, `README.md` |
| Segredos | Nao expor e mover para env. | `ecosystem.config.js` nao contem mais chave real; `hash-api` e base URL Softdesk vem de ambiente via `src/softdeskConfig.js`. | implementado | `ecosystem.config.js`, `src/softdeskConfig.js` |
| Autenticacao | Documentar risco. | Sem autenticacao identificada. | ausente | `server.js` |
| Provider IA | Planos focavam OpenAI. | OpenAI e Gemini. | implementado extra | `utils/classificador_openai.js` |
| Exemplo de ambiente | Planos pedem configuracao segura. | `.env.example` documenta variaveis de IA, cron, dry-run e variaveis futuras Softdesk. | parcialmente_implementado | `.env.example`, `utils/classificador_openai.js`, `main.js`, `server.js` |
| Guia para agentes | Planos tinham instrucoes antigas em `planos/`. | `AGENTS.md` criado na raiz com regras atuais. | implementado | `AGENTS.md` |

## Principais conclusoes

- A correcao de classificacao esta parcialmente executada no codigo.
- O risco operacional ainda e alto por causa de cron, `DRY_RUN=false` e endpoints sem autenticacao.
- A maior lacuna tecnica restante e testar o fluxo completo `main.js` com `DRY_RUN` e mocks.
