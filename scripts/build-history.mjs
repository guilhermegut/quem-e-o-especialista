// Pipeline de história do GeoDuelo: guerras (Correlates of War) e eventos datados (guerras e independências).
// Gera src/data/wars.json, src/data/events.json e docs/verificacao/historia.md. Rodar: node scripts/build-history.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'latin1');
const CUR = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curated/guerras-pt.json'), 'utf8'));
const FACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw/factbook-independencia.json'), 'utf8'));
const COUNTRIES = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/countries.json'), 'utf8'));
const COUNTRY = new Map(COUNTRIES.map((c) => [c.cc, c]));

// CSV com quebra de linha CR (formato original do COW) e campos entre aspas
function parseCSV(text) {
  const rows = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; continue; }
    if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\r' || ch === '\n') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some((x) => x !== '')) rows.push(row); row = []; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}
const num = (v) => (/^-?\d+$/.test(v) ? Number(v) : NaN);

const REGION = { 1: 'Américas', 2: 'Europa', 4: 'África', 6: 'Oriente Médio', 7: 'Ásia', 9: 'Oceania' };
// Seleção editorial para o nível Observador: guerras recentes muito citadas com menos de 50 mil mortes em combate.
const FAMOSAS = new Set(['i148', 'i155', 'i169', 'i175', 'i181', 'i202', 'i211', 'i221', 'i225', 'i227', 'x466', 'c877']);
// Prefixos de identificador: i = entre Estados, c = civil (intra-estatal), x = extra-estatal
const PREFIX = { inter: 'i', intra: 'c', extra: 'x' };

function statePt(name, year, side, warnum) {
  let n = CUR.estados[name];
  if (!n) return null;
  if (n === 'Turquia' && year < 1923) n = 'Império Otomano';
  if (n === 'Rússia' && year < 1917) n = 'Império Russo';
  else if (n === 'Rússia' && year < 1922) n = 'Rússia soviética';
  else if (n === 'Rússia' && year < 1992) n = 'URSS';
  if (n === 'Alemanha' && year < 1871) n = 'Prússia';
  if (n === 'Itália' && year < 1861) n = 'Reino da Sardenha';
  if (n === 'Iugoslávia' && year < 1918) n = 'Sérvia';
  if (n === 'Vietnã' && year < 1976) n = 'Vietnã do Norte';
  if (n === 'Irã' && year < 1935) n = 'Pérsia';
  if (n === 'França' && warnum === 139 && side === 2) n = 'França de Vichy';
  return n;
}

const wars = [];
const problems = [];

