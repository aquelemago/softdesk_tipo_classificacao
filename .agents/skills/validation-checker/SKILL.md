---
name: validation-checker
description: Valida se a documentação do codex-context/ está alinhada com o código-fonte. Verifica se todas as regras, módulos e variáveis mencionadas existem.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: documentation
  project: softdesk_tipo_classificacao
---

# Validation Checker

## 📌 Overview
Esta skill é responsável por **validar** se a documentação do projeto **Softdesk Ticket Type Classifier** está **alinhada com o código-fonte**. Ela verifica se:
- As **regras de negócio** em `01-overview.md` existem no código.
- Os **módulos** em `02-architecture.md` existem no código.
- As **variáveis** em `03-operations.md` são usadas no código.
- Os **arquivos** em `06-inventory.md` existem no projeto.

## 🔧 Funcionalidades

### 1. validate-business-rules()
**Objetivo:** Verificar se as **regras de negócio** em `01-overview.md` existem no código.

**Parâmetros:**
- Nenhum (valida todas as regras em `01-overview.md`).

**Como funciona:**
1. Lê o arquivo `01-overview.md` com `read`.
2. Extrai regras de negócio com `grep` (procurando por linhas que terminam com `caminho/arquivo:linha`).
3. Para cada regra:
   - Verifica se o arquivo existe com `glob`.
   - Verifica se a linha existe com `read`.
   - Verifica se o conteúdo da linha corresponde à regra.
4. Gera um relatório com regras **válidas** e **inválidas**.

**Exemplo de uso:**
```
validation-checker:validate-business-rules()
```

**Exemplo de saída:**
```markdown
# Validação de Regras de Negócio - 06/08/2026

## Regras Válidas
- Only tickets whose `tipo_chamado.descricao` normalizes to `nao classificado` are advanced to the LLM step. (`src/softdesk/retornaChamadosAbertos.js:36`) → ✅
- `DRY_RUN=true` blocks the `PUT`; any other value allows writes. (`main.js:13`) → ✅

## Regras Inválidas
- New rule: `NEW_FEATURE_ENABLED` controls the new feature. (`src/services/new-feature.js:999`) → ❌ (Linha 999 não existe).
```

---

### 2. validate-modules()
**Objetivo:** Verificar se os **módulos** em `02-architecture.md` existem no código.

**Parâmetros:**
- Nenhum (valida todos os módulos em `02-architecture.md`).

**Como funciona:**
1. Lê o arquivo `02-architecture.md` com `read`.
2. Extrai módulos das tabelas (procurando por linhas que começam com `| ` e contêm um caminho de arquivo).
3. Para cada módulo:
   - Verifica se o arquivo existe com `glob`.
   - Verifica se o arquivo é mencionado no código (opcional).
4. Gera um relatório com módulos **válidos** e **inválidos**.

**Exemplo de uso:**
```
validation-checker:validate-modules()
```

**Exemplo de saída:**
```markdown
# Validação de Módulos - 06/08/2026

## Módulos Válidos
- `src/services/softdesk/config.js` → ✅
- `src/services/softdesk/tickets.js` → ✅

## Módulos Inválidos
- `src/services/old-feature.js` → ❌ (Arquivo não existe).
- `src/services/new-feature.js` → ❌ (Arquivo existe, mas não está documentado).
```

---

### 3. validate-variables()
**Objetivo:** Verificar se as **variáveis** em `03-operations.md` são usadas no código.

**Parâmetros:**
- Nenhum (valida todas as variáveis em `03-operations.md`).

**Como funciona:**
1. Lê o arquivo `03-operations.md` com `read`.
2. Extrai variáveis da seção `Variables at a glance` (procurando por linhas que começam com `-`).
3. Para cada variável:
   - Verifica se a variável é usada no código com `grep` (procurando por `process.env.VARIABLE_NAME`).
4. Gera um relatório com variáveis **válidas** e **inválidas**.

**Exemplo de uso:**
```
validation-checker:validate-variables()
```

**Exemplo de saída:**
```markdown
# Validação de Variáveis - 06/08/2026

## Variáveis Válidas
- `DRY_RUN` → ✅ (Usada em main.js:13).
- `AUTO_SCHEDULE_ENABLED` → ✅ (Usada em server.js:58).

## Variáveis Inválidas
- `NEW_API_KEY` → ❌ (Não encontrada no código).
```

---

