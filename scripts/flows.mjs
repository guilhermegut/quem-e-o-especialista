// Testa duelo por código, segunda tentativa do dia e treino adaptativo.
import puppeteer from 'puppeteer-core';
import path from 'node:path';
const [file, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 860 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(/^https?:/.test(file) ? file : 'file://' + path.resolve(file));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = async (sel, t) => { const ok = await page.evaluate((sel, t) => { const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(t) && !e.disabled); el?.click(); return !!el; }, sel, t); if (!ok) throw new Error(`sem ${sel} ${t}`); };
const RODADAS = Number(process.env.RODADAS || 15);
async function playRounds(n, answerIdx = 0) {
  for (let i = 0; i < n; i++) {
    if (await page.$('.vinheta')) { await sleep(300); await click('button', 'Começar'); await sleep(500); }
    if (await page.$('.rodada-conflito')) {
      await sleep(250);
      if (await page.$('.pistas')) { const opts = await page.$$('.opcao'); await opts[answerIdx % opts.length].click(); }
      else { for (const l of await page.$$('.lado-escolha')) (await l.$$('.lado-botao'))[answerIdx % 2].click(); await sleep(100); await click('button', 'Confirmar'); }
      await sleep(300);
    } else if (await page.$('.quiz-pares')) {
      await sleep(250);
      const ls = await page.$$('.quiz-par-opcoes'); for (let k = 0; k < ls.length; k++) { (await ls[k].$$('.lado-botao'))[(k + answerIdx) % 3].click(); await sleep(60); }
      await click('button', 'Confirmar'); await sleep(300);
    } else if (await page.$('.rodada-mapa')) {
      await page.waitForFunction(() => document.querySelector('.mapa canvas')?.width > 10); await sleep(300);
      const b = await (await page.$('.mapa canvas')).boundingBox();
      await page.mouse.click(b.x + b.width * 0.55, b.y + b.height * 0.35); await sleep(200);
      await click('button', 'Confirmar posição'); await sleep(1700);
    } else if (await page.$('.rodada-foto')) {
      await page.waitForFunction(() => document.querySelector('.foto-pronta') || document.querySelector('.foto-carregando .botao'), { timeout: 15000 });
      if (await page.$('.foto-carregando .botao')) await click('.foto-carregando .botao', 'Seguir');
      else { for (let k = 0; k <= answerIdx; k++) await click('.linha-acoes button', '+10'); await click('.linha-acoes button', 'Confirmar'); }
      await sleep(300);
    } else {
      await sleep(300);
      const opts = await page.$$('.opcao, .dupla'); await opts[answerIdx % opts.length].click(); await sleep(300);
    }
    await click('button', i === n - 1 ? 'Ver resultado' : 'Próxima rodada'); await sleep(400);
  }
}
await sleep(1500);
// 1) Desafio do dia, Estagiário
await click('button', 'Jogar o desafio de hoje'); await sleep(600);
await playRounds(RODADAS, 0);
console.log('   prime:', await page.$eval('.prime-aviso', (e) => e.innerText.replace(/\n/g, ' ')).catch(() => 'sem aviso'));
const stamp1 = await page.$eval('.resumo', (e) => e.innerText.replace(/\n/g, ' '));
await page.type('.campo input', 'Guilherme');
await sleep(200);
const code = await page.$eval('.codigo-duelo code', (e) => e.textContent);
console.log('1) carimbo:', stamp1);
console.log('   código:', code.slice(0, 40) + '…');
// 2) Segunda tentativa do mesmo nível: deve virar treino
await click('button', 'Voltar ao início'); await sleep(300);
console.log('2) menu:', await page.$eval('.menu-placar', (e) => e.innerText), '|', await page.$eval('.jogar-hoje-acao', (e) => e.innerText));
await click('button', 'Jogar de novo, como treino'); await sleep(600);
console.log('   vinheta:', await page.$eval('.vinheta-nivel', (e) => e.innerText));
await playRounds(RODADAS, 1);
console.log('   nota da 2ª:', await page.$eval('.resumo-nota', (e) => e.innerText));
await click('button', 'Voltar ao início'); await sleep(300);
console.log('   menu mantém a 1ª:', await page.$eval('.menu-placar', (e) => e.innerText));
// 3) Duelo: aceitar o código
await click('button', 'Duelar com um amigo'); await sleep(200);
await page.type('.campo textarea', 'olha esse: ' + code); await sleep(200);
console.log('3) desafio lido:', await page.$eval('.desafio-recebido p', (e) => e.innerText));
await click('button', 'Aceitar e jogar'); await sleep(300);
console.log('   vinheta:', await page.$eval('.vinheta-nivel', (e) => e.innerText));
await playRounds(RODADAS, 2);
console.log('   veredito:', await page.$eval('.duelo-veredito', (e) => e.innerText), '|', await page.$eval('.duelo-numeros', (e) => e.innerText.replace(/\n/g, ' ')));
await page.screenshot({ path: path.join(out, 'duelo-resultado.png'), fullPage: true });
// código adulterado
await click('button', 'Voltar ao início'); await sleep(300);
await click('button', 'Duelar com um amigo'); await sleep(200);
await page.type('.campo textarea', code.slice(0, -3) + 'zzz'); await sleep(200);
console.log('   código adulterado:', await page.$eval('.erro-texto', (e) => e.innerText));
await click('button', 'Voltar'); await sleep(200);
// 4) Treino de bandeiras
await click('button', 'Treinar um módulo'); await sleep(200);
await click('button.escolha', 'Bandeiras'); await sleep(300);
await playRounds(3, 0);
console.log('4) fim da série:', await page.$eval('.pagina .lead', (e) => e.innerText));
await click('button', 'Mais 3 rodadas'); await sleep(300);
console.log('   nova série começou:', !!(await page.$('.vinheta')));
console.log('erros:', errors.join(' | ') || 'nenhum');
await browser.close();
