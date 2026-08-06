---
name: documentation-generator
description: Gera nova documentação para o codex-context com base em alterações no código. Cria ADRs, atualiza backlog e inventário automaticamente.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: documentation
  project: softdesk_tipo_classificacao
---

# Documentation Generator

## 📌 Overview
Esta skill é responsável por **gerar nova documentação** para o projeto **Softdesk Ticket Type Classifier**, com base em alterações no código-fonte. Ela pode criar **ADRs (Architecture Decision Records)**, atualizar o **backlog** e o **inventário**, e gerar seções de **visão geral** e **arquitetura**.

## 🔧 Funcionalidades

### 1. generate-adr(title, context, decision, consequences)
**Objetivo:** Criar um novo **ADR (Architecture Decision Record)** em `04-decisions.md`.

**Parâmetros:**
- `title` (string): Título do ADR (ex: `"ADR-011 — Add Authentication to Endpoints"`).
- `context` (string): Contexto da decisão (ex: `"POST /run-main and /clear-logs are unauthenticated (server.js:87-107)."`).
- `decision` (string): Decisão tomada (ex: `"Add API key validation to these endpoints."`).
- `consequences` (string): Consequências da decisão (ex: `"Clients must include X-API-KEY header; requires changes to server.js and public/app.js."`).

**Como funciona:**
1. Lê o arquivo `04-decisions.md` com `read`.
2. Determina o próximo número de ADR (ex: `ADR-011`).
3. Adiciona uma nova entrada no formato:
   ```markdown
   ## ADR-[XXX] — [title]
   - **Context:** [context]
   - **Decision:** [decision]
   - **Consequences:** [consequences]
   ```
4. Atualiza o arquivo com `edit`.
5. Pergunta ao usuário se deseja commitar as mudanças com `question`.

**Exemplo de uso:**
```
documentation-generator:generate-adr(
  title: "ADR-011 — Add Authentication to Endpoints",
  context: "POST /run-main and /clear-logs are unauthenticated (server.js:87-107).",
  decision: "Add API key validation to these endpoints.",
  consequences: "Clients must include X-API-KEY header; requires changes to server.js and public/app.js."
)
```

**Exemplo de saída (em `04-decisions.md`):**
```markdown
## ADR-011 — Add Authentication to Endpoints
- **Context:** `POST /run-main` and `POST /clear-logs` are currently unauthenticated (`server.js:87-107`), which is a security risk.
- **Decision:** Add API key validation to these endpoints.
- **Consequences:** Clients must include `X-API-KEY` header; requires changes to `server.js` e `public/app.js`.
```

---

### 2. update-backlog(entry, suggested_move, category)
**Objetivo:** Adicionar uma entrada no **backlog** (`05-backlog.md`).

**Parâmetros:**
- `entry` (string): Descrição da entrada (ex: `"Add authentication to /run-main and /clear-logs"`).
- `suggested_move` (string): Sugestão de solução (ex: `"Implement API key validation."`).
- `category` (string, opcional): Categoria da entrada (`"Operational risks"`, `"Behavioural debt"`, `"Documentation debt"`, ou `"Future improvements"`). Default: `"Future improvements"`.

**Como funciona:**
1. Lê o arquivo `05-backlog.md` com `read`.
2. Adiciona uma nova entrada na seção correspondente à `category`:
   ```markdown
   - **[entry]**: [suggested_move] (`caminho/arquivo:linha`).
   ```
3. Atualiza o arquivo com `edit`.
4. Pergunta ao usuário se deseja commitar as mudanças com `question`.

**Exemplo de uso:**
```
documentation-generator:update-backlog(
  entry: "Add authentication to `/run-main` and `/clear-logs`",
  suggested_move: "Implement API key validation.",
  category: "Operational risks"
)
```

**Exemplo de saída (em `05-backlog.md`):**
```markdown
## Operational risks
- **Add authentication to `/run-main` and `/clear-logs`**: Implement API key validation. (`server.js:87-107`)
```

---

### 3. update-inventory()
**Objetivo:** Atualizar o **inventário** (`06-inventory.md`) com novos arquivos, módulos ou integrações.

**Parâmetros:**
- Nenhum (detecta automaticamente novos arquivos).

**Como funciona:**
1. Lista todos os arquivos em `src/`, `tests/`, e outros diretórios relevantes com `glob`.
2. Compara com as entradas atuais em `06-inventory.md`.
3. Adiciona novas entradas para:
   - **Arquivos de projeto** (ex: `main.js`, `server.js`).
   - **Módulos** (ex: `src/services/softdesk/config.js`).
   - **Testes** (ex: `tests/classificador_openai.test.js`).
   - **Documentação** (ex: `codex-context/01-overview.md`).
4. Atualiza o arquivo com `edit`.
5. Pergunta ao usuário se deseja commitar as mudanças com `question`.

**Exemplo de uso:**
```
documentation-generator:update-inventory()
```

**Exemplo de saída (em `06-inventory.md`):**
```markdown
## Source modules
| Path | Role |
| --- | --- |
| `src/services/softdesk/config.js` | Softdesk base URL and headers. |
| `src/services/new-feature.js` | New feature implementation. |
```

---

### 4. generate-overview()
**Objetivo:** Atualizar a **visão geral** (`01-overview.md`) com novas regras de negócio, entradas ou saídas.

**Parâmetros:**
- Nenhum (detecta automaticamente novas regras ou I/O).

