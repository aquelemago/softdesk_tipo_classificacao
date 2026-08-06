const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const { log } = require('../src/utils/logger');

const MAIN_SCRIPT = path.join(__dirname, '../main.js');

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

function setupCronJobs() {
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
}

module.exports = {
  setupCronJobs
};