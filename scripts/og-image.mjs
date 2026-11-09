import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
const cores = ['#0071e3', '#e0245e', '#157a33', '#8e3fd0', '#b84a00'];
const nomes = ['Mapa', 'Bandeiras', 'Mundo hoje', 'Cultura', 'Guerras'];
const cx = 960, cy = 300, R = 190, r = 120;
const seg = (i) => {
  const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + 0.04, a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / 5 - 0.04;
  const p = (rad, a) => `${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
  return `<path d="M ${p(R, a0)} A ${R} ${R} 0 0 1 ${p(R, a1)} L ${p(r, a1)} A ${r} ${r} 0 0 0 ${p(r, a0)} Z" fill="${cores[i]}"/>`;
};
let x = 80;
const chips = nomes.map((n, i) => {
  const w = 26 + n.length * 15.5;
  const s = `<rect x="${x}" y="470" width="${w}" height="52" rx="26" fill="${cores[i]}"/><text x="${x + w / 2}" y="504" text-anchor="middle" font-family="Inter" font-weight="600" font-size="24" fill="#fff">${n}</text>`;
  x += w + 12; return s;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f5f5f7"/>
${[0,1,2,3,4].map(seg).join('')}
<circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="#ffffff"/>
<text x="${cx}" y="${cy - 8}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="30" fill="#1d1d1f">Estagiário</text>
<text x="${cx}" y="${cy + 30}" text-anchor="middle" font-family="Inter" font-weight="500" font-size="22" fill="#6e6e73">depois</text>
<text x="${cx}" y="${cy + 66}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="30" fill="#1d1d1f">Prime</text>
<text x="80" y="150" font-family="Inter" font-weight="600" font-size="26" letter-spacing="3" fill="#6e6e73">DESAFIO DIÁRIO</text>
<text x="80" y="250" font-family="Inter" font-weight="800" font-size="92" fill="#1d1d1f">Quem é o</text>
<text x="80" y="352" font-family="Inter" font-weight="800" font-size="92" fill="#1d1d1f">Especialista</text>
<text x="80" y="420" font-family="Inter" font-weight="500" font-size="30" fill="#424245">Cinco minutos por nível. Desafie os amigos.</text>
${chips}
</svg>`;
const png = new Resvg(svg, { font: { fontDirs: ['/usr/share/fonts/opentype/inter'], loadSystemFonts: false, defaultFontFamily: 'Inter' } }).render().asPng();
fs.writeFileSync(process.argv[2], png);
console.log(png.length);
