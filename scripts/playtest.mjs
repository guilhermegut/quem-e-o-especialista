// Joga uma partida completa no Chrome headless e salva capturas das telas.
// Uso: node scripts/playtest.mjs <arquivo.html> <pasta-saida> [nivel] [largura] [altura]
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const [file, outDir, level = 'Estagiário', W = '1440', H = '900', boa = ''] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: +W, height: +H, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(/^https?:/.test(file) ? file : 'file://' + path.resolve(file));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (name) => page.screenshot({ path: path.join(outDir, `${name}.png`) });
const clickText = async (sel, text) => {
  const ok = await page.evaluate((sel, text) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(text) && !e.disabled);
    if (el) { el.click(); return true; } return false;
  }, sel, text);
  if (!ok) throw new Error(`não achei ${sel} "${text}"`);
};

await sleep(1800);
await shot('01-menu');
// Prime: libera antes gravando um Estagiário do dia com 60% (simula a tentativa).
if (level === 'Prime') {
  await page.evaluate(() => {
    const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    localStorage.setItem(`geoduelo:diario:${d}:estagiario`, JSON.stringify({ score: 9500, rounds: [{ mod: 'mapa', precision: 1, raw: 9500, detail: '' }], finishedAt: new Date().toISOString() }));
    localStorage.setItem(`geoduelo:diario:${d}:estagiario:inicio`, new Date().toISOString());
  });
  await page.reload(); await sleep(1500);
}
await clickText('button', level === 'Prime' ? 'Jogar o Nível Prime de hoje' : 'Jogar o desafio de hoje');
await sleep(1200);
await shot('03-vinheta');
await clickText('button', 'Começar');
await sleep(600);

const log = [];
let maps = 0;
const TOTAL = 15;
for (let i = 0; i < 2 * TOTAL && !(await page.$('.resultado')); i++) {
  const isMap = await page.$('.rodada-mapa');
  if (isMap) {
    maps++;
    const alvo = await page.$eval('.cartao-alvo', (e) => e.textContent);
    await page.waitForFunction(() => document.querySelector('.mapa canvas')?.width > 10);
    await sleep(400);
    const box = await (await page.$('.mapa canvas')).boundingBox();
    // clique em um ponto fixo, varia por rodada
    await page.mouse.click(box.x + box.width * (0.3 + 0.08 * (i % 5)), box.y + box.height * 0.42);
    await sleep(250);
    const pronto = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Confirmar posição')));
    if (!pronto) { await shot(`erro-${i}`); throw new Error(`pino não marcado na rodada ${i}`); }
    if (maps <= 2) await shot(`04-mapa-${i}-pino`);
    await clickText('button', 'Confirmar posição');
    await sleep(1900);
    const placar = await page.$eval('.placar-rodada', (e) => e.innerText.replace(/\n/g, ' '));
    const ctx = await page.$eval('.contexto', (e) => e.innerText);
    log.push(`mapa: ${alvo} → ${placar} | ${ctx}`);
    if (maps <= 3) await shot(`05-mapa-${i}-revelacao`);
  } else if (await page.$('.rodada-conflito')) {
    await sleep(500);
    const enun = await page.$eval('.enunciado-texto', (e) => e.textContent);
    if (await page.$('.pistas')) {
      // Dossiê: abre i % 3 pistas extras antes de responder
      for (let k = 0; k < i % 3; k++) { const b = await page.$('.pista-fechada .botao'); if (b) { await b.click(); await sleep(150); } }
      await shot(`06c-conflito-${i}-pergunta`);
      const btn = (await page.$$('.opcao'))[i % 4];
      await btn.click();
    } else {
      // Lados: alterna os lados escolhidos
      const linhas = await page.$$('.lado-escolha');
      for (let k = 0; k < linhas.length; k++) { const bs = await linhas[k].$$('.lado-botao'); await bs[(k + i) % 2].click(); }
      await sleep(150);
      await shot(`06c-conflito-${i}-pergunta`);
      await clickText('button', 'Confirmar');
    }
    await sleep(500);
    const placar = await page.$eval('.placar-rodada', (e) => e.innerText.replace(/\n/g, ' '));
    log.push(`conflito: ${enun} → ${placar}`);
    await shot(`07c-conflito-${i}-revelacao`);
  } else if (await page.$('.rodada-quiz')) {
    await sleep(500);
    const perg = await page.$eval('.quiz-pergunta', (e) => e.textContent);
    await shot(`06q-quiz-${i}-pergunta`);
    if (await page.$('.quiz-pares')) {
      const linhas = await page.$$('.quiz-par-opcoes');
      for (let k = 0; k < linhas.length; k++) { const bs = await linhas[k].$$('.lado-botao'); await bs[(k + i) % bs.length].click(); await sleep(80); }
      await clickText('button', 'Confirmar');
    } else {
      const ops = await page.$$('.quiz-opcoes .opcao');
      await ops[i % ops.length].click();
    }
    await sleep(500);
    const placar = await page.$eval('.placar-rodada', (e) => e.innerText.replace(/\n/g, ' '));
    log.push(`quiz: ${perg} → ${placar}`);
    await shot(`07q-quiz-${i}-revelacao`);
  } else {
    await sleep(i % 2 ? 3500 : 400);
    const enun = await page.$eval('.rodada-bandeira > .cartao-pergunta', (e) => e.textContent);
    await shot(`06-bandeira-${i}-pergunta`);
    const btn = (await page.$$('.opcao, .dupla'))[i % 4];
    await btn.click();
    await sleep(500);
    const placar = await page.$eval('.placar-rodada', (e) => e.innerText.replace(/\n/g, ' '));
    log.push(`bandeira: ${enun.slice(0, 40)} → ${placar}`);
    await shot(`07-bandeira-${i}-revelacao`);
  }
  const fim = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Ver resultado')));
  await clickText('button', fim ? 'Ver resultado' : 'Próxima rodada');
  await sleep(500);
  if (await page.$('.desbloqueio')) {
    await sleep(1600); await shot(`08d-desbloqueio-${i}`);
    log.push('--- desbloqueio: ' + (await page.$eval('.desbloqueio-texto', (e) => e.innerText)));
    await clickText('button', 'Começar o Nível Prime agora'); await sleep(1200);
  }
  if (await page.$('.vinheta')) { await sleep(1800); await shot(`08-vinheta-${i}`); await clickText('button', 'Começar'); await sleep(600); }
}
await sleep(2600);
await shot('09-resultado');
await page.screenshot({ path: path.join(outDir, '10-resultado-inteiro.png'), fullPage: true });
const share = await page.$eval('.texto-compartilhar', (e) => e.value);
console.log(log.join('\n'));
console.log('--- compartilhar ---\n' + share);
console.log('--- erros do console ---\n' + (errors.join('\n') || 'nenhum'));
await browser.close();
