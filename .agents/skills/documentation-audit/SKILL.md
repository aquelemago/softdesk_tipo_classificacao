---
name: documentation-audit
description: Audita documentação do codex-context para verificar consistência com o código-fonte. Verifica se referências a arquivos e linhas (ex: main.js:13) existem e estão corretas.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: documentation
  project: softdesk_tipo_classificacao
---

# Documentation Audit

## 📌 Overview
Esta skill é responsável por **auditar a documentação** do projeto **Softdesk Ticket Type Classifier**, verificando se todas as referências a arquivos e linhas de código (ex: `main.js:13`) existem e estão corretas. Também verifica links internos entre arquivos `.md` e a consistência de tabelas.

## 🔧 Funcionalidades

### 1. audit-references(path)
**Objetivo:** Verificar se todas as referências no formato `caminho/arquivo:linha` existem no código.

**Parâmetros:**
- `path` (string): Caminho para o diretório ou arquivo a ser auditado (ex: `"codex-context"` ou `"codex-context/01-overview.md"`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `path` com `glob`.
2. Extrai referências no formato `caminho/arquivo:linha` com `grep`.
3. Para cada referência:
   - Verifica se o arquivo existe com `glob`.
   - Verifica se a linha existe com `read`.
4. Gera um relatório com referências **válidas** e **inválidas**.

**Exemplo de uso:**
```
documentation-audit:audit-references(path: "codex-context")
```

**Exemplo de saída:**
```markdown
# Relatório de Referências - 06/08/2026

## Referências Válidas
- `main.js:13` → Existe (DRY_RUN === 'true').
- `server.js:58` → Existe (AUTO_SCHEDULE_ENABLED !== 'false').

## Referências Inválidas
- `main.js:999` → Não existe (linha 999 não encontrada).
- `src/old-feature.js:10` → Arquivo não existe.
```

---

### 2. audit-links(path)
**Objetivo:** Verificar se todos os **links internos** entre arquivos `.md` estão válidos.

**Parâmetros:**
- `path` (string): Caminho para o diretório ou arquivo a ser auditado (ex: `"codex-context"`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `path` com `glob`.
2. Extrai links no formato `[texto](caminho/para/arquivo.md)` com `grep`.
3. Para cada link:
   - Verifica se o arquivo destino existe com `glob`.
4. Gera um relatório com links **válidos** e **inválidos**.

**Exemplo de uso:**
```
documentation-audit:audit-links(path: "codex-context")
```

**Exemplo de saída:**
```markdown
# Relatório de Links - 06/08/2026

## Links Válidos
- `[01-overview.md](codex-context/01-overview.md)` → Existe.
- `[02-architecture.md](codex-context/02-architecture.md)` → Existe.

## Links Inválidos
- `[docs/old-guide.md](docs/old-guide.md)` → Arquivo não existe.
```

---

### 3. audit-tables(path)
**Objetivo:** Verificar se as **tabelas** em arquivos `.md` estão alinhadas com o código.

**Parâmetros:**
- `path` (string): Caminho para o diretório ou arquivo a ser auditado (ex: `"codex-context/02-architecture.md"`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `path` com `glob`.
2. Extrai tabelas com `grep` (procurando por `|`).
3. Para cada linha de tabela que referencia um arquivo (ex: `| `src/services/softdesk/config.js` | ...`):
   - Verifica se o arquivo existe com `glob`.
4. Gera um relatório com **módulos documentados** e **faltantes**.

**Exemplo de uso:**
```
documentation-audit:audit-tables(path: "codex-context/02-architecture.md")
```

**Exemplo de saída:**
```markdown
# Relatório de Tabelas - 06/08/2026

## Módulos Documentados
- `src/services/softdesk/config.js` → Existe.
- `src/services/softdesk/tickets.js` → Existe.

## Módulos Faltantes
- `src/services/new-feature.js` → Não documentado.
```

---

### 4. report-issues(path, output_file)
**Objetivo:** Gerar um **relatório completo** de inconsistências na documentação.

**Parâmetros:**
- `path` (string): Caminho para o diretório a ser auditado (ex: `"codex-context"`).
- `output_file` (string, opcional): Caminho para salvar o relatório (ex: `"reports/audit-YYYY-MM-DD.md"`). Se não fornecido, exibe o relatório no console.

**Como funciona:**
1. Executa `audit-references(path)`.
2. Executa `audit-links(path)`.
3. Executa `audit-tables(path)`.
4. Combina os resultados em um **relatório único**.
5. Salva o relatório em `output_file` com `write` ou exibe no console.

**Exemplo de uso:**
```
documentation-audit:report-issues(path: "codex-context", output_file: "reports/audit-2026-08-06.md")
```

**Exemplo de saída (em `reports/audit-2026-08-06.md`):**
```markdown
# Relatório de Auditoria - 06/08/2026

## Referências Quebradas
- `main.js:999` → Não existe (linha 999 não encontrada em main.js).
- `src/old-feature.js:10` → Arquivo não existe (removido em commit abc123).

## Links Inválidos
- `[docs/old-guide.md](docs/old-guide.md)` → Arquivo não existe.

## Módulos Faltantes
- `src/services/new-feature.js` → Não documentado em 02-architecture.md.

## Arquivos Faltantes no Inventário
- `src/services/new-feature.js` → Não listado em 06-inventory.md.
```

---

## 📌 Exemplos Práticos

### Exemplo 1: Auditar Todas as Referências no `codex-context/`
**Comando:**
```
documentation-audit:audit-references(path: "codex-context")
```

**Resultado:**
- Lista todas as referências a `caminho/arquivo:linha` em `codex-context/`.
- Verifica se cada referência existe no código.
- Exibe relatório com referências válidas e inválidas.

---

### Exemplo 2: Auditar Links em `README.md`
**Comando:**
```
documentation-audit:audit-links(path: "README.md")
```

**Resultado:**
- Extrai todos os links em `README.md`.
- Verifica se os arquivos destino existem.
- Exibe relatório com links válidos e inválidos.

---

### Exemplo 3: Gerar Relatório Completo
**Comando:**
```
documentation-audit:report-issues(path: "codex-context", output_file: "reports/audit-2026-08-06.md")
```

**Resultado:**
- Cria o arquivo `reports/audit-2026-08-06.md` com:
  - Referências quebradas.
  - Links inválidos.
  - Módulos faltantes.

---

## 🛡️ Regras de Segurança
1. **Nunca** ler ou expor `.env`, `config/*.env`, ou qualquer arquivo com segredos.
2. **Sempre** validar com o usuário antes de modificar arquivos (`question`).
3. **Manter** consistência com o código: todas as referências em `.md` devem ser verificáveis.
4. **Não modificar** código da aplicação (apenas documentação).

---

## 📦 Dependências
- **OpenCode** (para ferramentas como `read`, `write`, `glob`, `grep`).
- **Git** (opcional, para referências a commits).

---

## 🎯 Uso Recomendado
- **Antes de commitar:** Execute `documentation-audit:report-issues(path: "codex-context")` para verificar inconsistências.
- **Após adicionar novo código:** Execute `documentation-audit:audit-references(path: "codex-context")` para atualizar referências.
- **Para manutenção:** Execute `documentation-audit:audit-all()` (se implementado) para uma auditoria completa.
