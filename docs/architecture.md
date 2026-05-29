# Arquitetura

## Tipo de aplicacao

Aplicacao Node.js monolitica pequena, com frontend estatico, backend Express, job de classificacao, integracoes externas e logs locais no mesmo repositorio.

## Camadas observadas

| Camada | Arquivos | Responsabilidade |
| --- | --- | --- |
| Frontend | `public/index.html`, `public/app.js`, `public/style.css` | Acionar classificacao, limpar logs e renderizar logs via WebSocket. |
| Servidor | `server.js` | Servir frontend, expor endpoints, abrir WebSocket, iniciar `main.js` e agendar execucao. |
| Orquestracao | `main.js` | Buscar chamados, detalhar, classificar, montar payload, respeitar `DRY_RUN` e chamar escrita. |
| Softdesk | `src/*.js` | Ler chamados, listar tipos/prioridades e atualizar chamado via API Softdesk. |
| IA | `utils/classificador_openai.js` | Montar prompt, chamar OpenAI/Gemini, parsear resposta, mapear codigos. |
| Logs | `utils/logger.js` | Criar arquivo semanal, gravar logs e limpar logs antigos. |
| Testes | `tests/classificador_openai.test.js` | Validar prompt, parser, mapeamento, payload e providers com fetch mockado. |

## Decisoes implementadas

- CommonJS (`require`/`module.exports`).
- `server.js` inicia `main.js` via `child_process.spawn`.
- Logs sao o mecanismo de observabilidade e tambem alimentam a interface.
- Classificador usa JSON como contrato preferencial, mas ainda aceita `TIPO|PRIORIDADE` por compatibilidade.
- Codigos de tipo/prioridade continuam hardcoded em `utils/classificador_openai.js`.

## Riscos arquiteturais

- Segredos Softdesk/OpenAI devem vir do ambiente; `src/softdeskConfig.js` centraliza configuracao Softdesk.
- `main.js`, `server.js` e `utils/classificador_openai.js` carregam `.env` com `dotenv`.
- `AUTO_SCHEDULE_ENABLED` e habilitado por padrao quando nao e `"false"`.
- Endpoints internos sem autenticacao identificada.
- Scripts manuais em `src/` podem chamar API real.
