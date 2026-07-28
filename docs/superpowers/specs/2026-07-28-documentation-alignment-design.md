# Alinhamento e reorganizacao da documentacao

**Data:** 2026-07-28  
**Status:** Aprovado para especificacao; aguardando revisao do usuario antes da implementacao

## Objetivo

Alinhar a documentacao versionada ao comportamento verificavel do projeto e estabelecer uma entrada curta e previsivel para pessoas e agentes de IA. O codigo, os testes, `package.json` e o estado Git sao a fonte da verdade.

## Escopo

- Criar `CODEX_START_HERE.md` e a arvore `codex-context/` com seis documentos canônicos.
- Reescrever `README.md` como guia operacional humano.
- Migrar o conteudo confirmado de `docs/index.md`, `docs/overview.md`, `docs/guide.md` e `docs/reference.md`; remover esses arquivos antigos apos a migracao.
- Preservar `docs/reference/API_Softdesk_Documentacao_v1_30.pdf` como referencia externa, sem tratá-lo como fonte de verdade sobre o comportamento atual.
- Revisar `.gitignore` para garantir que a documentacao canonica seja versionada.
- Registrar inventario, riscos, lacunas e decisoes sem inventar configuracoes ou dados operacionais.

## Fora de escopo

- Alterar comportamento da aplicacao, taxonomia, mapeamentos Softdesk, credenciais ou configuracoes de ambiente.
- Ler, exibir ou resumir `.env`, `config/*.env`, cookies, tokens, perfis de navegador, CSVs operacionais ou filas geradas.
- Executar automacao contra Soft4, SMTP, provedores de IA, cron, `npm start` ou `node main.js`.

## Fonte de evidencia

As afirmacoes da documentacao serao verificadas em `main.js`, `server.js`, `src/`, `utils/`, `tests/`, `package.json` e no estado Git. Dados externos e valores reais de ambiente nao serao usados como evidencia.

## Estrutura alvo

| Arquivo | Responsabilidade |
| --- | --- |
| `README.md` | Guia humano: proposito, requisitos, setup, comandos, seguranca e links. |
| `CODEX_START_HERE.md` | Entrada curta para IA: regras, ordem de leitura e limites operacionais. |
| `codex-context/README.md` | Indice tecnico e mapa de leitura. |
| `codex-context/01-overview.md` | Objetivo, escopo, regras de negocio, entradas e saidas. |
| `codex-context/02-architecture.md` | Fluxos, modulos, configuracao e efeitos colaterais. |
| `codex-context/03-operations.md` | Setup, execucao, validacao, troubleshooting e seguranca operacional. |
| `codex-context/04-decisions.md` | Decisoes arquiteturais e comportamentais em ADRs leves. |
| `codex-context/05-backlog.md` | Riscos, debitos e melhorias, claramente separados de fatos implementados. |
| `codex-context/06-inventory.md` | Inventario auditavel de fontes, arquivos e estado do repositorio. |

## Comportamentos a registrar

- O pipeline consulta chamados abertos, somente classifica detalhes cujo tipo normalizado seja `nao classificado`, chama OpenAI ou Gemini e monta um payload de tipo/prioridade.
- `DRY_RUN=true` evita o `PUT`; sua ausencia ou outro valor permite a escrita quando o pipeline e executado.
- O servidor oferece arquivos estaticos, WebSocket e os endpoints internos `POST /run-main` e `POST /clear-logs`.
- O agendamento e habilitado por padrao e executa a cada 15 minutos; somente `AUTO_SCHEDULE_ENABLED=false` o desabilita.
- Os testes Node usam mocks para os providers de IA. Scripts de `src/` com nomes de teste podem chamar a API Softdesk real.

## Validacao

1. Revisar links e nomes da nova estrutura.
2. Executar `python -m compileall app tests` e registrar o resultado real.
3. Executar `python tests/run_unittest_discovery.py` e registrar o resultado real.
4. Confirmar com `git status` que o conjunto de alteracoes e somente o pretendido antes do commit final e push.

## Decisoes

- A estrutura antiga sera substituida, em vez de manter redirecionamentos, para haver apenas uma fonte editorial.
- O PDF externo permanece no repositorio, mas nao substitui a evidencia do codigo.
- Nenhuma skill adicional de auditoria sera instalada: a busca encontrou alternativas pouco adotadas e sem vantagem sobre a auditoria direta e as regras locais.
