# Fluxos

## Fluxo manual pela interface

1. Usuario abre a interface servida por `server.js`.
2. `public/app.js` conecta WebSocket no host atual.
3. Usuario informa limite e clica em executar.
4. `public/app.js` envia `POST /run-main`.
5. `server.js` inicia `main.js` com `spawn('node', [MAIN_SCRIPT, limit])`.
6. `main.js` processa chamados.
7. Logs sao escritos em `logs/`.
8. `server.js` observa o arquivo e envia atualizacoes via WebSocket.

## Fluxo automatico

1. `server.js` calcula `AUTO_SCHEDULE_ENABLED`.
2. Se o valor nao for `"false"`, agenda `*/15 * * * *`.
3. A cada 15 minutos, chama `executarMainAutomatico(AUTO_SCHEDULE_LIMIT)`.
4. O fluxo executa `main.js` e pode chegar ate Softdesk/OpenAI reais.

## Fluxo de classificacao

1. `main.js` chama `getChamadosAbertos(limit)`.
2. Para cada item, chama `buscarDetalhesChamado(codigo, true)`.
3. Se o detalhe nao for `Nao Classificado`, o chamado e ignorado.
4. `main.js` monta objeto com codigo, titulo, descricao limpa, cliente, status, tipo atual e contexto.
5. `classificarChamadoOpenAI` monta prompt e chama o provider configurado.
6. Parser valida JSON ou formato antigo `TIPO|PRIORIDADE`.
7. Mapeamento gera codigos Softdesk.
8. `main.js` monta payload.
9. Se `DRY_RUN=true`, nao chama `editarChamado`.
10. Se `DRY_RUN` estiver desligado, envia `PUT` ao Softdesk.

