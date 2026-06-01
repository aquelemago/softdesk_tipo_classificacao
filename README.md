# Softdesk Ticket Classifier

Automacao Node.js para classificar chamados abertos do Softdesk com IA e atualizar tipo/prioridade no proprio Softdesk. O projeto tambem oferece uma interface web simples para executar a classificacao manualmente e acompanhar logs em tempo real.

## Estado atual confirmado

- Backend Node.js com Express, WebSocket e `node-cron`.
- Frontend estatico em `public/`.
- Fluxo principal em `main.js`.
- Integracao Softdesk em `src/`.
- Classificador IA em `utils/classificador_openai.js`, com suporte confirmado a OpenAI e Google Gemini por variavel de provider.
- Testes automatizados com `node:test` em `tests/classificador_openai.test.js`.
- Modo `DRY_RUN` implementado em `main.js`.

## Atencao antes de executar

Este projeto pode chamar APIs reais e alterar chamados reais no Softdesk.

Nao execute `npm start`, `node server.js`, `node main.js`, PM2 ou scripts de `src/` sem confirmar ambiente, credenciais e permissao operacional.

O agendamento em `server.js` fica habilitado quando `AUTO_SCHEDULE_ENABLED` nao e exatamente `"false"`. O codigo agenda `*/15 * * * *`, ou seja, a cada 15 minutos.

## Comandos

```bash
npm install
npm test
npm start
node main.js
node main.js 25
```

Use `npm test` para validacao segura. Os comandos `npm start` e `node main.js` podem ter efeitos externos.

## Configuracao minima

Copie o exemplo e preencha valores reais apenas em ambiente seguro:

```bash
copy .env.example .env
```

Variaveis principais:

- `OPENAI_API_KEY`: chave OpenAI.
- `GOOGLE_API_KEY` ou `GEMINI_API_KEY`: chave Google Gemini, se `CLASSIFICADOR_PROVIDER=google` ou `gemini`.
- `GOOGLE_GEMINI_RPM=10` e `GOOGLE_GEMINI_RPD=20`: limites locais para evitar `429 Too Many Requests` do Gemini.
- `GOOGLE_GEMINI_MIN_INTERVAL_MS`, `GOOGLE_GEMINI_MAX_RETRIES` e `GOOGLE_GEMINI_QUOTA_FILE`: ajuste fino da protecao local Gemini.
- `CLASSIFICADOR_PROVIDER`: `openai`, `google` ou `gemini`.
- `DRY_RUN`: use `true` para calcular sem enviar `PUT` ao Softdesk.
- `AUTO_SCHEDULE_ENABLED`: use `false` para desabilitar cron.
- `AUTO_SCHEDULE_LIMIT`: limite do cron.
- `PORT`: porta HTTP, padrao `4000`.
- `SOFTDESK_HASH_API`: token/hash da API Softdesk.
- `SOFTDESK_API_BASE_URL`: base da API Softdesk.

## Documentacao

Leia a documentacao tecnica em [docs/index.md](docs/index.md).

Para rodar como servico no Windows, veja [docs/windows-service.md](docs/windows-service.md).

## Riscos conhecidos

- Rotas internas `POST /run-main` e `POST /clear-logs` nao possuem autenticacao identificada.
- Scripts em `src/` com nome `test-*` fazem chamadas reais quando executados diretamente.
- Sandbox Softdesk/OpenAI nao foi identificado no codigo atual.
