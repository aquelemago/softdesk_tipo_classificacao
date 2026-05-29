# Deploy

## Implementado

Ha configuracao PM2 em `ecosystem.config.js`:

- app `softdesk-type-classifier`;
- script `server.js`;
- `cwd` baseado no diretorio do proprio arquivo;
- variaveis operacionais basicas para producao.

## Riscos

- Segredos reais nao devem ficar em `ecosystem.config.js`; use `.env` ou ambiente seguro.
- `AUTO_SCHEDULE_ENABLED` so desabilita o cron quando o valor e exatamente a string `"false"`.
- Nao foi identificado pipeline CI/CD.

## Windows service

O projeto tambem pode rodar como servico Windows mantendo `server.js` ativo. Veja [windows-service.md](windows-service.md).

## Operacao

Antes de subir em PM2:

1. Remover segredos do arquivo versionado.
2. Passar segredos por ambiente seguro.
3. Confirmar `AUTO_SCHEDULE_ENABLED`.
4. Confirmar `DRY_RUN`.
5. Rodar `npm test`.
6. Validar se a execucao deve realmente alterar chamados.
