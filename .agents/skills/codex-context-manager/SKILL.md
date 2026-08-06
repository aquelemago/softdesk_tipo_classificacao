---
name: codex-context-manager
description: Gerencia os arquivos do codex-context/, incluindo leitura, escrita e validação de referências cruzadas entre documentos.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: documentation
  project: softdesk_tipo_classificacao
---

# Codex-Context Manager

## 📌 Overview
Esta skill é responsável por **gerenciar os arquivos** do diretório `codex-context/`, incluindo:
- Leitura e escrita de arquivos `.md`.
- Validação de **referências cruzadas** entre documentos.
- Sincronização com o código-fonte.
- Geração de relatórios de sincronização.

## 🔧 Funcionalidades

### 1. read-context(file)
**Objetivo:** Ler o conteúdo de um arquivo específico do `codex-context/`.

**Parâmetros:**
- `file` (string): Caminho para o arquivo (ex: `"codex-context/01-overview.md"`).

**Como funciona:**
1. Verifica se o arquivo existe com `glob`.
2. Lê o conteúdo do arquivo com `read`.
3. Retorna o conteúdo para o usuário.

**Exemplo de uso:**
```
codex-context-manager:read-context(file: "codex-context/01-overview.md")
```

**Exemplo de saída:**
```markdown
# 01 — Overview

## Purpose
The Softdesk Ticket Type Classifier automates the triage...
```

---

### 2. update-context(file, section, new_entry, old_entry)
**Objetivo:** Atualizar um arquivo do `codex-context/` com novas informações.

**Parâmetros:**
- `file` (string): Caminho para o arquivo (ex: `"codex-context/06-inventory.md"`).
- `section` (string): Seção do arquivo a ser atualizada (ex: `"Source modules"`).
- `new_entry` (string): Nova entrada a ser adicionada (ex: `| `src/services/new-feature.js` | New feature implementation. |`).
- `old_entry` (string, opcional): Entrada antiga a ser substituída. Se não fornecido, adiciona `new_entry` ao final da seção.

**Como funciona:**
1. Lê o arquivo com `read`.
2. Localiza a seção `section` no arquivo.
3. Adiciona ou substitui a entrada com `edit`.
4. Pergunta ao usuário se deseja commitar as mudanças com `question`.

