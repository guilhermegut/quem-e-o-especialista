import { describe, expect, it } from 'vitest';
import { CITIES, COUNTRY } from '../data';
import { dayIndex, todayBR } from './date';
import { decodeDuel, encodeDuel } from './duel';
import { haversineKm } from './geo';
import { dailyItems, flagPool, generateMatch, mapPool, _internals, type FlagRound } from './match';
import { finalScore, mapPrecision, roundPoints, shareSymbol } from './scoring';
import { quizPrecision, temaDaKey, temaPool, _quizInternals, TEMAS_CULTURA, TEMAS_MUNDO, type QuizRound } from './quiz';
import { FOTO_DESDE, NOVOS_DESDE, maxRaw, modulosDoDia, primeMinRaw, ROUNDS_PER_MODULE, temposDoDia } from './levels';
import { FOTOS, fotoPrecision } from './fotos';
import { CONFLITO, CONFLITOS, CONFLITOS_JOGO, EM_JOGO, PISTAS, conflictItems, conflictRound, dossieRound, ladosPrecision, ladosRound } from './conflitos';
import { rngFrom } from './rng';
import type { ConflictRound } from './match';

describe('determinismo', () => {
  it('mesma data e nível geram a mesma partida', () => {
    const a = generateMatch({ kind: 'daily', date: '2026-11-06', level: 'prime' });
    const b = generateMatch({ kind: 'daily', date: '2026-11-06', level: 'prime' });
    expect(a).toEqual(b);
    expect(a.rounds).toHaveLength(15);
  });
  it('datas e níveis diferentes geram partidas diferentes', () => {
    const a = generateMatch({ kind: 'daily', date: '2026-11-06', level: 'prime' });
    const b = generateMatch({ kind: 'daily', date: '2026-11-07', level: 'prime' });
    const c = generateMatch({ kind: 'daily', date: '2026-11-06', level: 'estagiario' });
    expect(a.rounds.map((r) => r.key)).not.toEqual(b.rounds.map((r) => r.key));
    expect(a.rounds.map((r) => r.key)).not.toEqual(c.rounds.map((r) => r.key));
  });
  it('partida livre depende só da seed', () => {
    const a = generateMatch({ kind: 'free', seed: 'abc', level: 'estagiario' });
    expect(generateMatch({ kind: 'free', seed: 'abc', level: 'estagiario' })).toEqual(a);
  });
});

describe('proteção contra decoreba', () => {
  for (const level of ['estagiario', 'prime'] as const) {
    for (const mod of ['mapa', 'conflitos', 'bandeiras'] as const) {
      it(`${mod}/${level}: nenhum item se repete dentro de um ciclo`, () => {
        const pool = mod === 'mapa' ? mapPool(level) : mod === 'bandeiras' ? flagPool(level) : conflictItems(level);
        const perCycle = Math.floor(pool.length / ROUNDS_PER_MODULE);
        const days = Math.min(perCycle, 60);
        const seen = new Set<string>();
        for (let d = 0; d < days; d++) {
          const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
          for (const it of dailyItems(mod, level, date)) {
            expect(seen.has(it.key)).toBe(false);
            seen.add(it.key);
          }
        }
      });
    }
  }
  it('grupos evitam dois itens do mesmo país', () => {
    const groups = _internals.groupsUpTo(mapPool('estagiario'), 10);
    const conflicts = groups.filter((g) => new Set(g.map((x) => x.cc)).size < g.length).length;
    expect(conflicts).toBe(0);
  });
});

