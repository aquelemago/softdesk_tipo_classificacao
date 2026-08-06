---
name: change-detector
description: Detecta alterações no código-fonte e sugere atualizações na documentação do codex-context/. Usa git diff e glob para identificar novos arquivos, funções removidas, etc.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: documentation
  project: softdesk_tipo_classificacao
---

# Change Detector

## 📌 Overview
Esta skill é responsável por **detectar alterações no código-fonte** do projeto **Softdesk Ticket Type Classifier** e sugerir atualizações na documentação do `codex-context/`. Ela utiliza comandos `git` e `glob` para identificar:
- Novos arquivos.
- Arquivos removidos.
- Novas funções ou classes.
- Novas variáveis de ambiente.

## 🔧 Funcionalidades

### 1. detect-new-files(commit_range)
**Objetivo:** Detectar **novos arquivos** adicionados ao código.

**Parâmetros:**
- `commit_range` (string, opcional): Range de commits para verificar (ex: `"HEAD~1"` para o último commit). Default: `"HEAD~1"`.

**Como funciona:**
1. Executa `bash(command: "git diff --name-only --diff-filter=A " + commit_range)` para listar arquivos **adicionados**.
2. Filtra arquivos relevantes (ex: `.js`, `.json`, etc.).
3. Retorna uma lista de arquivos novos.

**Exemplo de uso:**
```
change-detector:detect-new-files()
```

**Exemplo de saída:**
```
Novos arquivos detectados:
- src/services/new-feature.js
- tests/new-feature.test.js
```

---

### 2. detect-removed-files(commit_range)
**Objetivo:** Detectar **arquivos removidos** do código.

**Parâmetros:**
- `commit_range` (string, opcional): Range de commits para verificar (ex: `"HEAD~1"`). Default: `"HEAD~1"`.

**Como funciona:**
1. Executa `bash(command: "git diff --name-only --diff-filter=D " + commit_range)` para listar arquivos **removidos**.
2. Filtra arquivos relevantes.
3. Retorna uma lista de arquivos removidos.

**Exemplo de uso:**
```
change-detector:detect-removed-files()
```

**Exemplo de saída:**
```
Arquivos removidos detectados:
- src/old-feature.js
```

---

### 3. detect-new-functions(path, commit_range)
**Objetivo:** Detectar **novas funções ou classes** no código.

**Parâmetros:**
- `path` (string): Caminho para o diretório a ser verificado (ex: `"src"`).
- `commit_range` (string, opcional): Range de commits para verificar. Default: `"HEAD~1"`.

**Como funciona:**
1. Executa `bash(command: "git diff --name-only " + commit_range)` para listar arquivos modificados.
2. Para cada arquivo em `path`:
   - Lê o arquivo com `read`.
   - Extrai funções e classes com `grep` (procurando por `function`, `class`, `const`, etc.).
3. Compara com a versão anterior do arquivo (usando `git show`).
4. Retorna uma lista de **novas funções/classes**.

**Exemplo de uso:**
```
change-detector:detect-new-functions(path: "src")
```

**Exemplo de saída:**
```
Novas funções detectadas em src/services/new-feature.js:
- classifyNewFeature()
- validateNewFeature()
```

---

### 4. detect-new-variables(commit_range)
**Objetivo:** Detectar **novas variáveis de ambiente** ou constantes no código.

**Parâmetros:**
- `commit_range` (string, opcional): Range de commits para verificar. Default: `"HEAD~1"`.

**Como funciona:**
1. Executa `bash(command: "git diff --name-only " + commit_range)` para listar arquivos modificados.
2. Para cada arquivo:
   - Extrai variáveis de ambiente (ex: `process.env.NEW_VARIABLE`) com `grep`.
   - Extrai constantes (ex: `const NEW_CONSTANT = ...`) com `grep`.
3. Compara com a versão anterior do arquivo.
4. Retorna uma lista de **novas variáveis/constantes**.

**Exemplo de uso:**
```
change-detector:detect-new-variables()
```

**Exemplo de saída:**
```
Novas variáveis detectadas:
- process.env.NEW_API_KEY (em src/services/new-feature.js:10)
- const NEW_CONSTANT = "value" (em src/utils/constants.js:5)
```

---

