# Roadmap

## Proximas correcoes recomendadas

1. Adicionar teste de `main.js` com mocks para provar `DRY_RUN=true`.
2. Adicionar testes de gateways Softdesk com `fetch` mockado.
3. Validar IDs de tipo/prioridade com fixture controlada ou consulta autorizada.
4. Validar taxonomia com suporte usando exemplos anonimizados.
5. Adicionar autenticacao ou restricao de acesso a `/run-main` e `/clear-logs`.
6. Criar politica operacional para quando cron deve ficar ligado.

## Nao fazer sem autorizacao

- Executar consultas reais ao Softdesk.
- Chamar OpenAI/Gemini reais.
- Rodar `node main.js` com `DRY_RUN=false`.
- Atualizar chamados reais para validar documentacao.
