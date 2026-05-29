# Modulos

## `server.js`

Responsavel por:

- servir `public/`;
- expor `POST /run-main`;
- expor `POST /clear-logs`;
- abrir WebSocket para logs;
- observar o arquivo de log semanal;
- iniciar `main.js` por `spawn`;
- agendar execucao com cron.

Ponto critico: o cron real e `*/15 * * * *`, ou seja, a cada 15 minutos quando `AUTO_SCHEDULE_ENABLED` nao e `"false"`.

## `main.js`

Responsavel por:

- ler `limit` da linha de comando;
- buscar chamados abertos;
- detalhar cada chamado;
- montar entrada estruturada para IA;
- sanitizar descricao com `stripHtml`;
- chamar `classificarChamadoOpenAI`;
- montar payload com `montarPayloadAtualizacao`;
- respeitar `DRY_RUN`;
- chamar `editarChamado` quando `DRY_RUN` esta desligado.

## `utils/classificador_openai.js`

Responsavel por:

- definir enums de tipo/prioridade;
- normalizar texto e aliases;
- limpar HTML com `stripHtmlSeguro`;
- montar prompt JSON;
- extrair e validar JSON da resposta;
- manter compatibilidade com `TIPO|PRIORIDADE`;
- mapear tipo/prioridade para codigos Softdesk;
- chamar OpenAI ou Google Gemini.

## `src/test-retorna-ultimos-chamados-abertos.js`

Responsavel por:

- consultar ultimos chamados abertos;
- detalhar chamado por codigo;
- filtrar chamados cujo tipo e `Nao Classificado`;
- registrar informacoes em log.

Apesar do nome `test`, este arquivo faz chamadas reais quando usado.

## `src/editarChamado.js`

Responsavel por enviar `PUT` ao Softdesk. E o ponto de maior efeito externo.

## `utils/logger.js`

Responsavel por criar logs semanais, escrever mensagens e remover logs de meses anteriores.
