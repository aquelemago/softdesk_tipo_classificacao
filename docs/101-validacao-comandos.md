# Validacao de comandos

## Gerenciador identificado

- Gerenciador: npm.
- Manifesto: `package.json`.
- Scripts disponiveis:
  - `start`: `node server.js`
  - `test`: `node --test tests/*.test.js`

## Comandos executados

| Comando | Resultado | Observacao |
| --- | --- | --- |
| `npm.cmd test` | Passou | 10 testes passaram em `tests/classificador_openai.test.js`. Usa mocks para providers de IA. |
| `node --check main.js` | Passou | Validacao de sintaxe. Nao executa o fluxo. |
| `node --check server.js` | Passou | Validacao de sintaxe. Nao sobe servidor. |
| `node --check utils/classificador_openai.js` | Passou | Validacao de sintaxe. |
| `node --check utils/logger.js` | Passou | Validacao de sintaxe. |
| `node --check src/editarChamado.js` | Passou | Validacao de sintaxe. |
| `node --check src/listarTiposChamado.js` | Passou | Validacao de sintaxe. |
| `node --check src/test-retorna-ultimos-chamados-abertos.js` | Passou | Validacao de sintaxe. |
| `node --check src/test-listar-prioridades.js` | Passou | Validacao de sintaxe. |
| `node --check src/test-retorna-chamados-sem-tipo.js` | Passou | Validacao de sintaxe. |
| Checagem de links Markdown internos | Passou | Todos os links internos `.md` em `README.md` e `docs/` resolvem para arquivos existentes. |
| Busca por valores sensiveis em docs | Passou | Nao foram encontrados valores reais de chave OpenAI ou `hash-api`; apenas mencoes ao risco. |

## Comandos nao executados

| Comando | Motivo |
| --- | --- |
| `npm start` | Pode subir servidor e habilitar cron real. |
| `node server.js` | Pode subir servidor e habilitar cron real. |
| `node main.js` | Pode chamar Softdesk/IA e atualizar chamados. |
| `node src/*.js` | Scripts podem chamar Softdesk real. |

## Comandos inexistentes

- `lint`: nao identificado em `package.json`.
- `build`: nao identificado em `package.json`.
- `typecheck`: nao identificado em `package.json`.

## Observacao PowerShell

No PowerShell local, `npm test` pode acionar `npm.ps1` e falhar por execution policy. Use `npm.cmd test`.

Uma primeira tentativa de checagem de links teve ruido por tratar `README.md` na raiz como caminho sem diretorio. A validacao foi repetida com esse caso tratado explicitamente e passou.
