# Visao geral

## Objetivo

O projeto automatiza a classificacao de chamados Softdesk. O fluxo busca chamados abertos, filtra chamados sem classificacao, envia dados para um provedor de IA, converte a resposta para codigos Softdesk e atualiza o chamado.

## Implementado

- Interface web para executar classificacao e limpar logs: `public/index.html`, `public/app.js`.
- Servidor Express com WebSocket: `server.js`.
- Agendamento automatico com `node-cron`: `server.js`.
- Orquestracao principal: `main.js`.
- Integracao de leitura Softdesk: `src/test-retorna-ultimos-chamados-abertos.js`.
- Integracao de escrita Softdesk: `src/editarChamado.js`.
- Classificacao IA com provider OpenAI ou Google Gemini: `utils/classificador_openai.js`.
- Logs semanais: `utils/logger.js`.
- Testes do classificador: `tests/classificador_openai.test.js`.

## Planejado nos documentos

Os planos em `planos/` descrevem uma correcao da classificacao incorreta com:

- funcoes puras de prompt, parser, mapeamento e payload;
- sanitizacao de descricao antes do prompt;
- resposta JSON validada;
- modo `DRY_RUN`;
- testes com mocks;
- logs seguros;
- validacao humana da taxonomia.

Parte desse plano ja esta implementada no codigo atual.

## Nao identificado no codigo atual

- Banco de dados local.
- ORM, migrations ou seeds.
- CI/CD.
- Autenticacao de usuario na interface.
- Sandbox Softdesk/OpenAI.
- Regra oficial de negocio para cada tipo/prioridade.

