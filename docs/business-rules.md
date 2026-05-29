# Regras de negocio

## Confirmadas no codigo

- So chamados com `tipo_chamado.descricao === "Nao Classificado"` seguem para classificacao.
- Tipos aceitos pelo classificador:
  - `Duvida/Orientacao`
  - `Incidente`
  - `Requisicao`
- Prioridades aceitas:
  - `Alta`
  - `Baixa`
  - `Critica`
  - `Media`
- IDs hardcoded:
  - `Duvida/Orientacao`: `102`
  - `Incidente`: `103`
  - `Requisicao`: `106`
  - `Baixa`: `1`
  - `Media`: `2`
  - `Alta`: `3`
  - `Critica`: `4`
- Se `DRY_RUN=true`, o payload e validado/logado, mas nao enviado ao Softdesk.

## Planejadas e parcialmente implementadas

- Classificacao por JSON estrito: implementada como contrato preferencial.
- Validacao de enums: implementada.
- Sanitizacao antes do prompt: implementada em `main.js` e `utils/classificador_openai.js`.
- Logs seguros com motivo/confianca: parcialmente implementado; o classificador retorna `motivoCurto` e `confianca`, mas `main.js` ainda nao registra esses campos de forma completa.

## Precisa de validacao humana

- Taxonomia oficial de `Requisicao`, especialmente solicitacoes de servico.
- Criterios oficiais de prioridade.
- IDs atuais de tipos/prioridades no Softdesk.
- Politica de privacidade para envio de campos adicionais a IA.

