# Projeto atual

## Stack

- Node.js com CommonJS.
- Express `5.1.0`.
- WebSocket com `ws`.
- `node-cron`.
- `node-fetch` v2.
- `dotenv`.
- `chalk`.
- Testes com `node:test`.

## Arquitetura real

O projeto e um monolito operacional:

- `server.js` serve frontend, WebSocket, endpoints e cron.
- `main.js` executa o fluxo de negocio.
- `src/` acessa Softdesk.
- `utils/classificador_openai.js` acessa providers de IA.
- `utils/logger.js` grava logs semanais.

## Scripts

- `npm start`: inicia `server.js`.
- `npm test`: executa testes do classificador.

## Testes encontrados

`tests/classificador_openai.test.js` cobre o classificador com mocks. Nao foram encontrados testes de `server.js`, `main.js` ou gateways Softdesk.

## Integracoes

- Softdesk: base URL e `hash-api` via `src/softdeskConfig.js` e ambiente.
- OpenAI: `https://api.openai.com/v1/chat/completions`.
- Google Gemini: `https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`.

## Configuracoes e variaveis

`.env.example` documenta variaveis atuais, incluindo `SOFTDESK_HASH_API` e `SOFTDESK_API_BASE_URL`.

## Lacunas

- Sem CI/CD identificado.
- Sem autenticacao nos endpoints internos.
- Sem banco local.
- Sem sandbox identificado.
- Segredos Softdesk/OpenAI nao devem ficar versionados; o `hash-api` agora vem do ambiente.
