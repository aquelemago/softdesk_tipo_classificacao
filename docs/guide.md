# Guia Operacional

## Requisitos

- Node.js com suporte a `node:test`
- npm
- Credenciais de API (apenas para execucao real)

## Setup

```bash
npm install
copy .env.example .env
```

Preencha `.env` apenas em ambiente seguro. Nao versionar `.env`.

## Variaveis de Ambiente

| Variavel | Onde e usada | Descricao |
|---|---|---|
| `OPENAI_API_KEY` | `utils/classificador_openai.js` | Chave OpenAI (provider `openai`) |
| `OPENAI_MODEL` | `utils/classificador_openai.js` | Modelo OpenAI (padrao `gpt-4o-mini`) |
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` | `utils/classificador_openai.js` | Chave Gemini (provider `google`/`gemini`) |
| `GOOGLE_GEMINI_MODEL` | `utils/classificador_openai.js` | Modelo Gemini (padrao `gemini-2.5-flash-lite`) |
| `CLASSIFICADOR_PROVIDER` | `main.js`, `utils/classificador_openai.js` | `openai`, `google` ou `gemini` |
| `DRY_RUN` | `main.js` | `true` impede PUT no Softdesk |
| `PORT` | `server.js` | Porta HTTP (padrao `4000`) |
| `AUTO_SCHEDULE_ENABLED` | `server.js` | `false` desabilita cron; qq outro valor habilita |
| `AUTO_SCHEDULE_LIMIT` | `server.js` | Limite do cron (padrao `50`) |
| `SOFTDESK_HASH_API` | `src/softdeskConfig.js` | Token da API Softdesk (obrigatorio) |
| `SOFTDESK_API_BASE_URL` | `src/softdeskConfig.js` | Base URL Softdesk (padrao `https://mainhardt.soft4.com.br/api/api.php`) |
| `GOOGLE_GEMINI_RPM` | `utils/classificador_openai.js` | Limite de requisicoes Gemini por minuto (padrao `10`) |
| `GOOGLE_GEMINI_RPD` | `utils/classificador_openai.js` | Limite diario Gemini (padrao `20`) |
| `GOOGLE_GEMINI_MIN_INTERVAL_MS` | `utils/classificador_openai.js` | Intervalo minimo entre chamadas Gemini |
| `GOOGLE_GEMINI_QUOTA_FILE` | `utils/classificador_openai.js` | Arquivo local de cota diaria Gemini |
| `GOOGLE_GEMINI_MAX_RETRIES` | `utils/classificador_openai.js` | Retries para erros 429/5xx Gemini (padrao `3`) |
| `GOOGLE_GEMINI_BACKOFF_BASE_MS` | `utils/classificador_openai.js` | Backoff base Gemini (padrao `2000`) |
| `GOOGLE_GEMINI_BACKOFF_MAX_MS` | `utils/classificador_openai.js` | Backoff maximo Gemini (padrao `30000`) |

## Comandos

| Comando | Efeito | Seguro? |
|---|---|---|
| `npm install` | Instalar dependencias | Sim |
| `npm test` | Executar `node --test tests/*.test.js` | Sim (usa mocks) |
| `npm start` / `node server.js` | Subir servidor + cron | Nao — pode ativar agendamento |
| `node main.js` | Processar 50 chamados | Nao — chama APIs reais |
| `node main.js 25` | Processar limite informado | Nao — chama APIs reais |
| `node src/listarTiposChamado.js` | Listar tipos Softdesk | Nao — chamada real |
| `node src/test-listar-prioridades.js` | Listar prioridades Softdesk | Nao — chamada real |
| `node src/test-retorna-chamados-sem-tipo.js` | Consultar chamados sem tipo | Nao — chamada real |

Use `npm test` para validacao segura. Para comandos operacionais, confirme `DRY_RUN=true` e `AUTO_SCHEDULE_ENABLED=false`.

## Testes

Framework: `node:test` (nativo). Um arquivo: `tests/classificador_openai.test.js`.

Cobre: prompt, parser JSON, fallback `TIPO|PRIORIDADE`, validacao de enums, mapeamento de codigos, payload, providers OpenAI e Gemini com `fetch` mockado, `stripHtmlSeguro`.

Lacunas documentadas: sem teste de `main.js` com `DRY_RUN`, sem teste de `server.js` (cron, endpoints, WebSocket), sem teste dos gateways Softdesk com mocks.

## Deploy com PM2

```bash
pm2 start ecosystem.config.js
```

O cron fica habilitado por padrao. Para desabilitar: `AUTO_SCHEDULE_ENABLED=false` no `.env`.

Riscos: segredos nao devem ficar no `ecosystem.config.js`; use `.env` ou ambiente seguro.

## Windows Service (NSSM)

```powershell
nssm install SoftdeskTipo
# Path: caminho do node.exe
# Startup directory: raiz do projeto
# Arguments: server.js
nssm start SoftdeskTipo
```

Confirme `.env` antes de iniciar, especialmente `DRY_RUN` e `AUTO_SCHEDULE_ENABLED`.

## Riscos Operacionais

- `server.js` carrega `.env` com `dotenv`
- `AUTO_SCHEDULE_ENABLED` so desabilita com string `"false"` exata
- Cron real: `*/15 * * * *` (a cada 15 minutos)
- Endpoints `POST /run-main` e `POST /clear-logs` sem autenticacao
- Scripts `src/test-*` fazem chamadas reais (nomes enganosos)
- `DRY_RUN=false` permite escrita real no Softdesk
- Sem sandbox Softdesk/OpenAI identificado
