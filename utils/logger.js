const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Função para obter o intervalo da semana (segunda a domingo) de uma data
function getWeekInterval(date = new Date()) {
  // Ajusta para segunda-feira
  const day = date.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0,0,0,0);

  // Domingo da mesma semana
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { monday, sunday };
}

// Função para formatar data dd-mm-yyyy
function formatDate(d) {
  return d.toLocaleDateString('pt-BR').split('/').reverse().join('-');
}

// Função para gerar o nome do arquivo de log da semana
function getLogFileNameForWeek(date = new Date()) {
  const { monday, sunday } = getWeekInterval(date);
  return `log-chamados-${formatDate(monday)}_${formatDate(sunday)}.txt`;
}

// Função para excluir logs de meses anteriores
function cleanOldLogs(logDir) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  fs.readdirSync(logDir).forEach(file => {
    if (file.startsWith('log-chamados-') && file.endsWith('.txt')) {
      // Extrai a data inicial do nome do arquivo
      const match = file.match(/log-chamados-(\d{2}-\d{2}-\d{4})_/);
      if (match) {
        const [day, month, year] = match[1].split('-').map(Number);
        if (year < currentYear || (year === currentYear && month - 1 < currentMonth)) {
          fs.unlinkSync(path.join(logDir, file));
        }
      }
    }
  });
}

// Função para garantir que o arquivo da semana exista
function ensureLogFileForWeek(logDir, date = new Date()) {
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const fileName = getLogFileNameForWeek(date);
  const filePath = path.join(logDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }
  return filePath;
}

// Logger principal
const LOG_DIR = path.join(__dirname, '../logs');
let LOG_FILE = ensureLogFileForWeek(LOG_DIR);

function log(message, type = 'info') {
  const now = new Date();
  const timestamp = `[${now.toLocaleString('pt-BR')}]`;
  let color = chalk.gray;
  if (type === 'error') color = chalk.red;
  if (type === 'success') color = chalk.green;
  if (type === 'warn') color = chalk.yellow;
  const line = `${timestamp}\n  ${message}`;
  // Atualiza o arquivo da semana se mudou
  LOG_FILE = ensureLogFileForWeek(LOG_DIR);
  fs.appendFileSync(LOG_FILE, line + '\n');
  if (typeof color === 'function') {
    console.log(color(line));
  } else {
    console.log(line);
  }
}

function logSeparator() {
  const sep = '-'.repeat(80);
  log(sep);
}

function stripHtml(html) {
  return String(html).replace(/<[^>]+>/g, '');
}

// Limpeza automática de logs antigos ao carregar o módulo
cleanOldLogs(LOG_DIR);

// Log de teste para garantir que está funcionando
// log('Log de teste automático: logger inicializado e escrevendo no arquivo da semana.');

module.exports = { log, logSeparator, stripHtml, ensureLogFileForWeek, cleanOldLogs, getLogFileNameForWeek }; 