describe('bandeiras', () => {
  it('alternativas são únicas, incluem a resposta e nunca são bandeiras idênticas', () => {
    for (let d = 0; d < 20; d++) {
      const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
      for (const level of ['estagiario', 'prime'] as const) {
        const m = generateMatch({ kind: 'daily', date, level });
        for (const r of m.rounds.filter((x): x is FlagRound => x.mod === 'bandeiras')) {
          if (r.variant === 'intrusa') {
            expect(r.pairs).toHaveLength(4);
            expect(r.pairs[r.wrongIndex].label).not.toBe(r.pairs[r.wrongIndex].flag);
            r.pairs.forEach((p, i) => { if (i !== r.wrongIndex) expect(p.label).toBe(p.flag); });
          } else {
            expect(new Set(r.options).size).toBe(4);
            expect(r.options).toContain(r.answer);
            if (level === 'prime') r.options.forEach((o) => expect(COUNTRY.get(o)?.un).toBe(1));
          }
        }
      }
    }
  });
  it('territórios com bandeira copiada de membro da ONU ficam fora', () => {
    const t = new Set(_internals.TERRITORIES.map((c) => c.cc));
    for (const cc of ['GP', 'HM', 'UM', 'MF', 'RE', 'SJ', 'BV', 'BQ', 'SH']) expect(t.has(cc)).toBe(false);
    for (const cc of ['PR', 'GL', 'HK', 'VA']) expect(t.has(cc)).toBe(true);
  });
});

describe('dados corrigidos', () => {
  it('Vaticano não é membro da ONU; Astana substitui Nur-Sultan; Jerusalém entra sem rótulo de país', () => {
    expect(COUNTRY.get('VA')?.un).toBe(0);
    expect(CITIES.some((c) => c.n === 'Astana' && c.cc === 'KZ')).toBe(true);
    expect(CITIES.some((c) => c.n === 'Nur-Sultan')).toBe(false);
    const jer = CITIES.find((c) => c.n === 'Jerusalém');
    expect(jer?.nc).toBe(true);
    expect(COUNTRY.get('PS')?.n).toBe('Territórios palestinos');
  });
  it('exônimos aprovados e CLDR só na cidade mais populosa', () => {
    for (const n of ['Nápoles', 'Marselha', 'Cracóvia', 'Dacca', 'Kiev']) expect(CITIES.some((c) => c.n === n)).toBe(true);
    expect(CITIES.find((c) => c.cc === 'CA' && /^Lond/.test(c.n))?.n).toBe('London');
    expect(CITIES.find((c) => c.cc === 'US' && /^Ath|^Aten/.test(c.n))?.n).toBe('Athens');
  });
  it('nomes em pt-BR', () => {
    expect(COUNTRY.get('IR')?.n).toBe('Irã');
    expect(COUNTRY.get('CD')?.n).toBe('República Democrática do Congo');
    expect(COUNTRY.get('CG')?.n).toBe('República do Congo');
  });
});

describe('pontuação e geografia', () => {
  it('precisão e pontos', () => {
    expect(roundPoints(1, 1)).toBe(1000);
    expect(roundPoints(1, 0)).toBe(850);
    expect(roundPoints(0, 1)).toBe(0);
    expect(mapPrecision(0, 800)).toBe(1);
    expect(mapPrecision(800, 800)).toBeCloseTo(Math.exp(-1));
    expect(finalScore([1000, 500], 1.35)).toBe(2025);
  });
  it('distância São Paulo–Rio de Janeiro ≈ 360 km', () => {
    const d = haversineKm([-46.63, -23.55], [-43.2, -22.91]);
    expect(d).toBeGreaterThan(350);
    expect(d).toBeLessThan(365);
  });
  it('dia 0 é 01/11/2026 e a data segue o fuso de Brasília', () => {
    expect(dayIndex('2026-11-01')).toBe(0);
    expect(todayBR(new Date('2026-11-07T02:30:00Z'))).toBe('2026-11-06'); // 23h30 em Brasília
  });
});

describe('duelo', () => {
  it('ida e volta do código', () => {
    const spec = { kind: 'daily', date: '2026-11-06', level: 'prime' } as const;
    const code = encodeDuel(spec, 'Guilherme', [1000, 0, 532], 2604);
    const r = decodeDuel(`veja: https://exemplo/#duelo=${code}`);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.spec).toEqual(spec); expect(r.payload.n).toBe('Guilherme'); expect(r.payload.t).toBe(2604); }
  });
  it('detecta código alterado', () => {
    const code = encodeDuel({ kind: 'free', seed: 'x1', level: 'estagiario' }, 'A', [10], 10);
    const tampered = code.replace(/\.(.)/, (_, c) => `.${c === 'e' ? 'f' : 'e'}`);
    expect(decodeDuel(tampered).ok).toBe(false);
  });
});