### 5. detect-changes(commit_range)
**Objetivo:** Detectar **todas as mudanças** (arquivos, funções, variáveis) em um range de commits.

**Parâmetros:**
- `commit_range` (string, opcional): Range de commits para verificar. Default: `"HEAD~1"`.

**Como funciona:**
1. Executa `detect-new-files(commit_range)`.
2. Executa `detect-removed-files(commit_range)`.
3. Executa `detect-new-functions("src", commit_range)`.
4. Executa `detect-new-variables(commit_range)`.
5. Retorna um **relatório completo** de mudanças.

**Exemplo de uso:**
```
change-detector:detect-changes()
```

**Exemplo de saída:**
```markdown
# Relatório de Mudanças - 06/08/2026

## Arquivos Novos
- src/services/new-feature.js
- tests/new-feature.test.js

## Arquivos Removidos
- src/old-feature.js

## Novas Funções
- classifyNewFeature() (em src/services/new-feature.js)
- validateNewFeature() (em src/services/new-feature.js)

## Novas Variáveis
- process.env.NEW_API_KEY (em src/services/new-feature.js:10)
```

---

### 6. suggest-updates()
**Objetivo:** Sugerir **atualizações na documentação** com base nas mudanças detectadas.

**Parâmetros:**
- Nenhum (usa `detect-changes()` para detectar mudanças).

**Como funciona:**
1. Executa `detect-changes()`.
2. Para cada mudança detectada:
   - **Novos arquivos:** Sugere adicionar a `06-inventory.md` e `02-architecture.md`.
   - **Arquivos removidos:** Sugere remover de `06-inventory.md`.
   - **Novas funções:** Sugere adicionar a `02-architecture.md`.
   - **Novas variáveis:** Sugere adicionar a `03-operations.md`.
3. Retorna uma lista de **sugestões de atualização**.

**Exemplo de uso:**
```
change-detector:suggest-updates()
```

**Exemplo de saída:**
```markdown
# Sugestões de Atualização - 06/08/2026

## Ações Recomendadas
1. **Adicionar a 06-inventory.md:**
   - `src/services/new-feature.js` (New feature implementation).
   - `tests/new-feature.test.js` (Tests for new feature).

2. **Adicionar a 02-architecture.md:**
   - `src/services/new-feature.js` (Handles new feature X).
   - Funções: `classifyNewFeature()`, `validateNewFeature()`.

3. **Adicionar a 03-operations.md:**
   - Variável: `NEW_API_KEY` (em src/services/new-feature.js:10).

4. **Remover de 06-inventory.md:**
   - `src/old-feature.js` (Arquivo removido).
```

---

## 📌 Exemplos Práticos

### Exemplo 1: Detectar Novos Arquivos
**Comando:**
```
change-detector:detect-new-files()
```

**Resultado:**
- Lista de arquivos adicionados no último commit.

---

### Exemplo 2: Detectar Funções Novas
**Comando:**
```
change-detector:detect-new-functions(path: "src")
```

**Resultado:**
- Lista de funções/classes adicionadas em `src/`.

---

### Exemplo 3: Sugerir Atualizações
**Comando:**
```
change-detector:suggest-updates()
```

**Resultado:**
- Lista de sugestões para atualizar `06-inventory.md`, `02-architecture.md`, etc.

---

## 🛡️ Regras de Segurança
1. **Nunca** ler ou expor `.env`, `config/*.env`, ou qualquer arquivo com segredos.
2. **Sempre** validar com o usuário antes de modificar arquivos (`question`).
3. **Não modificar** código da aplicação (apenas documentação).
4. **Usar** `git diff` com cuidado para evitar expor conteúdo sensível.

---

## 📦 Dependências
- **OpenCode** (para ferramentas como `bash`, `read`, `grep`, `glob`).
- **Git** (para comandos como `git diff`, `git show`).

---

## 🎯 Uso Recomendado
- **Após um commit:** Execute `change-detector:detect-changes()` para detectar todas as mudanças.
- **Para sugerir atualizações:** Execute `change-detector:suggest-updates()`.
- **Para detectar novos arquivos:** Execute `change-detector:detect-new-files()`.
- **Para detectar novas funções:** Execute `change-detector:detect-new-functions(path: "src")`.
