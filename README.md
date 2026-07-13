# Softdesk Ticket Tipo Classificacao

Automacao Node.js para classificar chamados Softdesk com IA (OpenAI/Gemini) e atualizar tipo/prioridade. Interface web com logs em tempo real.

## Comandos

```bash
npm install        # instalar dependencias
npm test           # validar com mocks (seguro)
npm start          # subir servidor + cron (risco de chamadas reais)
node main.js       # processar 50 chamados (risco de chamadas reais)
node main.js 25    # processar limite informado
```

## Configuracao rapida

```bash
copy .env.example .env
```

Variaveis essenciais: `OPENAI_API_KEY`, `SOFTDESK_HASH_API`, `CLASSIFICADOR_PROVIDER`, `DRY_RUN=true`.

## Documentacao

Leia [docs/index.md](docs/index.md).

## Riscos

- `npm start` e `node main.js` podem chamar APIs reais e alterar dados
- Cron habilitado por padrao (a cada 15 min) se `AUTO_SCHEDULE_ENABLED` nao for `"false"`
- Endpoints internos sem autenticacao
- Scripts `src/test-*` fazem chamadas reais (nomes enganosos)
- Nao ha sandbox identificado
