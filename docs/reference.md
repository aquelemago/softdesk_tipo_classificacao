# Referencias

## Regras de Negocio

### Confirmadas no codigo

- So chamados com `tipo_chamado.descricao === "Nao Classificado"` seguem para classificacao
- Tipos aceitos: `Duvida/Orientacao`, `Incidente`, `Requisicao`
- Prioridades aceitas: `Alta`, `Baixa`, `Critica`, `Media`
- IDs hardcoded no classificador: `Duvida/Orientacao`=102, `Incidente`=103, `Requisicao`=106, `Baixa`=1, `Media`=2, `Alta`=3, `Critica`=4
- `DRY_RUN=true` impede PUT no Softdesk

### Pendentes de validacao humana

- Taxonomia oficial de `Requisicao` (inclui solicitacao de servico?)
- Criterios oficiais de prioridade
- IDs atuais de tipos/prioridades no Softdesk
- Politica de privacidade para envio de dados a IA

## Plano vs Implementacao — Resumo

| Item | Status |
|---|---|
| Testes com mocks | implementado |
| Funcoes puras de prompt/parser/mapeamento/payload | implementado |
| Sanitizacao antes do prompt | implementado |
| JSON estrito como contrato | implementado (com fallback `TIPO|PRIORIDADE`) |
| Validacao de enums | implementado |
| `DRY_RUN` | implementado |
| Logs com motivo/confianca | parcial |
| Validar IDs contra Softdesk | ausente |
| Autenticacao nos endpoints | ausente |
| Suporte a Gemini | implementado (extra) |

Divergencia principal: planos originais tratavam parser como `split('|')`; codigo atual usa parser JSON com fallback.

## Roadmap

1. Teste de `main.js` com mocks provando `DRY_RUN=true`
2. Testes de gateways Softdesk com fetch mockado
3. Validar IDs de tipo/prioridade com fixture ou consulta autorizada
4. Validar taxonomia com suporte usando exemplos anonimizados
5. Adicionar autenticacao ou restricao de acesso a `/run-main` e `/clear-logs`
6. Politica operacional para quando cron deve ficar ligado

## Perguntas Abertas

- Qual a regra oficial para classificar Duvida/Orientacao, Incidente e Requisicao?
- Requisicao inclui solicitacao de servico, criacao de usuario e acesso?
- Quais criterios oficiais definem Baixa, Media, Alta e Critica?
- Os codigos 102, 103, 106, 1, 2, 3, 4 ainda sao os valores atuais no Softdesk?
- Existe ambiente de sandbox Softdesk?
- Pode enviar cliente, status e descricao para provedores externos de IA?
- A operacao deve usar OpenAI, Gemini ou outro provider?
- O cron deve permanecer a cada 15 minutos em producao?
- Quem pode acessar a interface e disparar `/run-main`?
- Como os segredos devem ser provisionados em producao?

## Referencia Externa

- `docs/reference/API_Softdesk_Documentacao_v1_30.pdf`: Documentacao original da API Softdesk
