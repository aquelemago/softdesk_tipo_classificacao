# Softdesk Ticket Classifier — Visao Geral

## Proposito

Automacao Node.js que classifica chamados abertos do Softdesk usando IA (OpenAI ou Google Gemini) e atualiza tipo/prioridade no proprio Softdesk. Inclui interface web para execucao manual e logs em tempo real via WebSocket.

## Arquitetura

Aplicacao Node.js monolitica com CommonJS.

| Camada | Arquivos | Responsabilidade |
|---|---|---|
| Frontend | `public/index.html`, `app.js`, `style.css` | Acionar classificacao, limpar logs, renderizar logs via WebSocket |
| Servidor | `server.js` | Servir frontend, expor endpoints, WebSocket, agendar cron, iniciar `main.js` via `spawn` |
| Orquestracao | `main.js` | Buscar chamados, classificar, montar payload, respeitar `DRY_RUN`, escrever no Softdesk |
| Integracao Softdesk | `src/*.js` | Ler chamados, listar tipos/prioridades, atualizar chamado via API Softdesk |
| Classificador IA | `utils/classificador_openai.js` | Montar prompt, chamar OpenAI/Gemini, parsear resposta, mapear codigos |
| Logs | `utils/logger.js` | Logs semanais com rotacao |
| Testes | `tests/classificador_openai.test.js` | Validar prompt, parser, mapeamento, payload, providers com fetch mockado |

## Modulos Principais

| Modulo | Finalidade |
|---|---|
| `server.js` | Servir `public/`, `POST /run-main`, `POST /clear-logs`, WebSocket, cron `*/15 * * * *` |
| `main.js` | Orquestrar classificacao: ler limite, buscar chamados, classificar, editar |
| `utils/classificador_openai.js` | Prompt JSON, parser com fallback `TIPO|PRIORIDADE`, provider OpenAI/Gemini, mapeamento de codigos |
| `utils/logger.js` | Logs semanais, saida colorida, limpeza de logs antigos |
| `src/softdeskConfig.js` | URL base e headers da API Softdesk |
| `src/editarChamado.js` | `PUT` no Softdesk para atualizar chamado |
| `src/test-retorna-ultimos-chamados-abertos.js` | Buscar chamados abertos e detalhar (faz chamadas reais, apesar do nome `test`) |
| `src/listarTiposChamado.js` | Listar tipos de chamado do Softdesk |
| `src/test-listar-prioridades.js` | Listar prioridades do Softdesk |
| `src/test-retorna-chamados-sem-tipo.js` | Buscar chamados sem tipo |

## Fluxo de Classificacao

1. `main.js` busca chamados abertos via `getChamadosAbertos(limit)`
2. Para cada chamado, chama `buscarDetalhesChamado(codigo)` — so processa se tipo for "Nao Classificado"
3. Monta objeto com codigo, titulo, descricao (sanitizada), cliente, status, tipoAtual
4. `classificarChamadoOpenAI` monta prompt JSON, chama OpenAI ou Gemini, parseia resposta
5. Mapeia tipo/prioridade para codigos Softdesk (hardcoded no classificador)
6. Se `DRY_RUN=true`: apenas valida/loga payload
7. Se `DRY_RUN=false`: envia `PUT` ao Softdesk via `editarChamado`

## Integracoes Externas

| Servico | URL | Autenticacao |
|---|---|---|
| Softdesk | `SOFTDESK_API_BASE_URL` (padrao `https://mainhardt.soft4.com.br/api/api.php`) | `hash-api` via `SOFTDESK_HASH_API` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `OPENAI_API_KEY` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/models/...:generateContent` | `GOOGLE_API_KEY` ou `GEMINI_API_KEY` |

## Estrutura de Diretorios

```
├── main.js              # Pipeline principal
├── server.js            # Servidor HTTP/WebSocket + cron
├── package.json         # Dependencias e scripts
├── ecosystem.config.js  # Configuracao PM2
├── .env.example         # Template de variaveis
├── src/                 # Integracao Softdesk
├── utils/               # Classificador IA e logger
├── public/              # Frontend web
├── tests/               # Testes automatizados
├── docs/                # Documentacao
└── logs/                # Logs semanais (runtime)
```
