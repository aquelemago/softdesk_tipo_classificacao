const express = require('express');
require('dotenv').config({ quiet: true });

const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { ensureLogFileForWeek, initLogger } = require('./src/utils/logger');
const { setupHttpEndpoints } = require('./server/httpEndpoints');
const { setupCronJobs } = require('./server/cron');
const { setupWebSocketServer, startLogWatcher } = require('./server/logBroadcaster');

// Initialize logger (cleans old logs)
initLogger();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const LOG_DIR = path.join(__dirname, 'logs');

ensureLogFileForWeek(LOG_DIR);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

setupHttpEndpoints(app, wss);
setupCronJobs();
setupWebSocketServer(wss);
startLogWatcher(wss);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
