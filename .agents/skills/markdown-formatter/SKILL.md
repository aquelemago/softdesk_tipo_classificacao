---
name: markdown-formatter
description: Formata arquivos Markdown do codex-context/ para seguir um padrão consistente. Ajusta tabelas, links, referências e estilo.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: documentation
  project: softdesk_tipo_classificacao
---

# Markdown Formatter

## 📌 Overview
Esta skill é responsável por **formatar arquivos Markdown** do diretório `codex-context/` para seguir um **padrão consistente**. Ela ajusta:
- Tabelas (alinhamento, colunas).
- Links internos (formato, paths relativos).
- Referências a código (formato `caminho/arquivo:linha`).
- Cabeçalhos (estilo, hierarquia).

## 🔧 Funcionalidades

### 1. format-tables(path)
**Objetivo:** Formatar **tabelas** em arquivos Markdown.

**Parâmetros:**
- `path` (string): Caminho para o arquivo ou diretório (ex: `"codex-context/02-architecture.md"` ou `"codex-context"`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `path` com `glob`.
2. Para cada arquivo:
   - Lê o conteúdo com `read`.
   - Localiza tabelas (linhas que começam com `|`).
   - Ajusta o alinhamento das colunas (garante que todas as linhas tenham o mesmo número de colunas).
   - Garante que a linha de cabeçalho (ex: `| File | Responsibility |`) esteja alinhada com as outras linhas.
3. Salva as alterações com `edit`.

**Exemplo de uso:**
```
markdown-formatter:format-tables(path: "codex-context")
```

**Exemplo de entrada:**
```markdown
| File | Responsibility |
| --- | --- |
| `main.js` | Pipeline orchestration.|
| `server.js` | HTTP + WebSocket + cron.|
```

**Exemplo de saída:**
```markdown
| File | Responsibility |
| --- | --- |
| `main.js` | Pipeline orchestration. |
| `server.js` | HTTP + WebSocket + cron. |
```

---

### 2. format-links(path)
**Objetivo:** Padronizar **links internos** em arquivos Markdown.

**Parâmetros:**
- `path` (string): Caminho para o arquivo ou diretório (ex: `"codex-context"`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `path` com `glob`.
2. Para cada arquivo:
   - Extrai links no formato `[texto](caminho)` com `grep`.
   - Converte paths absolutos para **relativos** (ex: `/codex-context/01-overview.md` → `./codex-context/01-overview.md`).
   - Garante que links para arquivos `.md` não incluam a extensão (opcional, dependendo do estilo do projeto).
3. Salva as alterações com `edit`.

**Exemplo de uso:**
```
markdown-formatter:format-links(path: "codex-context")
```

**Exemplo de entrada:**
```markdown
Veja [Visão Geral](/codex-context/01-overview.md) para mais detalhes.
```

**Exemplo de saída:**
```markdown
Veja [Visão Geral](./codex-context/01-overview.md) para mais detalhes.
```

---

### 3. format-references(path)
**Objetivo:** Padronizar **referências a código** (ex: `main.js:13`).

**Parâmetros:**
- `path` (string): Caminho para o arquivo ou diretório (ex: `"codex-context"`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `path` com `glob`.
2. Para cada arquivo:
   - Extrai referências no formato `caminho/arquivo:linha` com `grep`.
   - Garante que o formato seja consistente (ex: `main.js:13` em vez de `main.js:13: ` ou `main.js, line 13`).
   - Adiciona espaços após a referência se necessário (ex: `main.js:13` → `main.js:13`).
3. Salva as alterações com `edit`.

**Exemplo de uso:**
```
markdown-formatter:format-references(path: "codex-context")
```

**Exemplo de entrada:**
```markdown
- Regra 1 (`main.js:13:`).
- Regra 2 (veja main.js, line 20).
```

**Exemplo de saída:**
```markdown
- Regra 1 (`main.js:13`).
- Regra 2 (`main.js:20`).
```

---

### 4. format-headers(path)
**Objetivo:** Padronizar **cabeçalhos** em arquivos Markdown.

**Parâmetros:**
- `path` (string): Caminho para o arquivo ou diretório (ex: `"codex-context"`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `path` com `glob`.
2. Para cada arquivo:
   - Extrai cabeçalhos (linhas que começam com `#`).
   - Garante que:
     - O título principal seja `# Título` (sem números).
     - Os subtítulos sigam o padrão `## 01 — Título` (com números e traços).
     - Haja um espaço após `#` (ex: `#Título` → `# Título`).
3. Salva as alterações com `edit`.

**Exemplo de uso:**
```
markdown-formatter:format-headers(path: "codex-context")
```

**Exemplo de entrada:**
```markdown
#01 — Overview
##Purpose
```

**Exemplo de saída:**
```markdown
# 01 — Overview
## Purpose
```

---

### 5. lint-markdown(file)
**Objetivo:** Verificar **erros de formatação** em um arquivo Markdown.

**Parâmetros:**
- `file` (string): Caminho para o arquivo (ex: `"codex-context/01-overview.md"`).

**Como funciona:**
1. Lê o arquivo com `read`.
2. Verifica os seguintes problemas:
   - Tabelas mal alinhadas.
   - Links com paths absolutos.
   - Referências a código em formato inconsistente.
   - Cabeçalhos sem espaço após `#`.
   - Linhas muito longas (> 120 caracteres).
3. Retorna uma lista de **erros** e **sugestões de correção**.

**Exemplo de uso:**
```
markdown-formatter:lint-markdown(file: "codex-context/01-overview.md")
```

**Exemplo de saída:**
```markdown
# Erros em codex-context/01-overview.md

## Tabelas
- Linha 10: Tabela mal alinhada (coluna "Responsibility" tem 2 espaços a mais).

## Links
- Linha 20: Link com path absoluto (`/codex-context/02-architecture.md` → `./codex-context/02-architecture.md`).

## Referências
- Linha 30: Referência em formato inconsistente (`main.js:13:` → `main.js:13`).
```

---

### 6. format-all(path)
**Objetivo:** Formatar **todos os aspectos** (tabelas, links, referências, cabeçalhos) em arquivos Markdown.

**Parâmetros:**
- `path` (string): Caminho para o arquivo ou diretório (ex: `"codex-context"`).

**Como funciona:**
1. Executa `format-tables(path)`.
2. Executa `format-links(path)`.
3. Executa `format-references(path)`.
4. Executa `format-headers(path)`.
5. Retorna um relatório de alterações.

**Exemplo de uso:**
```
markdown-formatter:format-all(path: "codex-context")
```

**Exemplo de saída:**
```markdown
# Relatório de Formatação - 06/08/2026

## Alterações Realizadas
- Tabelas formatadas em 02-architecture.md.
- Links padronizados em 01-overview.md.
- Referências ajustadas em 03-operations.md.
- Cabeçalhos corrigidos em 04-decisions.md.
```

---

## 📌 Exemplos Práticos

### Exemplo 1: Formatar Tabelas em `02-architecture.md`
**Comando:**
```
markdown-formatter:format-tables(path: "codex-context/02-architecture.md")
```

**Resultado:**
- Tabelas em `02-architecture.md` são alinhadas.

---

### Exemplo 2: Padronizar Links em `README.md`
**Comando:**
```
markdown-formatter:format-links(path: "README.md")
```

**Resultado:**
- Links em `README.md` são convertidos para paths relativos.

---

### Exemplo 3: Formatar Tudo no `codex-context/`
**Comando:**
```
markdown-formatter:format-all(path: "codex-context")
```

**Resultado:**
- Todos os arquivos em `codex-context/` são formatados.

---

## 🛡️ Regras de Segurança
1. **Nunca** ler ou expor `.env`, `config/*.env`, ou qualquer arquivo com segredos.
2. **Sempre** validar com o usuário antes de modificar arquivos (`question`).
3. **Não modificar** código da aplicação (apenas documentação).
4. **Fazer backup** antes de formatações automáticas.

---

## 📦 Dependências
- **OpenCode** (para ferramentas como `read`, `write`, `edit`, `glob`, `grep`).

---

## 🎯 Uso Recomendado
- **Para formatar tabelas:** Use `format-tables(path)`.
- **Para padronizar links:** Use `format-links(path)`.
- **Para ajustar referências:** Use `format-references(path)`.
- **Para corrigir cabeçalhos:** Use `format-headers(path)`.
- **Para verificar erros:** Use `lint-markdown(file)`.
- **Para formatar tudo:** Use `format-all(path)`.
