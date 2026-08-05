const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function getWeekInterval(date = new Date()) {
  const day = date.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { monday, sunday };
}

function formatDate(d) {
  return d.toLocaleDateString('pt-BR').split('/').reverse().join('-');
}

function getLogFileNameForWeek(date = new Date()) {
  const { monday, sunday } = getWeekInterval(date);
  return `log-chamados-${formatDate(monday)}_${formatDate(sunday)}.txt`;
}

function cleanOldLogs(logDir) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  fs.readdirSync(logDir).forEach(file => {
    if (!file.startsWith('log-chamados-') || !file.endsWith('.txt')) {
      return;
    }

    const match = file.match(/log-chamados-(\d{2}-\d{2}-\d{4})_/);
    if (!match) {
      return;
    }

    const [, month, year] = match[1].split('-').map(Number);
    if (year < currentYear || (year === currentYear && month - 1 < currentMonth)) {
      fs.unlinkSync(path.join(logDir, file));
    }
  });
}

function ensureLogFileForWeek(logDir, date = new Date()) {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const fileName = getLogFileNameForWeek(date);
  const filePath = path.join(logDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }

  return filePath;
}

const LOG_DIR = path.join(__dirname, '../../logs');
let LOG_FILE = ensureLogFileForWeek(LOG_DIR);

function log(message, type = 'info') {
  const now = new Date();
  const timestamp = `[${now.toLocaleString('pt-BR')}]`;
  let color = chalk.gray;
  if (type === 'error') color = chalk.red;
  if (type === 'success') color = chalk.green;
  if (type === 'warn') color = chalk.yellow;

  const line = `${timestamp}\n  ${message}`;
  LOG_FILE = ensureLogFileForWeek(LOG_DIR);
  fs.appendFileSync(LOG_FILE, line + '\n');

  if (typeof color === 'function') {
    console.log(color(line));
  } else {
    console.log(line);
  }
}

function logSeparator() {
  log('-'.repeat(80));
}

function initLogger() {
  cleanOldLogs(LOG_DIR);
}

module.exports = { log, logSeparator, ensureLogFileForWeek, cleanOldLogs, getLogFileNameForWeek, initLogger };
