const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { getLogFileNameForWeek, ensureLogFileForWeek } = require('../src/utils/logger');

const LOG_DIR = path.join(__dirname, '../logs');

function getCurrentLogFile() {
  return path.join(LOG_DIR, getLogFileNameForWeek());
}

function broadcastLog(wss, logText) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'log', log: logText }));
    }
  });
}

function setupWebSocketServer(wss) {
  wss.on('connection', (ws) => {
    const logFile = getCurrentLogFile();
    fs.readFile(logFile, 'utf8', (err, data) => {
      ws.send(JSON.stringify({ type: 'log', log: data || '' }));
    });
  });
}

function startLogWatcher(wss) {
  let lastLog = '';
  let currentLogFile = getCurrentLogFile();
  let watcher = null;

  function updateWatcher() {
    if (watcher) watcher.close();
    currentLogFile = getCurrentLogFile();
    lastLog = '';
    watcher = fs.watch(currentLogFile, (eventType) => {
      if (eventType === 'change') {
        fs.readFile(currentLogFile, 'utf8', (err, data) => {
          if (!err && data !== lastLog) {
            lastLog = data;
            broadcastLog(wss, data);
          }
        });
      }
    });
  }

  updateWatcher();

  setInterval(() => {
    const logFileNow = getCurrentLogFile();
    if (logFileNow !== currentLogFile) {
      updateWatcher();
    }
  }, 60 * 1000);
}

module.exports = {
  broadcastLog,
  setupWebSocketServer,
  startLogWatcher
};