describe('guerras e conflitos', () => {
  const LEVELS = ['estagiario', 'prime'] as const;
  it('todo conflito tem as quatro pistas, fontes com endereço e lados com membros únicos', () => {
    for (const c of CONFLITOS) {
      for (const p of PISTAS) expect(c.pistas[p].length).toBeGreaterThan(40);
      expect(c.fontes.length).toBeGreaterThan(0);
      c.fontes.forEach((f) => expect(f.u).toMatch(/^https:\/\//));
      if (c.lados) {
        const nomes = [...c.lados.a.membros, ...c.lados.b.membros].map((m) => m.n);
        expect(new Set(nomes).size).toBe(nomes.length);
        expect(c.lados.a.membros.length).toBeGreaterThan(0);
        expect(c.lados.b.membros.length).toBeGreaterThan(0);
      }
    }
  });
  it('as pistas não citam o nome do conflito nem datas, e a de envolvidos não nomeia participantes', () => {
    for (const c of CONFLITOS) {
      for (const p of PISTAS) {
        expect(c.pistas[p].toLowerCase()).not.toContain(c.n.toLowerCase());
        expect(c.pistas[p]).not.toMatch(/\b(1\d{3}|20\d{2})\b|a\.C\./);
      }
      for (const m of [...(c.lados?.a.membros ?? []), ...(c.lados?.b.membros ?? [])]) expect(c.pistas.envolvidos).not.toContain(m.n);
    }
  });
  it('nas guerras em jogo, nenhuma pista traz dia e mês, e a de envolvidos não nomeia participantes nem em minúsculas', () => {
    const MES = /\b(\d{1,2}º?|primeiro dia|último dia) de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/i;
    for (const c of CONFLITOS_JOGO) {
      for (const p of PISTAS) expect(c.pistas[p], `${c.id}.${p}`).not.toMatch(MES);
      const env = c.pistas.envolvidos.toLowerCase();
      for (const m of [...(c.lados?.a.membros ?? []), ...(c.lados?.b.membros ?? [])]) expect(env, `${c.id}: ${m.n}`).not.toContain(m.n.toLowerCase());
    }
  });
  it('dossiê: quatro opções distintas com a resposta entre elas; Estagiário pega as mais distantes no tempo', () => {
    for (const level of LEVELS) for (const c of CONFLITOS_JOGO) for (let s = 0; s < 4; s++) {
      const r = dossieRound(rngFrom(`d${s}${c.id}`), level, c.id);
      expect(new Set(r.options).size).toBe(4);
      expect(r.options).toContain(c.id);
    }
    const r = dossieRound(rngFrom('x'), 'estagiario', 'guerra-da-coreia');
    expect(r.options.every((id) => id === 'guerra-da-coreia' || EM_JOGO.has(id))).toBe(true);
    const longe = CONFLITOS_JOGO.filter((o) => o.id !== 'guerra-da-coreia').sort((a, b) => Math.abs(b.ini - 1950) - Math.abs(a.ini - 1950)).slice(0, 3).map((o) => o.id);
    expect(r.options.filter((id) => id !== 'guerra-da-coreia').sort()).toEqual(longe.sort());
  });
  it('lados: os membros vêm do cadastro com o lado certo, há gente dos dois lados e o Estagiário evita os difíceis', () => {
    for (const level of LEVELS) for (const c of CONFLITOS.filter((x) => x.lados)) for (let s = 0; s < 4; s++) {
      const r = ladosRound(rngFrom(`l${s}${c.id}`), level, c.id);
      expect(new Set(r.membros.map((m) => m.lado)).size).toBe(2);
      for (const m of r.membros) expect(c.lados![m.lado].membros.some((x) => x.n === m.n)).toBe(true);
      if (level === 'estagiario') {
        const faceis = [...c.lados!.a.membros, ...c.lados!.b.membros].filter((m) => !m.dificil).length;
        const dificeis = r.membros.filter((m) => [...c.lados!.a.membros, ...c.lados!.b.membros].find((x) => x.n === m.n)!.dificil).length;
        if (faceis >= r.membros.length) expect(dificeis).toBe(0);
      }
    }
  });
  it('precisão do Lados: tudo certo vale 1; metade vale 0,5 no Estagiário e 0,35 no Prime', () => {
    const r = ladosRound(rngFrom('p'), 'estagiario', 'primeira-guerra-mundial');
    const certo = r.membros.map((m) => m.lado);
    expect(ladosPrecision('estagiario', r, certo).p).toBe(1);
    const metade = certo.map((l, i) => (i < r.membros.length / 2 ? l : l === 'a' ? 'b' : 'a'));
    expect(ladosPrecision('estagiario', r, metade).p).toBeCloseTo(0.5);
    expect(ladosPrecision('prime', r, metade).p).toBeCloseTo(Math.pow(0.5, 1.5));
  });
  it('a partida alterna Dossiê e Lados e não repete conflito', () => {
    for (const level of LEVELS) for (let d = 0; d < 10; d++) {
      const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
      const rs = generateMatch({ kind: 'daily', date, level }).rounds.filter((x): x is ConflictRound => x.mod === 'conflitos');
      rs.forEach((r, i) => {
        const id = r.tipo === 'dossie' ? r.answer : r.conflito;
        expect(r.tipo).toBe(i % 2 === 1 && CONFLITO.get(id)!.lados ? 'lados' : 'dossie');
      });
      const ids = rs.map((r) => (r.tipo === 'dossie' ? r.answer : r.conflito));
      expect(new Set(ids).size).toBe(3);
      ids.forEach((id) => expect(CONFLITO.has(id)).toBe(true));
    }
    expect(conflictItems('prime')).toHaveLength(EM_JOGO.size);
    expect(CONFLITOS_JOGO).toHaveLength(EM_JOGO.size);
    CONFLITOS_JOGO.forEach((c) => expect(c.ini).toBeGreaterThanOrEqual(1900));
    expect(conflictRound(rngFrom('z'), 'prime', 'primeira-guerra-mundial', 1).tipo).toBe('lados');
  });
  it('símbolos de compartilhamento monocromáticos seguem as faixas da seção 13', () => {
    expect([1, 0.8, 0.79, 0.6, 0.5, 0.4, 0.3, 0.05, 0].map(shareSymbol).join('')).toBe('●●◕◕◑◑◔○○');
  });
});

describe('quiz: Mundo hoje e Cultura', () => {
  const rodadas: QuizRound[] = [];
  for (const level of ['estagiario', 'prime'] as const) for (let d = 0; d < 120; d++) {
    const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
    rodadas.push(...generateMatch({ kind: 'daily', date, level }).rounds.filter((x): x is QuizRound => x.mod === 'mundo' || x.mod === 'cultura'));
    rodadas.push(...generateMatch({ kind: 'free', seed: `s${d}`, level }).rounds.filter((x): x is QuizRound => x.mod === 'mundo' || x.mod === 'cultura'));
  }
  it('cada partida tem um item de cada tema nos dois módulos', () => {
    const m = generateMatch({ kind: 'daily', date: '2026-11-09', level: 'prime' }).rounds;
    expect(m.filter((r) => r.mod === 'mundo').map((r) => (r as QuizRound).tema).sort()).toEqual([...TEMAS_MUNDO].sort());
    const cult = m.filter((r) => r.mod === 'cultura').map((r) => (r as QuizRound).tema);
    expect(new Set(cult).size).toBe(3);
    cult.forEach((t) => expect(TEMAS_CULTURA).toContain(t));
  });
  it('alternativas distintas, resposta válida, explicação e fontes', () => {
    for (const r of rodadas) {
      expect(new Set(r.opcoes).size).toBe(r.opcoes.length);
      expect(r.explicacao.length).toBeGreaterThan(10);
      expect(r.fontes.length).toBeGreaterThan(0);
      r.fontes.forEach((f) => expect(f.u).toMatch(/^https:\/\//));
      if (r.formato === 'pares') {
        expect(r.esquerda).toHaveLength(3);
        expect(new Set(r.esquerda).size).toBe(3);
        expect([...r.certo].sort()).toEqual([0, 1, 2]);
        expect(quizPrecision(r, r.certo)).toBe(1);
        expect(quizPrecision(r, [r.certo[0], r.certo[2], r.certo[1]])).toBeCloseTo(1 / 3);
      } else {
        expect(r.opcoes.length).toBeGreaterThanOrEqual(3);
        expect(r.certo[0]).toBeGreaterThanOrEqual(0);
        expect(quizPrecision(r, r.certo)).toBe(1);
        expect(quizPrecision(r, [(r.certo[0] + 1) % r.opcoes.length])).toBe(0);
      }
    }
    expect(rodadas.some((r) => r.formato === 'pares')).toBe(true);
    expect(rodadas.some((r) => r.formato === 'intruso')).toBe(true);
    expect(rodadas.filter((r) => r.formato === 'intruso').every((r) => r.key.split(':')[0] !== 'obra')).toBe(true);
    expect(rodadas.some((r) => r.tema === 'pop')).toBe(true);
    expect(rodadas.some((r) => /Em que cidade está|onde está/i.test(r.pergunta))).toBe(false);
  });
  it('o Estagiário não recebe intruso', () => {
    for (let d = 0; d < 60; d++) {
      const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
      const rs = generateMatch({ kind: 'daily', date, level: 'estagiario' }).rounds.filter((x): x is QuizRound => x.mod === 'mundo' || x.mod === 'cultura');
      rs.forEach((r) => expect(r.formato).not.toBe('intruso'));
    }
  });
  it('líderes: quem ocupava o cargo na data, sem datas em transição ou interinidade', () => {
    const { titularEm, D } = _quizInternals;
    const p = (cc: string, cargo?: string) => D.lideres.find((x) => x.cc === cc && (!cargo || x.cargo === cargo))!;
    expect(titularEm(p('US'), '2005-01-01')?.n).toBe('George W. Bush');
    expect(titularEm(p('DE'), '2010-07-01')?.n).toBe('Angela Merkel');
    expect(titularEm(p('BR'), '2016-07-01')).toBeNull(); // Dilma afastada, Temer interino
    expect(titularEm(p('BR'), '2003-01-01')).toBeNull(); // dia da posse
    expect(titularEm(p('KR'), '2017-01-01')).toBeNull();
    expect(titularEm(p('GB'), '2026-07-01')).toBeNull(); // troca em 20/07/2026
    expect(titularEm(p('GB'), '2026-01-01')?.n).toBe('Keir Starmer');
    expect(titularEm(p('TR', 'primeiro-ministro'), '2010-01-01')?.n).toBe('Recep Tayyip Erdoğan');
    expect(titularEm(p('RU'), '2000-01-01')).toBeNull(); // Putin interino
    const perguntas = rodadas.filter((r) => r.tema === 'lider' && r.pergunta.startsWith('Quem ocupava'));
    expect(perguntas.length).toBeGreaterThan(5);
  });
  it('rotação diária de cada tema não repete item dentro do ciclo', () => {
    for (const level of ['estagiario', 'prime'] as const) for (const tema of [...TEMAS_MUNDO, ...TEMAS_CULTURA]) {
      const n = Math.min(temaPool(tema, level).length, 40);
      const mod = TEMAS_MUNDO.includes(tema) ? 'mundo' : 'cultura';
      const vistos = new Set<string>();
      for (let d = 0; d < n; d++) {
        const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
        const it = dailyItems(mod, level, date).find((x) => temaDaKey(x.key) === tema);
        if (!it) continue;
        expect(vistos.has(it.key)).toBe(false);
        vistos.add(it.key);
      }
      expect(vistos.size).toBeGreaterThan(0);
    }
  });
});

describe('partida de até 5 minutos e liberação do Prime', () => {
  it('três rodadas por módulo; com oito módulos a resposta cabe em pouco mais de 6 minutos no pior caso', () => {
    expect(modulosDoDia('2026-11-09').map((m) => m.id)).toEqual(['mapa', 'bandeiras', 'mundo', 'cultura', 'conflitos']);
    expect(modulosDoDia('2099-01-01').map((m) => m.id)).toEqual(['mapa', 'bandeiras', 'mundo', 'cultura', 'esportes', 'foto', 'logica', 'conflitos']);
    for (const dia of ['2026-11-09', '2099-01-01']) for (const l of ['estagiario', 'prime'] as const) {
      const total = modulosDoDia(dia).reduce((a, m) => a + temposDoDia(dia)[l][m.id] * ROUNDS_PER_MODULE, 0);
      expect(total).toBeLessThanOrEqual(dia < FOTO_DESDE ? 300 : 390);
    }
    expect(temposDoDia('2026-11-10').estagiario.conflitos).toBe(38);
    if (NOVOS_DESDE > FOTO_DESDE) {
      expect(modulosDoDia(FOTO_DESDE).map((m) => m.id)).toEqual(['mapa', 'bandeiras', 'mundo', 'cultura', 'foto', 'conflitos']);
      expect(maxRaw(FOTO_DESDE)).toBe(18000);
    }
    expect(modulosDoDia(NOVOS_DESDE)).toHaveLength(8);
  });
  it('Prime libera com 60% do máximo bruto do dia', () => {
    expect(maxRaw('2026-11-09')).toBe(15000);
    expect(primeMinRaw('2026-11-09')).toBe(9000);
    expect(maxRaw('2099-01-01')).toBe(24000);
    expect(primeMinRaw('2099-01-01')).toBe(14400);
    expect(FOTO_DESDE >= '2026-11-10').toBe(true);
  });
  it('foto: pontuação pela distância em anos, com bônus por cravar', () => {
    for (const level of ['estagiario', 'prime'] as const) {
      expect(fotoPrecision(level, 1969, 1969)).toBe(1);
      expect(fotoPrecision(level, 1969, 1970)).toBeCloseTo(0.85);
      expect(fotoPrecision(level, 1969, 1968)).toBeCloseTo(0.85);
      expect(fotoPrecision(level, 1969, null)).toBe(0);
      expect(fotoPrecision(level, 1969, 1975)).toBeLessThan(fotoPrecision(level, 1969, 1972));
    }
    expect(fotoPrecision('prime', 1969, 1979)).toBeLessThan(fotoPrecision('estagiario', 1969, 1979));
    expect(FOTOS.every((f) => f.ano >= 1900 && f.ano <= 2026)).toBe(true);
  });
  it('partidas de 60 dias seguidos geram sem erro nos dois níveis', () => {
    for (const level of ['estagiario', 'prime'] as const) for (let d = 0; d < 60; d++) {
      const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
      const m = generateMatch({ kind: 'daily', date, level });
      expect(m.rounds).toHaveLength(modulosDoDia(date).length * ROUNDS_PER_MODULE);
      expect(m.rounds.filter((x) => x.mod === 'conflitos')).toHaveLength(3);
      expect(m.rounds.filter((x) => x.mod === 'foto')).toHaveLength(date >= FOTO_DESDE ? 3 : 0);
    }
  });
  it('fotos não se repetem entre os níveis nem antes de o acervo acabar', () => {
    const vistos = new Set<string>();
    const dias = Math.floor(FOTOS.length / (2 * ROUNDS_PER_MODULE));
    for (let d = 0; d < dias; d++) {
      const date = new Date(Date.parse(FOTO_DESDE + 'T12:00:00Z') + d * 864e5).toISOString().slice(0, 10);
      for (const level of ['estagiario', 'prime'] as const) {
        for (const r of generateMatch({ kind: 'daily', date, level }).rounds) {
          if (r.mod !== 'foto') continue;
          expect(vistos.has(r.id)).toBe(false);
          vistos.add(r.id);
        }
      }
    }
    expect(vistos.size).toBe(dias * 2 * ROUNDS_PER_MODULE);
  });
});

import { segundaDaSemana } from './ranking';
describe('Não sei e penalidade', () => {
  it('errar com resposta marcada custa 100 a partir de 11/11/2026; antes, zero', async () => {
    const { pontosRespondida, regrasNaoSei, PENALIDADE_ERRO } = await import('./scoring');
    expect(PENALIDADE_ERRO).toBe(100);
    expect(regrasNaoSei('2026-11-09')).toBe(false);
    expect(regrasNaoSei('2026-11-10')).toBe(true);
    const esperado = regrasNaoSei() ? -100 : 0;
    expect(pontosRespondida(0, 1)).toBe(esperado);
    expect(pontosRespondida(1, 1)).toBe(1000);
  });
});

describe('ranking', () => {
  it('a semana do ranking começa na segunda-feira', () => {
    expect(segundaDaSemana('2026-11-09')).toBe('2026-11-09');
    expect(segundaDaSemana('2026-11-15')).toBe('2026-11-09');
    expect(segundaDaSemana('2026-11-16')).toBe('2026-11-16');
    expect(segundaDaSemana('2027-01-01')).toBe('2026-12-28');
  });
});

import { getDaily, reiniciarDiaDosNovos, saveDailyIfFirst, startDaily } from './storage';
describe('reinício do dia em que os módulos novos entraram', () => {
  it('apaga a tentativa antiga e mantém a de oito módulos', () => {
    const velho = { score: 5000, rounds: [{ mod: 'mapa' as const, precision: 1, raw: 1000, detail: '' }], finishedAt: '2026-11-10T12:00:00Z' };
    startDaily(NOVOS_DESDE, 'estagiario'); saveDailyIfFirst(NOVOS_DESDE, 'estagiario', velho);
    reiniciarDiaDosNovos();
    expect(getDaily(NOVOS_DESDE, 'estagiario')).toBeNull();
    const novo = { ...velho, rounds: [{ mod: 'logica' as const, precision: 1, raw: 1000, detail: '' }] };
    saveDailyIfFirst(NOVOS_DESDE, 'estagiario', velho);
    reiniciarDiaDosNovos(); // segunda chamada não faz nada
    expect(getDaily(NOVOS_DESDE, 'estagiario')).not.toBeNull();
    expect(novo.rounds[0].mod).toBe('logica');
  });
});

import { TIPOS_LOGICA, logicaPool, logicaRound, _logicaInternals } from './logica';
import { TEMAS_ESPORTES, quizRound as qr, temaDaKey as tdk, temaPool as tp } from './quiz';
describe('Lógica', () => {
  it('cada tipo gera quatro opções distintas com uma certa, nos dois níveis', () => {
    for (const tipo of TIPOS_LOGICA) for (const level of ['estagiario', 'prime'] as const) for (const key of logicaPool(tipo).slice(0, 120)) {
      const r = logicaRound(level, key);
      expect(r.opcoes.length).toBe(4);
      const distintas = new Set(r.opcoes.map((o) => JSON.stringify(o))).size;
      // No intruso, três figuras são iguais e uma é diferente; nos demais, as quatro opções são distintas.
      if (tipo !== 'intruso') expect(distintas).toBe(4);
      if (tipo === 'intruso') expect(r.opcoes.filter((o) => JSON.stringify(o) === JSON.stringify(r.opcoes[r.certo])).length).toBe(1);
      expect(r.certo).toBeGreaterThanOrEqual(0);
      expect(r.certo).toBeLessThan(4);
      expect(logicaRound(level, key)).toEqual(r); // determinístico
    }
  });
  it('espelho: o reflexo de cada peça não coincide com nenhuma rotação dela', () => {
    const { normalizar, girar, refletir, PECAS } = _logicaInternals;
    for (const p of PECAS) {
      let rot = normalizar(p);
      const rots = [rot]; for (let i = 0; i < 3; i++) { rot = girar(rot); rots.push(rot); }
      const ref = JSON.stringify(refletir(normalizar(p)));
      expect(rots.map((r) => JSON.stringify(r))).not.toContain(ref);
    }
  });
});
describe('Esportes', () => {
  it('todos os itens de todos os temas geram pergunta com a resposta entre as opções', () => {
    for (const tema of TEMAS_ESPORTES) for (const level of ['estagiario', 'prime'] as const) {
      const pool = tp(tema, level);
      expect(pool.length).toBeGreaterThan(5);
      for (const key of pool) for (const s of [1, 2]) {
        expect(tdk(key, 'esportes')).toBe(tema);
        const r = qr(rngFrom(`e${s}${key}`), level, 'esportes', tema, key);
        expect(new Set(r.opcoes).size).toBe(r.opcoes.length);
        if (r.formato !== 'pares') { expect(r.opcoes.length).toBe(4); expect(r.certo[0]).toBeGreaterThanOrEqual(0); }
        else expect(r.certo.every((c) => c >= 0)).toBe(true);
      }
    }
  });
});