**Como funciona:**
1. Analisa o código-fonte (ex: `main.js`, `server.js`, `src/`) com `grep` para identificar:
   - **Regras de negócio** (ex: `DRY_RUN === 'true'`).
   - **Entradas** (ex: `GET /chamado?RetornaUltimosChamadosAbertos`).
   - **Saídas** (ex: `PUT /chamado`).
   - **Efeitos colaterais** (ex: writes to `logs/`).
2. Atualiza as seções correspondentes em `01-overview.md`:
   - **Business rules**: Adiciona novas regras.
   - **Inputs**: Adiciona novas entradas.
   - **Outputs**: Adiciona novas saídas.
   - **Side effects**: Adiciona novos efeitos.
3. Pergunta ao usuário se deseja commitar as mudanças com `question`.

**Exemplo de uso:**
```
documentation-generator:generate-overview()
```

**Exemplo de saída (em `01-overview.md`):**
```markdown
## Business rules (confirmed in code)
- Only tickets whose `tipo_chamado.descricao` normalizes to `nao classificado` are advanced to the LLM step. (`src/softdesk/retornaChamadosAbertos.js:36`).
- `DRY_RUN=true` blocks the `PUT`; any other value allows writes. (`main.js:13`).
- New rule: `NEW_FEATURE_ENABLED` controls the new feature. (`src/services/new-feature.js:10`).

## Inputs
- Open tickets from Softdesk `GET /chamado?RetornaUltimosChamadosAbertos&limit={limit}`. (`src/softdesk/retornaChamadosAbertos.js:62-94`).
- New input: `POST /new-endpoint` with JSON body. (`server.js:200`).
```

---

### 5. generate-architecture()
**Objetivo:** Atualizar a **arquitetura** (`02-architecture.md`) com novos módulos ou fluxos.

**Parâmetros:**
- Nenhum (detecta automaticamente novos módulos).

**Como funciona:**
1. Lista todos os arquivos em `src/`, `server/`, e `public/` com `glob`.
2. Identifica novos **módulos** (ex: `src/services/new-feature.js`).
3. Atualiza as seções em `02-architecture.md`:
   - **Modules**: Adiciona novos módulos à tabela.
   - **End-to-end flow**: Atualiza o fluxo se necessário.
   - **Configuration**: Adiciona novas variáveis de ambiente.
4. Pergunta ao usuário se deseja commitar as mudanças com `question`.

**Exemplo de uso:**
```
documentation-generator:generate-architecture()
```

**Exemplo de saída (em `02-architecture.md`):**
```markdown
## Modules
### Services - Classification
| File | Responsibility |
| --- | --- |
| `src/services/classification/classify.js` | Main orchestrator: invokes provider, parses response, maps to Softdesk IDs. |
| `src/services/new-feature.js` | Handles new feature X for Softdesk tickets. |

## End-to-end flow
```
Softdesk list --> ticket detail gate --> sanitization --> OpenAI/Gemini
  --> parser + static ID mapping --> payload --> DRY_RUN gate --> Softdesk PUT
  --> new-feature (if enabled)
```
```

---

## 📌 Exemplos Práticos

### Exemplo 1: Criar um Novo ADR
**Comando:**
```
documentation-generator:generate-adr(
  title: "ADR-011 — Add Authentication to Endpoints",
  context: "POST /run-main and /clear-logs are unauthenticated (server.js:87-107).",
  decision: "Add API key validation to these endpoints.",
  consequences: "Clients must include X-API-KEY header; requires changes to server.js and public/app.js."
)
```

**Resultado:**
- Novo ADR adicionado a `04-decisions.md`.
- Usuário é perguntado se deseja commitar.

---

### Exemplo 2: Atualizar Inventário
**Comando:**
```
documentation-generator:update-inventory()
```

**Resultado:**
- Novos arquivos em `src/` são adicionados a `06-inventory.md`.
- Usuário é perguntado se deseja commitar.

---

### Exemplo 3: Atualizar Backlog
**Comando:**
```
documentation-generator:update-backlog(
  entry: "Add tests for new-feature.js",
  suggested_move: "Write unit tests with mocked fetch.",
  category: "Behavioural debt"
)
```

**Resultado:**
- Nova entrada adicionada a `05-backlog.md` na seção `Behavioural debt`.

---

## 🛡️ Regras de Segurança
1. **Nunca** ler ou expor `.env`, `config/*.env`, ou qualquer arquivo com segredos.
2. **Sempre** validar com o usuário antes de modificar arquivos (`question`).
3. **Manter** consistência com o código: todas as referências em `.md` devem ser verificáveis.
4. **Não modificar** código da aplicação (apenas documentação).
5. **Usar** referências precisas (ex: `main.js:13`).

---

## 📦 Dependências
- **OpenCode** (para ferramentas como `read`, `write`, `edit`, `glob`, `grep`, `question`).
- **Git** (opcional, para referências a commits).

---

## 🎯 Uso Recomendado
- **Após adicionar novo código:** Execute `documentation-generator:update-inventory()` e `documentation-generator:generate-architecture()`.
- **Para documentar decisões:** Execute `documentation-generator:generate-adr()`.
- **Para adicionar dívidas técnicas:** Execute `documentation-generator:update-backlog()`.
- **Para atualizar visão geral:** Execute `documentation-generator:generate-overview()`.
