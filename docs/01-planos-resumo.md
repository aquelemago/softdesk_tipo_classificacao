# Resumo da pasta planos

## Escopo lido e consolidado

Foram analisados todos os arquivos Markdown em `planos/contexto-completo-md/`, incluindo:

- entrada e mapa de arquivos;
- documentacao principal;
- arquitetura;
- onboarding;
- analise de debug;
- plano de correcao da classificacao;
- anexos;
- agendamento legado;
- auditoria/agentes.

O diretorio original `planos/` foi tratado como fonte historica de planejamento e consolidado nesta documentacao. Depois da consolidacao, a documentacao humana principal passou a ficar apenas em `docs/`.

## Intencao geral dos planos

Os planos representam uma base documental para entender e corrigir a classificacao incorreta de chamados. A intencao principal e tornar o fluxo seguro, testavel e auditavel antes de qualquer alteracao em producao.

## Requisitos funcionais planejados

- Buscar chamados abertos no Softdesk.
- Detalhar chamados.
- Filtrar chamados `Nao Classificado`.
- Classificar tipo/prioridade com IA.
- Atualizar chamado no Softdesk.
- Exibir logs em tempo real.
- Permitir execucao manual pela interface.
- Permitir agendamento automatico.
- Adicionar `DRY_RUN`.
- Suportar testes com mocks.

## Requisitos nao funcionais planejados

- Evitar chamadas reais durante testes.
- Nao expor segredos.
- Documentar com evidencias por arquivo.
- Separar fato implementado de inferencia.
- Manter logs auditaveis e seguros.
- Preservar compatibilidade operacional.

## Decisoes tecnicas planejadas

- Criar funcoes puras para prompt, parsing, mapeamento e payload.
- Usar JSON validado como contrato de IA.
- Sanitizar descricao antes do prompt.
- Validar enums.
- Centralizar mapeamentos.
- Criar testes antes de alterar comportamento.
- Validar taxonomia com humanos.

## Ambiguidades e contradicoes

- Agendamento: documentacao legada fala em 1 hora, codigo real usa 15 minutos.
- `src/test-*`: nomes sugerem testes, mas arquivos podem chamar APIs reais.
- `Requisicao`: regra oficial nao esta definida.
- IDs Softdesk: planos assumem mapas hardcoded, mas pedem validacao.
- Testes: planos antigos diziam ausentes; codigo atual ja possui `npm test`.
