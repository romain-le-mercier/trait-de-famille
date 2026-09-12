#!/usr/bin/env node
// Garde dev (dossier projet). Protège la partie PM de .pilotage/ et impose le ticket.
// Sortie 2 + stderr = refus.
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', run);

function deny(msg) { process.stderr.write(`[dev-guard] ${msg}`); process.exit(2); }
function norm(p) { return String(p).replace(/\\/g, '/'); }

function run() {
  const j = JSON.parse(input || '{}');
  const root = norm(process.env.CLAUDE_PROJECT_DIR || j.cwd || process.cwd());
  const tool = j.tool_name, ti = j.tool_input || {};
  const PM_ONLY = /\.pilotage\/(ROADMAP\.md|KPIS\.md|tickets\/(todo|done)\/)/;

  if (['Write', 'Edit', 'MultiEdit'].includes(tool)) {
    let f = norm(ti.file_path || '');
    if (f.startsWith(root + '/')) f = f.slice(root.length + 1);
    if (PM_ONLY.test(f)) deny(`"${f}" appartient au PM. Un dev écrit dans tickets/doing/, tickets/review/ et journal.md. Si le ticket est faux ou incomplet, dis-le dans sa section "Retour dev" (ticket en doing/ ou review/), jamais dans la roadmap.`);
    if (/\.pilotage\/journal\.md$/.test(f) && tool === 'Write') deny('journal.md est append-only : utilise Edit pour ajouter une ligne en fin de fichier, jamais Write.');
    process.exit(0);
  }

  if (tool === 'Bash') {
    const cmd = String(ti.command || '');
    if (/\b(rm|unlink)\b[^|;&]*\.pilotage\//.test(cmd)) deny('Suppression refusée dans .pilotage/. Un ticket se déplace (git mv), il ne se supprime jamais.');
    const mv = cmd.match(/git\s+(-C\s+\S+\s+)?mv\s+([^|;&]+)/) || cmd.match(/\bmv\s+([^|;&]+)/);
    if (mv) {
      const args = mv[mv.length - 1];
      const fromTodo = /tickets\/todo\//.test(args), toDoing = /tickets\/doing\//.test(args);
      const fromDoing = /tickets\/doing\//.test(args), toReview = /tickets\/review\//.test(args);
      const touchesDone = /tickets\/done\//.test(args);
      const touchesPilotage = /\.pilotage\//.test(args);
      if (touchesPilotage && !((fromTodo && toDoing) || (fromDoing && toReview)) ) deny('Déplacements autorisés pour un dev : todo/ → doing/ (prise) et doing/ → review/ (livraison). done/ et le retour en todo/ sont réservés au PM.');
      if (touchesDone) deny('done/ est réservé au PM.');
    }
    if (/(^|[^>])>(?!\s*\/dev\/null)[^|;&]*\.pilotage\/(ROADMAP|KPIS|tickets\/(todo|done))/.test(cmd)) deny('Écriture shell refusée sur la partie PM de .pilotage/.');
    const commit = cmd.match(/git\s+(-C\s+\S+\s+)?commit\b[^|;&]*/);
    if (commit && !/\bT-\d{3}\b/.test(commit[0]) && !/--amend|--no-edit|-F\s|-t\s/.test(commit[0]))
      deny('Message de commit sans identifiant de ticket. Format : "T-042: <résumé>". Pas de ticket = pas de commit.');
    if (/git\s+push\b[^|;&]*(--force\b|-f\b)/.test(cmd) || /git\s+reset\s+--hard/.test(cmd)) deny('push --force et reset --hard refusés.');
    process.exit(0);
  }
  process.exit(0);
}