**Exemplo de uso:**
```
codex-context-manager:update-context(
  file: "codex-context/06-inventory.md",
  section: "Source modules",
  new_entry: "| `src/services/new-feature.js` | New feature implementation. |"
)
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

### 3. validate-cross-references()
**Objetivo:** Verificar se as **referências cruzadas** entre arquivos `.md` estão consistentes.

**Parâmetros:**
- Nenhum (verifica todos os arquivos em `codex-context/`).

**Como funciona:**
1. Lista todos os arquivos `.md` em `codex-context/` com `glob`.
2. Para cada arquivo, extrai:
   - **Links internos** (ex: `[01-overview.md](codex-context/01-overview.md)`).
   - **Referências a arquivos** (ex: `main.js:13`).
   - **Referências a seções** (ex: `Veja [02-architecture.md](#modules)`).
3. Verifica se:
   - Os arquivos destino dos links existem.
   - As referências a arquivos/linhas existem no código.
   - As seções referenciadas existem nos arquivos `.md`.
4. Gera um relatório com inconsistências.

**Exemplo de uso:**
```
codex-context-manager:validate-cross-references()
```

**Exemplo de saída:**
```markdown
# Relatório de Referências Cruzadas - 06/08/2026

## Links Inválidos
- `[docs/old-guide.md](docs/old-guide.md)` → Arquivo não existe.

## Referências a Código Inválidas
- `main.js:999` → Linha não existe.

## Seções Faltantes
- `#modules` em `02-architecture.md` → Seção não encontrada.
```

---

### 4. sync-with-code()
**Objetivo:** Sincronizar a documentação com o **código-fonte**.

**Parâmetros:**
- Nenhum (sincroniza todos os arquivos em `codex-context/`).

**Como funciona:**
1. Lista todos os arquivos em `src/`, `server/`, `public/`, e `tests/` com `glob`.
2. Compara com as entradas em:
   - `06-inventory.md` (inventário).
   - `02-architecture.md` (módulos).
   - `03-operations.md` (variáveis).
3. Adiciona/remove entradas conforme necessário com `edit`.
4. Pergunta ao usuário se deseja commitar as mudanças com `question`.

**Exemplo de uso:**
```
codex-context-manager:sync-with-code()
```

**Exemplo de saída:**
- `06-inventory.md` atualizado com novos arquivos.
- `02-architecture.md` atualizado com novos módulos.

---

### 5. generate-report(output_file)
**Objetivo:** Gerar um **relatório de sincronização** entre código e documentação.

**Parâmetros:**
- `output_file` (string, opcional): Caminho para salvar o relatório (ex: `"reports/sync-2026-08-06.md"`). Se não fornecido, exibe o relatório no console.

**Como funciona:**
1. Executa `validate-cross-references()`.
2. Executa `sync-with-code()` (sem commitar).
3. Combina os resultados em um **relatório único**.
4. Salva o relatório em `output_file` com `write` ou exibe no console.

**Exemplo de uso:**
```
codex-context-manager:generate-report(output_file: "reports/sync-2026-08-06.md")
```

**Exemplo de saída (em `reports/sync-2026-08-06.md`):**
```markdown
# Relatório de Sincronização - 06/08/2026

## Referências Cruzadas
- Todos os links internos estão válidos.
- Todas as referências a código existem.

## Sincronização com Código
- **Arquivos novos:** `src/services/new-feature.js` (não documentado).
- **Arquivos removidos:** `src/old-feature.js` (ainda documentado).
- **Módulos novos:** `src/services/new-feature.js` (não documentado em 02-architecture.md).

## Sugestões
- Adicionar `src/services/new-feature.js` a `06-inventory.md` e `02-architecture.md`.
- Remover `src/old-feature.js` de `06-inventory.md`.
```

---

## 📌 Exemplos Práticos

### Exemplo 1: Ler um Arquivo do Codex-Context
**Comando:**
```
codex-context-manager:read-context(file: "codex-context/01-overview.md")
```

**Resultado:**
- Exibe o conteúdo de `01-overview.md`.

---

### Exemplo 2: Atualizar o Inventário
**Comando:**
```
codex-context-manager:update-context(
  file: "codex-context/06-inventory.md",
  section: "Source modules",
  new_entry: "| `src/services/new-feature.js` | New feature implementation. |"
)
```

**Resultado:**
- Adiciona `src/services/new-feature.js` à tabela em `06-inventory.md`.

---

### Exemplo 3: Validar Referências Cruzadas
**Comando:**
```
codex-context-manager:validate-cross-references()
```

**Resultado:**
- Relatórios de links inválidos, referências a código inválidas, e seções faltantes.

---

### Exemplo 4: Sincronizar com o Código
**Comando:**
```
codex-context-manager:sync-with-code()
```

**Resultado:**
- Atualiza `06-inventory.md` e `02-architecture.md` com novos arquivos/módulos.

---

## 🛡️ Regras de Segurança
1. **Nunca** ler ou expor `.env`, `config/*.env`, ou qualquer arquivo com segredos.
2. **Sempre** validar com o usuário antes de modificar arquivos (`question`).
3. **Manter** consistência com o código: todas as referências em `.md` devem ser verificáveis.
4. **Não modificar** código da aplicação (apenas documentação).
5. **Fazer backup** antes de sincronizações automáticas.

---

## 📦 Dependências
- **OpenCode** (para ferramentas como `read`, `write`, `edit`, `glob`, `grep`, `question`).
- **Git** (opcional, para referências a commits).

---

## 🎯 Uso Recomendado
- **Para ler documentação:** Use `read-context(file)`.
- **Para atualizar documentação:** Use `update-context(file, section, new_entry)`.
- **Para validar consistência:** Use `validate-cross-references()`.
- **Para sincronizar com o código:** Use `sync-with-code()`.
- **Para gerar relatórios:** Use `generate-report(output_file)`.
