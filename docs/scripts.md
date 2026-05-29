# Scripts e comandos

## `package.json`

| Comando | Efeito | Seguro por padrao |
| --- | --- | --- |
| `npm install` | Instala dependencias. | Sim. |
| `npm test` | Executa `node --test tests/*.test.js`. | Sim, usa mocks no teste atual. |
| `npm start` | Executa `node server.js`. | Nao, pode ativar cron. |

## Comandos manuais

| Comando | Efeito | Risco |
| --- | --- | --- |
| `node server.js` | Sobe servidor e agendamento. | Pode executar job periodico. |
| `node main.js` | Processa 50 chamados por padrao. | Pode chamar Softdesk/IA e atualizar chamados. |
| `node main.js 25` | Processa limite informado. | Mesmo risco acima. |
| `node src/listarTiposChamado.js` | Lista tipos no Softdesk. | Chamada real. |
| `node src/test-listar-prioridades.js` | Lista prioridades no Softdesk. | Chamada real. |
| `node src/test-retorna-chamados-sem-tipo.js` | Consulta chamados sem tipo. | Chamada real. |

## Recomendacao

Use `npm test` para validacao tecnica. Para qualquer comando operacional, confirme credenciais, `DRY_RUN`, `AUTO_SCHEDULE_ENABLED=false` e autorizacao.

