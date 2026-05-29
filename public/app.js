const logContainer = document.getElementById('log-container');
const runMainBtn = document.getElementById('run-main');
const clearLogsBtn = document.getElementById('clear-logs');
const limitInput = document.getElementById('limit');
const loader = document.getElementById('loader');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

// WebSocket para logs em tempo real
let ws = null;

function connectWebSocket() {
  const ws = new WebSocket(`ws://${window.location.host}`);
  ws.onopen = () => {
    console.log('WebSocket conectado');
    statusText.textContent = '🟢 Conectado';
  };
  
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'log') {
      renderLogs(msg.log);
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket desconectado');
    statusText.textContent = '🔴 Desconectado';
    // Tentar reconectar após 5 segundos
    setTimeout(connectWebSocket, 5000);
  };
  
  ws.onerror = (error) => {
    console.error('Erro no WebSocket:', error);
    statusText.textContent = '🔴 Erro de conexão';
  };
}

// Conectar WebSocket
connectWebSocket();

function renderLogs(logText) {
  logContainer.innerHTML = '';
  if (!logText) return;
  const lines = logText.split(/\r?\n/);
  for (let line of lines) {
    if (!line.trim()) continue;
    const div = document.createElement('div');
    div.className = 'log-line ' + getLogClass(line);
    div.textContent = line;
    logContainer.appendChild(div);
  }
  logContainer.scrollTop = logContainer.scrollHeight;
}

function getLogClass(line) {
  if (line.includes('❌') || line.toLowerCase().includes('erro')) return 'error';
  if (line.includes('✅') || line.toLowerCase().includes('sucesso')) return 'success';
  if (line.includes('🚀') || line.includes('🏁')) return 'info';
  if (line.includes('🤖') || line.includes('Classificação IA')) return 'ia-suggested';
  return '';
}

function showLoader() {
  loader.classList.add('show');
  statusIndicator.classList.add('show', 'running');
  statusText.textContent = '🔄 Processando...';
}

function hideLoader() {
  loader.classList.remove('show');
  statusIndicator.classList.remove('show', 'running');
  statusIndicator.classList.add('idle');
  // Não sobrescrever o status do WebSocket se estiver conectado
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    statusText.textContent = '⏸️ Sistema ocioso';
  }
}

function disableControls() {
  runMainBtn.disabled = true;
  clearLogsBtn.disabled = true;
  limitInput.disabled = true;
  runMainBtn.textContent = '⏳ Processando...';
}

function enableControls() {
  runMainBtn.disabled = false;
  clearLogsBtn.disabled = false;
  limitInput.disabled = false;
  runMainBtn.textContent = '▶️ Executar Classificação';
}

runMainBtn.onclick = async () => {
  showLoader();
  disableControls();
  
  const limit = parseInt(limitInput.value, 10) || 50;
  
  try {
    await fetch('/run-main', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit })
    });
  } catch (error) {
    console.error('Erro ao executar:', error);
  } finally {
    // Aguarda um pouco para mostrar o resultado
    setTimeout(() => {
      hideLoader();
      enableControls();
    }, 4000);
  }
};

clearLogsBtn.onclick = async () => {
  if (runMainBtn.disabled) return; // Não permite limpar durante execução
  
  try {
    await fetch('/clear-logs', { method: 'POST' });
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
  }
};

// Inicializar status
hideLoader(); 