### 4. validate-inventory()
**Objetivo:** Verificar se os **arquivos** em `06-inventory.md` existem no projeto.

**Parâmetros:**
- Nenhum (valida todos os arquivos em `06-inventory.md`).

**Como funciona:**
1. Lê o arquivo `06-inventory.md` com `read`.
2. Extrai arquivos das tabelas (procurando por linhas que começam com `| ` e contêm um caminho).
3. Para cada arquivo:
   - Verifica se o arquivo existe com `glob`.
4. Gera um relatório com arquivos **válidos** e **inválidos**.

**Exemplo de uso:**
```
validation-checker:validate-inventory()
```

**Exemplo de saída:**
```markdown
# Validação de Inventário - 06/08/2026

## Arquivos Válidos
- `main.js` → ✅
- `server.js` → ✅
- `src/services/softdesk/config.js` → ✅

## Arquivos Inválidos
- `src/old-feature.js` → ❌ (Arquivo não existe).
- `src/services/new-feature.js` → ❌ (Arquivo existe, mas não está listado).
```

---

### 5. generate-validation-report(output_file)
**Objetivo:** Gerar um **relatório completo** de validação.

**Parâmetros:**
- `output_file` (string, opcional): Caminho para salvar o relatório (ex: `"reports/validation-2026-08-06.md"`). Se não fornecido, exibe o relatório no console.

**Como funciona:**
1. Executa `validate-business-rules()`.
2. Executa `validate-modules()`.
3. Executa `validate-variables()`.
4. Executa `validate-inventory()`.
5. Combina os resultados em um **relatório único**.
6. Salva o relatório em `output_file` com `write` ou exibe no console.

**Exemplo de uso:**
```
validation-checker:generate-validation-report(output_file: "reports/validation-2026-08-06.md")
```

**Exemplo de saída (em `reports/validation-2026-08-06.md`):**
```markdown
# Relatório de Validação - 06/08/2026

## Regras de Negócio
- ✅ Only tickets whose `tipo_chamado.descricao` normalizes to `nao classificado` are advanced to the LLM step. (`src/softdesk/retornaChamadosAbertos.js:36`)
- ❌ New rule: `NEW_FEATURE_ENABLED` controls the new feature. (`src/services/new-feature.js:999`)

## Módulos
- ✅ `src/services/softdesk/config.js`
- ❌ `src/services/old-feature.js` (Arquivo não existe)

## Variáveis
- ✅ `DRY_RUN` (Usada em main.js:13)
- ❌ `NEW_API_KEY` (Não encontrada no código)

## Inventário
- ✅ `main.js`
- ❌ `src/old-feature.js` (Arquivo não existe)

## Resumo
- **Total de erros:** 4
- **Regras inválidas:** 1
- **Módulos inválidos:** 1
- **Variáveis inválidas:** 1
- **Arquivos inválidos:** 1
```

---

## 📌 Exemplos Práticos

### Exemplo 1: Validar Regras de Negócio
**Comando:**
```
validation-checker:validate-business-rules()
```

**Resultado:**
- Relatório de regras válidas e inválidas em `01-overview.md`.

---

### Exemplo 2: Validar Módulos
**Comando:**
```
validation-checker:validate-modules()
```

**Resultado:**
- Relatório de módulos válidos e inválidos em `02-architecture.md`.

---

### Exemplo 3: Gerar Relatório Completo
**Comando:**
```
validation-checker:generate-validation-report(output_file: "reports/validation-2026-08-06.md")
```

**Resultado:**
- Arquivo `reports/validation-2026-08-06.md` com relatório completo.

---

## 🛡️ Regras de Segurança
1. **Nunca** ler ou expor `.env`, `config/*.env`, ou qualquer arquivo com segredos.
2. **Sempre** validar com o usuário antes de modificar arquivos (`question`).
3. **Não modificar** código da aplicação (apenas documentação).
4. **Usar** `grep` com cuidado para evitar capturar segredos.

---

## 📦 Dependências
- **OpenCode** (para ferramentas como `read`, `write`, `edit`, `glob`, `grep`).

---

## 🎯 Uso Recomendado
- **Para validar regras de negócio:** Use `validate-business-rules()`.
- **Para validar módulos:** Use `validate-modules()`.
- **Para validar variáveis:** Use `validate-variables()`.
- **Para validar inventário:** Use `validate-inventory()`.
- **Para gerar relatório completo:** Use `generate-validation-report(output_file)`.
