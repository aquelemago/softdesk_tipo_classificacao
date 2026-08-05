// validate-imports.js - static require() path resolver (no execution)
const fs = require('fs');
const path = require('path');

const external = ['node-fetch','dotenv','ws','node-cron','express','chalk','fs','path','http','child_process','node:test','node:assert/strict','os'];

const files = [
  'main.js',
  'server.js',
  'src/utils/logger.js',
  'src/utils/text.js',
  'src/domain/constants.js',
  'src/services/classification/parser.js',
  'src/services/classification/mapping.js',
  'src/softdesk/retornaChamadosAbertos.js',
  'utils/classificador_openai.js',
  'scripts/listarPrioridades.js',
  'scripts/retornaChamadosSemTipo.js',
  'src/softdeskConfig.js',
  'src/editarChamado.js',
  'src/listarTiposChamado.js',
  'src/softdesk/mensagem.js',
  'tests/classificador_openai.test.js'
];

let fail = 0;
const re = /require\(['"](\.[^'"]+)['"]\)|require\(['"]([^'".][^'"]*)['"]\)/g;

for (const f of files) {
  if (!fs.existsSync(f)) { console.error('MISSING file:', f); fail++; continue; }
  const src = fs.readFileSync(f, 'utf8');
  const dir = path.dirname(f) || '.';
  let m;
  while ((m = re.exec(src)) !== null) {
    const mod = m[1] || m[2];
    if (!mod) continue;
    if (mod.startsWith('.')) {
      const base = mod.replace(/\.js$/, '');
      const cands = [base + '.js', base + '/index.js'];
      const resolved = cands.map(c => path.join(dir, c)).find(p => fs.existsSync(p));
      if (!resolved && cands.some(c => c.endsWith('.js'))) {
        // allow requiring directory (e.g. './src/softdesk/retornaChamadosAbertos')
      }
      if (!resolved) { console.error('FAIL:', f, '->', mod); fail++; }
    } else {
      const top = mod.split('/')[0];
      if (mod.startsWith('node:')) continue;
      if (!external.includes(top)) { console.error('FAIL-ext:', f, '->', mod); fail++; }
    }
  }
}
console.log(fail === 0 ? 'validate-imports: PASS (0 broken)' : 'validate-imports: FAIL (' + fail + ' broken)');
process.exit(fail === 0 ? 0 : 1);
