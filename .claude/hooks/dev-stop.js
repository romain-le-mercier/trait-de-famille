#!/usr/bin/env node
// Hook Stop dev : un ticket en doing/ sans ligne datée d'aujourd'hui dans journal.md → rappel, une seule fois.
const fs = require('fs'), path = require('path');
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', run);

function run() {
  const j = JSON.parse(input || '{}');
  if (j.stop_hook_active) process.exit(0);
  const root = process.env.CLAUDE_PROJECT_DIR || j.cwd || process.cwd();
  const doing = path.join(root, '.pilotage', 'tickets', 'doing');
  if (!fs.existsSync(doing)) process.exit(0);
  const tickets = fs.readdirSync(doing).filter(f => /^T-\d{3}.*\.md$/.test(f));
  if (!tickets.length) process.exit(0);
  const jp = path.join(root, '.pilotage', 'journal.md');
  const today = new Date().toISOString().slice(0, 10);
  const journal = fs.existsSync(jp) ? fs.readFileSync(jp, 'utf8') : '';
  const ids = tickets.map(t => t.slice(0, 5));
  const missing = ids.filter(id => !new RegExp(`^\\|?\\s*${today}[^\\n]*${id}`, 'm').test(journal));
  if (!missing.length) process.exit(0);
  process.stderr.write(`[dev-stop] Ticket(s) ${missing.join(', ')} en doing/ sans ligne datée d'aujourd'hui dans .pilotage/journal.md. Avant de t'arrêter : ajoute une ligne "| ${today} | T-xxx | fait / bloqué / abandonné | commit | chiffre |" et, si le travail est livré, déplace le ticket vers review/ avec la section "Retour dev" remplie.`);
  process.exit(2);
}
