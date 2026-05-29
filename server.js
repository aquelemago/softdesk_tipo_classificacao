const express = require('express');
require('dotenv').config({ quiet: true });

const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const cron = require('node-cron');
const { getLogFileNameForWeek, ensureLogFileForWeek, log } = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const LOG_DIR = path.join(__dirname, 'logs');
const MAIN_SCRIPT = path.join(__dirname, 'main.js');

function getCurrentLogFile() {
  return path.join(LOG_DIR, getLogFileNameForWeek());
}

ensureLogFileForWeek(LOG_DIR);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function executarMainAutomatico(limit = 50) {
  return new Promise((resolve, reject) => {
    const node = spawn('node', [MAIN_SCRIPT, limit]);

    node.stdout.on('data', (data) => {
      console.log(`[AUTO] ${data}`);
    });

    node.stderr.on('data', (data) => {
      console.error(`[AUTO ERROR] ${data}`);
    });

    node.on('close', (code) => {
      if (code === 0) {
        console.log(`[AUTO] Execucao automatica concluida com sucesso (codigo: ${code})`);
        resolve(code);
        return;
      }

      console.error(`[AUTO] Execucao automatica falhou (codigo: ${code})`);
      reject(new Error(`Processo finalizado com codigo ${code}`));
    });

    node.on('error', (error) => {
      console.error(`[AUTO] Erro ao executar processo: ${error.message}`);
      reject(error);
    });
  });
}

const AUTO_SCHEDULE_ENABLED = process.env.AUTO_SCHEDULE_ENABLED !== 'false';
const AUTO_SCHEDULE_LIMIT = parseInt(process.env.AUTO_SCHEDULE_LIMIT, 10) || 50;

if (AUTO_SCHEDULE_ENABLED) {
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log(`[AUTO] Iniciando execucao automatica programada (limite: ${AUTO_SCHEDULE_LIMIT})`);
      log('Execucao automatica iniciada (agendamento a cada 15 minutos)');

      await executarMainAutomatico(AUTO_SCHEDULE_LIMIT);

      console.log('[AUTO] Execucao automatica concluida com sucesso');
      log('Execucao automatica concluida com sucesso');
    } catch (error) {
      console.error(`[AUTO] Erro na execucao automatica: ${error.message}`);
      log(`Erro na execucao automatica: ${error.message}`, 'error');
    }
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
  });

  console.log(`[AUTO] Agendamento automatico ativado - executando a cada 15 minutos (limite: ${AUTO_SCHEDULE_LIMIT})`);
  log('Agendamento automatico ativado - executando a cada 15 minutos');
} else {
  console.log('[AUTO] Agendamento automatico desabilitado');
  log('Agendamento automatico desabilitado');
}

app.post('/run-main', (req, res) => {
  const limit = parseInt(req.body.limit, 10) || 50;
  const node = spawn('node', [MAIN_SCRIPT, limit]);

  node.on('close', (code) => {
    res.json({ status: 'finished', code });
  });
});

app.post('/clear-logs', (req, res) => {
  const logFile = getCurrentLogFile();
  fs.writeFile(logFile, '', (err) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao limpar log.' });
      return;
    }

    res.json({ status: 'ok' });
    broadcastLog('');
  });
});

function broadcastLog(logText) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'log', log: logText }));
    }
  });
}

wss.on('connection', (ws) => {
  const logFile = getCurrentLogFile();
  fs.readFile(logFile, 'utf8', (err, data) => {
    ws.send(JSON.stringify({ type: 'log', log: data || '' }));
  });
});

let lastLog = '';
let currentLogFile = getCurrentLogFile();
let watcher = null;

function startLogWatcher() {
  if (watcher) watcher.close();
  currentLogFile = getCurrentLogFile();
  lastLog = '';
  watcher = fs.watch(currentLogFile, (eventType) => {
    if (eventType === 'change') {
      fs.readFile(currentLogFile, 'utf8', (err, data) => {
        if (!err && data !== lastLog) {
          lastLog = data;
          broadcastLog(data);
        }
      });
    }
  });
}

setInterval(() => {
  const logFileNow = getCurrentLogFile();
  if (logFileNow !== currentLogFile) {
    startLogWatcher();
  }
}, 60 * 1000);

startLogWatcher();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`[AUTO] Status do agendamento: ${AUTO_SCHEDULE_ENABLED ? 'ATIVO' : 'DESABILITADO'}`);
});
