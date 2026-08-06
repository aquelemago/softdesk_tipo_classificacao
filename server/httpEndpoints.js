const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const { getLogFileNameForWeek, ensureLogFileForWeek } = require('../src/utils/logger');
const { broadcastLog } = require('./logBroadcaster');

const LOG_DIR = path.join(__dirname, '../logs');
const MAIN_SCRIPT = path.join(__dirname, '../main.js');

function getCurrentLogFile() {
  return path.join(LOG_DIR, getLogFileNameForWeek());
}

function setupHttpEndpoints(app, wss) {
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
      broadcastLog(wss, '');
    });
  });
}

module.exports = {
  setupHttpEndpoints
};