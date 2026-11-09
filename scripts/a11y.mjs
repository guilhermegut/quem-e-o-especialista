// Auditoria de acessibilidade (axe-core, regras WCAG 2 A/AA) nas telas principais, nos modos claro e escuro.
// Uso: node scripts/a11y.mjs <arquivo.html> <pasta-capturas>
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
const [file, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const axeSrc = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const total = {};
for (const scheme of ['light', 'dark']) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 860 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.goto('file://' + path.resolve(file)); await sleep(1500);
  const click = (sel, t) => page.evaluate((sel, t) => { const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(t) && !e.disabled); el?.click(); return !!el; }, sel, t);
  const audit = async (nome) => {
    await page.evaluate(axeSrc);
    const r = await page.evaluate(async () => {
      const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
      return res.violations.map((v) => ({ id: v.id, n: v.nodes.length, ex: v.nodes.slice(0, 3).map((n) => (n.failureSummary || '').split('\n').slice(1, 2).join(' ').slice(0, 140) + ' @ ' + n.target.join(' ')) }));
    });
    await page.screenshot({ path: path.join(out, `${scheme}-${nome}.png`) });
    for (const v of r) { const k = `${scheme} ${nome} ${v.id}`; total[k] = v; }
    console.log(`${scheme.padEnd(5)} ${nome.padEnd(22)} ${r.length ? r.map((v) => `${v.id}(${v.n})`).join(' ') : 'ok'}`);
  };
  await audit('menu');
  await click('button', 'Como jogar'); await sleep(300); await audit('como-jogar');
  await click('button', 'Voltar'); await sleep(200);
  await click('button', 'Sobre e créditos'); await sleep(300); await audit('sobre');
  await click('button', 'Voltar'); await sleep(200);
  await click('button', 'Duelar com um amigo'); await sleep(300); await click('button', 'Criar partida de duelo'); await sleep(300); await audit('nivel');
  await click('button', 'Voltar'); await sleep(200); await click('button', 'Voltar'); await sleep(200);
  for (const mod of ['Mapa', 'Bandeiras', 'Mundo hoje', 'Cultura', 'Guerras']) {
    await click('button', 'Treinar um módulo'); await sleep(300);
    await click('button.escolha', mod); await sleep(300);
    const slug = mod.split(' ')[0].toLowerCase();
    await sleep(1500);
    if (mod === 'Mapa' || mod === 'Cultura') await audit(`vinheta-${slug}`);
    await click('button', 'Começar'); await sleep(900);
    await audit(`${slug}-pergunta`);
    if (await page.$('.rodada-mapa')) {
      const b = await (await page.$('.mapa canvas')).boundingBox();
      await page.mouse.click(b.x + b.width * 0.5, b.y + b.height * 0.4); await sleep(200);
      await click('button', 'Confirmar posição'); await sleep(1800);
    } else if (await page.$('.quiz-pares')) {
      for (const l of await page.$$('.quiz-par-opcoes')) (await l.$$('.lado-botao'))[0].click();
      await sleep(100); await click('button', 'Confirmar'); await sleep(500);
    } else if (await page.$('.lado-escolha')) {
      for (const l of await page.$$('.lado-escolha')) (await l.$$('.lado-botao'))[0].click();
      await sleep(100); await click('button', 'Confirmar'); await sleep(500);
    } else {
      const o = await page.$$('.opcao, .dupla'); await o[Math.min(1, o.length - 1)].click(); await sleep(600);
    }
    await audit(`${slug}-revelacao`);
    await click('button', 'Sair'); await sleep(250); await click('button', 'perder'); await sleep(400); if (!(await page.$('.menu'))) await click('button', 'Voltar'); await sleep(200);
  }
  await page.close();
}
await browser.close();
fs.writeFileSync(path.join(out, 'violacoes.json'), JSON.stringify(total, null, 1));
console.log('total de violações distintas:', Object.keys(total).length);