function build(kind, file) {
  const rows = parseCSV(read(`data/raw/cow/${file}`));
  const cur = CUR[kind];
  for (const [wn, meta] of Object.entries(cur)) {
    const rs = rows.filter((r) => r.WarNum === wn);
    if (!rs.length) { problems.push(`${kind} ${wn} não existe no CSV`); continue; }
    const starts = rs.map((r) => ({ y: num(r.StartYear1), m: num(r.StartMonth1), d: num(r.StartDay1) })).filter((s) => s.y > 0).sort((a, b) => a.y - b.y || a.m - b.m || a.d - b.d);
    const endKeys = Object.keys(rs[0]).filter((k) => /^EndYear\d$/.test(k));
    const ends = rs.flatMap((r) => endKeys.map((k) => num(r[k]))).filter((y) => y > 0);
    const ongoing = rs.some((r) => endKeys.some((k) => num(r[k]) === -7));
    const start = starts[0];
    const end = ongoing ? null : Math.max(...ends);
    const wheres = [...new Set(rs.map((r) => num(r.WhereFought)))];
    const where = wheres.length === 1 ? wheres[0] : -1;
    let deaths = 0;
    let participants = [];
    if (kind === 'inter') {
      for (const r of rs) {
        const n = statePt(r.StateName, num(r.StartYear1), num(r.Side), Number(wn));
        if (!n) { problems.push(`Estado sem tradução: ${r.StateName}`); continue; }
        const bd = num(r.BatDeath);
        if (bd > 0) deaths += bd;
        participants.push({ n, side: num(r.Side), outcome: num(r.Outcome), deaths: bd > 0 ? bd : null });
      }
    } else {
      for (const r of rs) {
        const ds = kind === 'intra' ? [num(r.SideADeaths), num(r.SideBDeaths)] : [num(r.BatDeath), num(r.NonStateDeaths)];
        // Linhas de participantes repetem as mortes da guerra no COW Intra; conta a maior linha.
        deaths = Math.max(deaths, ds.filter((x) => x > 0).reduce((a, b) => a + b, 0));
        const a = statePt(r.SideA, num(r.StartYear1), 1, 0);
        const b = statePt(r.SideB, num(r.StartYear1), 2, 0);
        if (a) participants.push({ n: a, side: 1, outcome: num(r.Outcome), deaths: null });
        if (b) participants.push({ n: b, side: 2, outcome: num(r.Outcome) === 1 ? 2 : num(r.Outcome) === 2 ? 1 : num(r.Outcome), deaths: null });
      }
    }
    // um registro por Estado e lado
    const seen = new Set();
    participants = participants.filter((p) => { const k = `${p.n}|${p.side}`; if (seen.has(k)) return false; seen.add(k); return true; });
    const sides = [1, 2].map((s) => participants.filter((p) => p.side === s).map((p) => p.n));
    const bilateral = sides[0].length === 1 && sides[1].length === 1 && new Set(participants.map((p) => p.n)).size === 2;
    const all = new Set(participants.map((p) => p.n));
    const lusofono = all.has('Brasil') || all.has('Portugal');
    const id = `${PREFIX[kind]}${wn}`;
    const tier = deaths >= 50000 || lusofono || FAMOSAS.has(id) ? 1 : deaths >= 5000 || kind !== 'inter' ? 2 : 3;
    wars.push({
      id, kind, num: Number(wn), n: meta.n,
      ini: { y: start.y, m: start.m > 0 ? start.m : null, d: start.d > 0 ? start.d : null },
      fim: end, iniOk: meta.ini !== false, fimOk: meta.fim !== false && end !== null,
      reg: REGION[where] ?? 'vários continentes', regOk: Boolean(REGION[where]),
      deaths: deaths || null, sides, bilateral, tier, nota: meta.nota ?? null,
      winners: kind === 'inter' ? [...new Set(participants.filter((p) => p.outcome === 1).map((p) => p.n))] : [],
    });
  }
}
build('inter', 'Inter-StateWarData_v4.0.csv');
build('intra', 'Intra-StateWarData_v4.1.csv');
build('extra', 'Extra-StateWarData_v4.0.csv');
wars.sort((a, b) => a.ini.y - b.ini.y);

// ---------- Eventos ----------
const events = [];
for (const w of wars) {
  if (w.iniOk) events.push({ id: `${w.id}s`, y: w.ini.y, m: w.ini.m, d: w.ini.d, titulo: w.n, sub: 'começa', grupo: w.id, tier: w.tier, fonte: 'cow' });
  if (w.fimOk && w.fim > w.ini.y) events.push({ id: `${w.id}e`, y: w.fim, m: null, d: null, titulo: w.n, sub: 'termina', grupo: w.id, tier: w.tier, fonte: 'cow' });
}
const MONTHS = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
const RE = /^(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4}) \((?:declared independence )?from (?:the )?([^);]+)\)/;
let indep = 0;
for (const [cc, v] of Object.entries(FACT.paises)) {
  const c = COUNTRY.get(cc);
  if (!c || !c.un) continue;
  const m = v.independencia.match(RE);
  if (!m) continue;
  const from = m[4].trim();
  const met = CUR.metropoles[from];
  const sub = /trusteeship/i.test(from) ? 'independência, fim da tutela da ONU' : met ? `independência em relação ${met}` : 'independência';
  events.push({ id: `ind${cc}`, y: Number(m[3]), m: MONTHS[m[2]], d: Number(m[1]), titulo: c.n, sub, grupo: `ind${cc}`, tier: c.known ? 1 : 2, fonte: 'factbook' });
  indep++;
}
events.sort((a, b) => a.y - b.y || (a.m ?? 0) - (b.m ?? 0) || (a.d ?? 0) - (b.d ?? 0));

