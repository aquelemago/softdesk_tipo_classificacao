# Servico Windows

## Viabilidade tecnica

O projeto pode rodar como servico Windows mantendo `server.js` ativo. Esse processo:

- serve a interface web em `PORT`;
- abre WebSocket para logs;
- observa o arquivo semanal em `logs/`;
- agenda execucao automatica com `node-cron`;
- chama `main.js` via `spawn('node', [MAIN_SCRIPT, limit])`.

## Requisitos

- Node.js instalado e disponivel para o usuario do servico.
- Diretorio de trabalho apontando para a raiz deste projeto.
- Arquivo `.env` preenchido no mesmo diretorio.
- Permissao de escrita em `logs/`.
- Acesso de rede para Softdesk e para o provider de IA configurado.

## Configuracao recomendada com NSSM

Use `node.exe` como executavel e `server.js` como argumento.

Campos principais:

| Campo | Valor |
| --- | --- |
| Path | caminho completo de `node.exe` |
| Startup directory | raiz deste projeto |
| Arguments | `server.js` |

Comandos usuais:

```powershell
nssm install SoftdeskTipo
nssm start SoftdeskTipo
nssm stop SoftdeskTipo
```

## Variaveis criticas

Confirme o `.env` antes de iniciar o servico:

```env
AUTO_SCHEDULE_ENABLED=true
AUTO_SCHEDULE_LIMIT=50
DRY_RUN=false
```

Com `DRY_RUN=false`, o processamento pode atualizar chamados reais no Softdesk. Para validar sem escrita, use `DRY_RUN=true`.

## Checks antes de instalar

```powershell
node --check server.js
node --check main.js
npm.cmd test
```

Nao use `node server.js` ou `npm start` como teste rapido sem revisar `AUTO_SCHEDULE_ENABLED`, porque isso pode ativar o agendamento.
