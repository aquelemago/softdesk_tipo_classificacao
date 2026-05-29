# Estrutura de pastas

| Caminho | Tipo | Descricao |
| --- | --- | --- |
| `.agents/skills/` | Ferramentas locais | Skills instaladas no escopo do projeto. |
| `docs/` | Documentacao | Documentacao tecnica atual criada a partir de planos e codigo. |
| `logs/` | Runtime | Logs semanais gerados pela aplicacao. |
| `node_modules/` | Dependencias | Dependencias npm instaladas. |
| `public/` | Frontend | HTML, CSS e JS da interface. |
| `src/` | Integracoes Softdesk | Leitura, listagem e escrita na API Softdesk. |
| `tests/` | Testes | Testes automatizados com `node:test`. |
| `utils/` | Utilitarios | Classificador IA e logger. |
| `Y/` | Artefato operacional | Aparente pasta de runtime/PM2; nao usada como fonte principal. |

## Documentacao consolidada

Diretorios documentais antigos foram consolidados em `docs/`:

- `planos/`: consolidado em `docs/01-planos-resumo.md`, `docs/03-comparativo-planos-vs-implementacao.md`, `docs/102-backlog-pos-documentacao.md` e demais relatorios.
- `documentacao softdesk/`: PDF movido para `docs/reference/API_Softdesk_Documentacao_v1_30.pdf`.

## Arquivos de raiz

| Arquivo | Descricao |
| --- | --- |
| `.env.example` | Exemplo de variaveis sem valores reais. |
| `ecosystem.config.js` | Configuracao PM2 sem segredo real; usa `cwd: __dirname`. |
| `main.js` | Fluxo principal de classificacao. |
| `package.json` | Dependencias e scripts. |
| `server.js` | Servidor HTTP/WebSocket e agendamento. |
