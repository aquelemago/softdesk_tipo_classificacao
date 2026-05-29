# Setup local

## Requisitos

- Node.js com suporte a `node:test`.
- npm.
- Acesso a credenciais apenas quando for executar integracoes reais.

## Instalar dependencias

```bash
npm install
```

## Configurar ambiente

```bash
copy .env.example .env
```

Preencha `.env` apenas em ambiente seguro. Nao copie valores reais para documentacao.

## Validacao segura

```bash
npm test
```

Esse comando valida o classificador com mocks e nao deve chamar Softdesk real.

## Execucao operacional

```bash
npm start
```

ou:

```bash
node server.js
```

Risco: pode habilitar cron se `AUTO_SCHEDULE_ENABLED` nao for `"false"`.

## Execucao direta do processamento

```bash
node main.js
node main.js 25
```

Risco: pode chamar Softdesk, IA e atualizar chamados reais. Use `DRY_RUN=true` para validacao sem `PUT`.