if (problems.length) throw new Error(problems.join('\n'));
const OUT = path.join(ROOT, 'src/data');
fs.writeFileSync(path.join(OUT, 'wars.json'), JSON.stringify(wars));
fs.writeFileSync(path.join(OUT, 'events.json'), JSON.stringify(events));

const t = (k) => wars.filter((w) => w.tier <= k).length;
const lines = [
  '# História no GeoDuelo: guerras e linha do tempo',
  '',
  `Gerado por scripts/build-history.mjs em ${new Date().toISOString().slice(0, 10)}.`,
  '',
  '## Fontes',
  '',
  '- Correlates of War: Inter-State War Data v4.0, Intra-State War Data v4.1 e Extra-State War Data v4.0 (Sarkees e Wayman, Resort to War, CQ Press, 2010). Arquivos em data/raw/cow, obtidos de cópia pública no GitHub (jenna-jordan/international-relations-database) e conferidos pelo tamanho em bytes publicado em correlatesofwar.org (31.698; 54.987; 23.068). Uso livre para fins públicos e acadêmicos com citação.',
  `- CIA World Factbook, campo Independence, via github.com/factbook/factbook.json (${FACT._fonte.split(',')[1].trim()}). Domínio público.`,
  '',
  '## Guerras',
  '',
  `${wars.length} guerras: ${wars.filter((w) => w.kind === 'inter').length} entre Estados, ${wars.filter((w) => w.kind === 'intra').length} civis e ${wars.filter((w) => w.kind === 'extra').length} coloniais ou contra atores não estatais. Nomes em português: tradução editorial em data/curated/guerras-pt.json.`,
  '',
  `Níveis: Observador ${t(1)} guerras (50 mil+ mortes em combate, ou com Brasil ou Portugal, mais uma seleção editorial de guerras recentes muito citadas: ${wars.filter((w) => FAMOSAS.has(w.id)).map((w) => w.n).join(', ')}); Analista ${t(2)} (acrescenta 5 mil+ mortes e todas as civis e coloniais selecionadas); Estrategista ${t(3)}.`,
  '',
  'Guerras cujo início ou fim no COW diverge da periodização usual ficam fora das perguntas de ano e da linha do tempo naquele marco: ' +
    wars.filter((w) => !w.iniOk || (!w.fimOk && w.fim)).map((w) => `${w.n} (${!w.iniOk ? 'início' : ''}${!w.iniOk && !w.fimOk ? ' e ' : ''}${!w.fimOk ? 'fim' : ''})`).join('; ') + '.',
  '',
  '| Guerra | Início | Fim | Região | Mortes em combate (COW) | Nível |',
  '| --- | --- | --- | --- | --- | --- |',
  ...wars.map((w) => `| ${w.n} | ${w.ini.y} | ${w.fim ?? 'em curso em 2007'} | ${w.reg} | ${w.deaths ? w.deaths.toLocaleString('pt-BR') : 'sem dado'} | ${w.tier} |`),
  '',
  '## Linha do tempo',
  '',
  `${events.length} eventos: ${events.filter((e) => e.fonte === 'cow').length} de início ou fim de guerra e ${indep} independências de membros da ONU com data e metrópole claras no Factbook.`,
  '',
];
fs.writeFileSync(path.join(ROOT, 'docs/verificacao/historia.md'), lines.join('\n'));
console.log(`guerras ${wars.length} (obs ${t(1)}, ana ${t(2)}, est ${t(3)}), bilaterais ${wars.filter((w) => w.bilateral).length}, eventos ${events.length} (independências ${indep})`);
