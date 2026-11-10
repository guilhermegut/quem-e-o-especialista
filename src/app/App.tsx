import { useEffect, useMemo, useRef, useState } from 'react';
import { CITIES, CONTENT_VERSION, DATA_VERSIONS } from '../data';
import { formatDateBR, todayBR } from '../engine/date';
import { decodeDuel, type DuelPayload } from '../engine/duel';
import { formatKm, haversineKm } from '../engine/geo';
import { LEVEL_ORDER, LEVELS, maxRaw, modulosDoDia, primeMinRaw, ROUNDS_PER_MODULE, temposDoDia, type LevelId, type ModuleId } from '../engine/levels';
import { FOTOS, K_FOTO } from '../engine/fotos';

const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito'];
const listaNomes = (nomes: string[]) => nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1];
import { flagPool, generateMatch, mapPool, trainingSet, type MatchSpec, type Round } from '../engine/match';
import { conflictItems } from '../engine/conflitos';
import { TEMA_NOME as NOME_TEMA, TEMAS_CULTURA, TEMAS_MUNDO, temaPool } from '../engine/quiz';
import { randomSeed } from '../engine/rng';
import { finalScore, regrasNaoSei, NAO_SEI_DESDE, PENALIDADE_ERRO } from '../engine/scoring';
import {
  dailyStarted, getDaily, getSettings, getTrainingLevel, primeLiberado, rawOf, recentExposure, recordExposure,
  saveDailyIfFirst, saveSettings, saveTrainingLevel, startDaily, type RoundResult,
} from '../engine/storage';
import { loadGeo, prefetchGeo, type GeoData } from '../modules/mapa/geodata';
import { WorldMap, type MapReveal } from '../modules/mapa/WorldMap';
import { fmtInt } from './format';
import { TEMA_NOME, alternarTema } from './tema';
import { Game } from './Game';
import { Results, falaDoResultado, type Parte } from './Results';
import { AnimAbertura, AnimCelebracao, preloadAnim } from './Anim';
import { comecarCom, falar, quantasFalas } from './voz';
import { rankingAtivo, sincronizar } from '../engine/ranking';
import { TelaRanking } from './Ranking';
import { lerAndamento, limparAndamento, salvarAndamento, type Andamento } from './andamento';

type Screen =
  | { s: 'menu' }
  | { s: 'jogo'; spec: MatchSpec; rounds: Round[]; ranked: boolean; duel?: DuelPayload; nivel1?: Parte; inicio?: { i: number; results: RoundResult[] } }
  | { s: 'desbloqueio'; nivel1: Parte }
  | { s: 'fim'; partes: Parte[]; duel?: DuelPayload; prime: 'liberado' | 'bloqueado' | null }
  | { s: 'duelo'; inicial?: string }
  | { s: 'treino-escolha' }
  | { s: 'treino'; mod: ModuleId; level: LevelId; rounds: Round[]; historico: RoundResult[] }
  | { s: 'treino-fim'; mod: ModuleId; level: LevelId; novoNivel: LevelId; results: RoundResult[] }
  | { s: 'como' }
  | { s: 'sobre' }
  | { s: 'ranking' };

/** Volta à rodada em que a partida estava quando a página recarregou. */
function retomar(a: Andamento): Screen | null {
  if (a.tela === 'desbloqueio') return a.nivel1 ? { s: 'desbloqueio', nivel1: a.nivel1 } : null;
  const rounds = generateMatch(a.spec).rounds;
  const results = [...a.results];
  let i = a.i;
  if (a.emRodada && results.length <= i && rounds[i]) { results.push({ mod: rounds[i].mod, precision: 0, raw: 0, detail: 'rodada interrompida' }); i += 1; }
  if (i >= rounds.length || results.length !== i) return null;
  return { s: 'jogo', spec: a.spec, rounds, ranked: a.ranked, duel: a.duel, nivel1: a.nivel1, inicio: { i, results } };
}

function readDuelFromHash(): string | undefined {
  try { const m = window.location.hash.match(/duelo=([^&]+)/); return m ? decodeURIComponent(m[1]) : undefined; } catch { return undefined; }
}

export function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const code = readDuelFromHash();
    if (code) return { s: 'duelo', inicial: code };
    const a = lerAndamento(todayBR());
    const r = a ? retomar(a) : null;
    if (!r) limparAndamento();
    return r ?? { s: 'menu' };
  });
  const hoje = todayBR();
  const home = () => { limparAndamento(); setScreen({ s: 'menu' }); };

  useEffect(() => { window.scrollTo(0, 0); }, [screen.s]);
  useEffect(() => { void sincronizar(); }, []);

  const startDailyMatch = (level: LevelId, nivel1?: Parte) => {
    saveSettings({ nivel: level });
    const spec: MatchSpec = { kind: 'daily', date: hoje, level };
    // O Prime só vale para o ranking se a primeira tentativa do Estagiário de hoje o liberou.
    const ranked = !dailyStarted(hoje, level) && (level === 'estagiario' || primeLiberado(hoje));
    if (ranked) startDaily(hoje, level);
    setScreen({ s: 'jogo', spec, rounds: generateMatch(spec).rounds, ranked, nivel1 });
  };
  const startFree = (level: LevelId) => {
    saveSettings({ nivel: level });
    const spec: MatchSpec = { kind: 'free', seed: randomSeed(), level };
    setScreen({ s: 'jogo', spec, rounds: generateMatch(spec).rounds, ranked: false });
  };
  const startDuel = (spec: MatchSpec, duel: DuelPayload) => {
    // Duelo sobre o Desafio do Dia de hoje conta como a tentativa ranqueada de quem ainda não jogou
    // (no Prime, só para quem já liberou o nível hoje).
    let ranked = false;
    const podeRanquear = spec.level !== 'prime' || primeLiberado(hoje);
    if (spec.kind === 'daily' && spec.date === hoje && podeRanquear && !dailyStarted(hoje, spec.level)) { startDaily(hoje, spec.level); ranked = true; }
    setScreen({ s: 'jogo', spec, rounds: generateMatch(spec).rounds, ranked, duel });
  };

  const startTraining = (mod: ModuleId, level: LevelId, historico: RoundResult[] = []) => {
    const rounds = trainingSet(mod, level, randomSeed(), recentExposure(mod));
    recordExposure(mod, rounds.map((r) => r.key));
    setScreen({ s: 'treino', mod, level, rounds, historico });
  };

  switch (screen.s) {
    case 'menu':
      return <Menu hoje={hoje} go={setScreen} onDaily={(l) => startDailyMatch(l)} />;
    case 'jogo': {
      const { spec, rounds, ranked, duel, nivel1, inicio } = screen;
      return (
        <Game
          rounds={rounds}
          level={spec.level}
          titulo={duel ? `Duelo contra ${duel.n}` : spec.kind === 'daily' ? (ranked ? 'Desafio do Dia' : 'Desafio do Dia, como treino') : 'Partida livre'}
          key={spec.level + (nivel1 ? '2' : '1')}
          onQuit={home}
          inicio={inicio}
          onProgresso={(p) => salvarAndamento({ tela: 'jogo', spec, ranked, duel, nivel1, ...p })}
          onFinish={(results) => {
            limparAndamento();
            if (ranked && spec.kind === 'daily') {
              saveDailyIfFirst(spec.date, spec.level, { score: finalScore(results.map((r) => r.raw), LEVELS[spec.level].multiplicador), rounds: results, finishedAt: new Date().toISOString() });
            }
            const parte: Parte = { spec, rounds, results, ranked };
            if (nivel1) { setScreen({ s: 'fim', partes: [nivel1, parte], prime: null }); return; }
            // Nível 1 do desafio de hoje: com 60% o Prime abre e começa na sequência; sem isso, fica só este resultado.
            if (spec.kind === 'daily' && spec.level === 'estagiario' && spec.date === hoje && !duel) {
              const bruto = results.reduce((a, r) => a + r.raw, 0);
              if (bruto >= primeMinRaw(spec.date)) {
                salvarAndamento({ tela: 'desbloqueio', spec, ranked, nivel1: parte, i: 0, results: [], emRodada: false });
                setScreen({ s: 'desbloqueio', nivel1: parte });
                return;
              }
              setScreen({ s: 'fim', partes: [parte], prime: 'bloqueado' });
              return;
            }
            setScreen({ s: 'fim', partes: [parte], duel, prime: null });
          }}
        />
      );
    }
    case 'desbloqueio':
      return (
        <Desbloqueio
          nivel1={screen.nivel1}
          onJogar={() => startDailyMatch('prime', screen.nivel1)}
          onAgoraNao={() => { limparAndamento(); setScreen({ s: 'fim', partes: [screen.nivel1], prime: 'liberado' }); }}
        />
      );
    case 'fim':
      return (
        <Results
          partes={screen.partes} duel={screen.duel} onHome={home} prime={screen.prime}
          onPrime={screen.prime === 'liberado' ? () => startDailyMatch('prime', screen.partes[0]) : undefined}
          onRanking={() => { limparAndamento(); setScreen({ s: 'ranking' }); }}
        />
      );
    case 'duelo':
      return <DuelScreen inicial={screen.inicial} onAccept={startDuel} onCreate={() => startFree('estagiario')} onBack={() => { try { history.replaceState(null, '', ' '); } catch { /* ignora */ } home(); }} />;
    case 'treino-escolha':
      return (
        <Pagina titulo="Treinar um módulo" onBack={home}>
          <p className="lead">Rodadas sem fim, fora do ranking. O nível se ajusta ao seu desempenho a cada três rodadas, e o jogo evita repetir o que você viu na última semana.</p>
          <div className="lista-escolha">
            {modulosDoDia(hoje).map((m) => {
              const l = getTrainingLevel(m.id) ?? getSettings().nivel;
              return (
                <button key={m.id} type="button" className="escolha escolha-modulo" data-mod={m.id} onClick={() => startTraining(m.id, l)}>
                  <span className="escolha-nome">{m.nome}</span>
                  <span className="escolha-desc">{m.chamada} Você começa no nível {LEVELS[l].nome}.</span>
                </button>
              );
            })}
          </div>
        </Pagina>
      );
    case 'treino':
      return (
        <Game
          key={screen.rounds.map((r) => r.key).join()}
          rounds={screen.rounds}
          level={screen.level}
          titulo="Treino"
          onQuit={home}
          onFinish={(results) => {
            const avg = results.reduce((a, r) => a + r.precision, 0) / results.length;
            const novo: LevelId = avg >= 0.75 ? 'prime' : avg < 0.35 ? 'estagiario' : screen.level;
            saveTrainingLevel(screen.mod, novo);
            setScreen({ s: 'treino-fim', mod: screen.mod, level: screen.level, novoNivel: novo, results: [...screen.historico, ...results] });
          }}
        />
      );
    case 'treino-fim': {
      const ultimos = screen.results.slice(-ROUNDS_PER_MODULE);
      const pts = ultimos.reduce((a, r) => a + r.raw, 0);
      const mudou = screen.novoNivel !== screen.level;
      return (
        <Pagina titulo="Fim da série" onBack={home}>
          <p className="lead">
            {fmtInt(pts)} pontos brutos nas últimas {ROUNDS_PER_MODULE} rodadas, no nível {LEVELS[screen.level].nome}.{' '}
            {mudou ? `A próxima série será no nível ${LEVELS[screen.novoNivel].nome}.` : 'A próxima série continua no mesmo nível.'}
          </p>
          <p>Rodadas nesta sessão de treino: {screen.results.length}.</p>
          <div className="cartao-acoes">
            <button type="button" className="botao botao-primario" autoFocus onClick={() => startTraining(screen.mod, screen.novoNivel, screen.results)}>Mais {ROUNDS_PER_MODULE} rodadas</button>
            <button type="button" className="botao" onClick={home}>Voltar ao início</button>
          </div>
        </Pagina>
      );
    }
    case 'como':
      return <ComoJogar onBack={home} />;
    case 'sobre':
      return <Sobre onBack={home} />;
    case 'ranking':
      return <TelaRanking hoje={hoje} onBack={home} />;
  }
}

// ---------- Telas menores ----------

function Pagina({ titulo, onBack, children }: { titulo: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="pagina">
      <button type="button" className="botao-texto voltar" onClick={onBack}>Voltar</button>
      <h1 className="pagina-titulo">{titulo}</h1>
      {children}
    </div>
  );
}

const ESPERA_PRIME = 8;

function Desbloqueio({ nivel1, onJogar, onAgoraNao }: { nivel1: Parte; onJogar: () => void; onAgoraNao: () => void }) {
  const bruto = nivel1.results.reduce((a, r) => a + r.raw, 0);
  const score = finalScore(nivel1.results.map((r) => r.raw), LEVELS.estagiario.multiplicador);
  const [resta, setResta] = useState(ESPERA_PRIME);
  const jogarRef = useRef(onJogar);
  jogarRef.current = onJogar;
  useEffect(() => { falar([falaDoResultado(bruto / maxRaw()), 'prime-liberado']); }, [bruto]);
  useEffect(() => {
    if (resta <= 0) { jogarRef.current(); return; }
    const t = window.setTimeout(() => setResta((r) => r - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resta]);
  return (
    <div className="desbloqueio" role="dialog" aria-labelledby="desbloqueio-titulo">
      <AnimCelebracao titulo="Prime liberado" sub="Nível 2 desbloqueado" cor="#b8860b" />
      <h1 id="desbloqueio-titulo" className="desbloqueio-titulo">Você desbloqueou o Nível Prime</h1>
      <p className="desbloqueio-texto">
        Nível 1 concluído com {fmtInt(score)} pontos ({fmtInt(bruto)} brutos, acima dos {fmtInt(primeMinRaw())} necessários).
        O Prime começa em <strong aria-live="polite">{resta} s</strong>, com {EXTENSO[modulosDoDia().length]} módulos de novo, um pouco mais difíceis e multiplicador de 1,25.
      </p>
      <div className="cartao-acoes">
        <button type="button" className="botao botao-prime botao-grande" onClick={onJogar} autoFocus>Começar o Nível Prime agora</button>
        <button type="button" className="botao" onClick={onAgoraNao}>Agora não, ver meu resultado</button>
      </div>
    </div>
  );
}

function Menu({ hoje, go, onDaily }: { hoje: string; go: (s: Screen) => void; onDaily: (l: LevelId) => void }) {
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [som, setSom] = useState(getSettings().som);
  useEffect(() => {
    preloadAnim();
    loadGeo('110m').then(setGeo);
    // Adianta o download do mapa detalhado da partida quando o menu fica ocioso.
    const t = window.setTimeout(() => prefetchGeo('50m'), 4000);
    return () => window.clearTimeout(t);
  }, []);
  // Demonstração da mecânica: um clique em São Paulo para quem procurava Lisboa.
  const demo = useMemo<MapReveal | null>(() => {
    const sp = CITIES.find((c) => c.n === 'São Paulo' && c.cc === 'BR');
    const li = CITIES.find((c) => c.n === 'Lisboa' && c.cc === 'PT');
    return sp && li ? { guess: [sp.lon, sp.lat], target: [li.lon, li.lat], label: 'Lisboa' } : null;
  }, []);
  const est = getDaily(hoje, 'estagiario');
  const pri = getDaily(hoje, 'prime');
  const estIniciado = !est && dailyStarted(hoje, 'estagiario');
  const liberado = primeLiberado(hoje);
  const primePendente = liberado && !dailyStarted(hoje, 'prime');
  const jogar = () => { if (!dailyStarted(hoje, 'estagiario')) comecarCom('abertura'); onDaily('estagiario'); };

  return (
    <div className="menu">
      <div className="menu-texto">
        <p className="menu-data">Desafio de {formatDateBR(hoje)}</p>
        <h1 className="sr-only">Quem é o Especialista</h1>
        <AnimAbertura />
        <p className="menu-lead">{modulosDoDia(hoje).length === 8 ? 'Oito temas, uns seis minutos. Mapa, bandeiras, mundo de hoje, cultura, esportes, fotos, lógica e guerras' : 'Cinco temas, cinco minutos. Mapa, bandeiras, mundo de hoje, cultura e guerras'}: todo dia uma partida nova, a mesma para todo mundo.</p>
        <ul className="menu-modulos" aria-label="Módulos da partida">
          {modulosDoDia(hoje).map((m) => <li key={m.id} data-mod={m.id}>{m.nome}</li>)}
        </ul>
        <button type="button" className="jogar-hoje" onClick={jogar} autoFocus>
          <span className="jogar-hoje-acao">{est || estIniciado ? 'Jogar de novo, como treino' : 'Jogar o desafio de hoje'}</span>
          <span className="jogar-hoje-desc">Faça 60% dos pontos no Nível 1 e o Nível 2, Prime, começa na sequência.</span>
        </button>
        {(est || pri) && (
          <p className="menu-placar">
            Hoje: {est ? `Nível 1, ${fmtInt(est.score)} pontos` : ''}{pri ? ` · Prime, ${fmtInt(pri.score)} pontos` : ''}
            {est && !liberado ? ` · faltaram ${fmtInt(primeMinRaw(hoje) - rawOf(est))} pontos brutos para o Prime` : ''}
          </p>
        )}
        {primePendente && <button type="button" className="botao botao-prime" onClick={() => onDaily('prime')}>Jogar o Nível Prime de hoje</button>}
        <div className="menu-acoes">
          <button type="button" className="botao" onClick={() => go({ s: 'duelo' })}>Duelar com um amigo</button>
          <button type="button" className="botao" onClick={() => go({ s: 'treino-escolha' })}>Treinar um módulo</button>
          {rankingAtivo() && <button type="button" className="botao" onClick={() => go({ s: 'ranking' })}>Ranking</button>}
        </div>
        <nav className="menu-links">
          <button type="button" className="botao-texto" onClick={() => go({ s: 'como' })}>Como jogar</button>
          <button type="button" className="botao-texto" onClick={() => go({ s: 'sobre' })}>Sobre e créditos</button>
          <BotaoTema />
          {quantasFalas() > 0
            ? <button type="button" className="botao-texto" onClick={() => { saveSettings({ som: !som }); setSom(!som); }} aria-pressed={som}>Voz: {som ? 'ligada' : 'desligada'}</button>
            : <span className="menu-nota">Narração: gravações ainda não incluídas</span>}
        </nav>
        <p className="aviso-previa">Conteúdo conferido por verificação independente, com as fontes ao fim de cada rodada.</p>
      </div>
      <div className="menu-mapa" aria-hidden>
        {geo && <WorldMap geo={geo} layers="fronteiras" reveal={demo} interactive={false} ariaLabel="" insetBottom={64} />}
        {demo?.guess && <p className="menu-mapa-legenda">Procurava Lisboa, clicou em São Paulo: errou por {formatKm(haversineKm(demo.guess, demo.target))}.</p>}
      </div>
    </div>
  );
}

function DuelScreen({ inicial, onAccept, onCreate, onBack }: { inicial?: string; onAccept: (s: MatchSpec, d: DuelPayload) => void; onCreate: () => void; onBack: () => void }) {
  const [texto, setTexto] = useState(inicial ?? '');
  const res = texto.trim() ? decodeDuel(texto) : null;
  return (
    <Pagina titulo="Duelo" onBack={onBack}>
      <section className="bloco">
        <h2>Aceitar um desafio</h2>
        <label className="campo">
          <span>Cole o código ou o link que você recebeu</span>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} placeholder="GD1.…" />
        </label>
        {res && !res.ok && <p className="erro-texto" role="alert">{res.erro}</p>}
        {res && res.ok && (
          <div className="desafio-recebido">
            <p>
              {res.payload.n} fez {fmtInt(res.payload.t)} pontos no nível {LEVELS[res.spec.level].nome}
              {res.spec.kind === 'daily' ? `, no Desafio do Dia de ${formatDateBR(res.spec.date)}.` : ', numa partida livre.'}
            </p>
            {res.versaoDiferente && <p className="erro-texto">O desafio foi criado com outra versão do conteúdo ({res.payload.cv}; esta é {CONTENT_VERSION}). As rodadas podem não ser as mesmas.</p>}
            <button type="button" className="botao botao-primario" onClick={() => onAccept(res.spec, res.payload)}>Aceitar e jogar</button>
          </div>
        )}
      </section>
      <section className="bloco">
        <h2>Criar um desafio</h2>
        <p>Jogue uma partida nova. No fim você recebe um código para mandar a quem quiser desafiar. O Desafio do Dia também gera código no final.</p>
        <button type="button" className="botao" onClick={onCreate}>Criar partida de duelo</button>
      </section>
    </Pagina>
  );
}

function ComoJogar({ onBack }: { onBack: () => void }) {
  const mods = modulosDoDia();
  const tempo = (l: LevelId) => mods.reduce((a, m) => a + temposDoDia()[l][m.id] * ROUNDS_PER_MODULE, 0);
  const dias = (n: number) => `${fmtInt(n)} dias`;
  return (
    <Pagina titulo="Como jogar" onBack={onBack}>
      <div className="texto-corrido">
        <p>Cada partida tem {EXTENSO[mods.length]} módulos, sempre nesta ordem, com três rodadas cada: {listaNomes(mods.map((m) => m.nome))}. São {mods.length * ROUNDS_PER_MODULE} rodadas e até {fmtInt(maxRaw())} pontos brutos. Na prática, a partida leva de cinco a seis minutos por nível: o tempo máximo de resposta é de {Math.floor(tempo('estagiario') / 60)} min {tempo('estagiario') % 60} s no Estagiário e {Math.floor(tempo('prime') / 60)} min {tempo('prime') % 60} s no Prime.</p>
        <h2>Dois níveis</h2>
        <p>O desafio do dia começa no Nível 1, Estagiário. Se você fizer {fmtInt(primeMinRaw())} pontos brutos ou mais (60% do máximo), a tela avisa que o Nível 2, Prime, foi desbloqueado e ele começa na sequência; no fim aparecem os dois resultados. Se preferir parar, fica só o resultado do Nível 1, e o Prime continua disponível no menu até o fim do dia. O Prime é um degrau acima, sem salto brusco: um pouco menos de tempo, alternativas mais próximas da resposta e multiplicador de 1,25. Para valer no ranking, o Prime precisa ter sido liberado pela primeira tentativa do dia no Nível 1.</p>
        <h2>Mapa</h2>
        <p>Aparece o nome de um país ou de uma cidade. Clique onde fica e confirme. Dentro do país, a precisão é máxima; fora, conta a distância até a fronteira mais próxima. A precisão cai com a distância: a 1.200 km ainda rende 37% no Estagiário; no Prime, a mesma fração exige errar por no máximo 800 km. O mapa é colorido por continente, como num tabuleiro.</p>
        <h2>Bandeiras</h2>
        <p>Escolha o país dono da bandeira. No Prime, as alternativas são as bandeiras mais parecidas com a certa, e uma das rodadas começa com a bandeira ampliada, que se abre aos poucos.</p>
        <h2>Mundo hoje</h2>
        <p>Uma pergunta sobre moedas, uma sobre líderes do G20 nos últimos 30 anos e uma sobre a religião predominante de um país, em formatos que variam: múltipla escolha, ligue os pares e, no Prime, ache o intruso. Nos líderes, o jogo pergunta por quem comandava o governo: presidentes, primeiros-ministros e chanceleres; na França, na Rússia e na China, pelo presidente; na Arábia Saudita, pelo rei.</p>
        <h2>Cultura</h2>
        <p>{mods.some((m) => m.id === 'esportes') ? 'Uma pergunta de filosofia, uma de pintura e uma de cultura pop (Oscar, livros e videogames mais vendidos).' : 'Três perguntas por dia, de três destes quatro temas: esporte, filosofia, pintura e cultura pop (Oscar, livros e videogames mais vendidos).'} Nas obras de arte, o jogo pergunta pelo autor e pelo movimento, nunca pelo lugar onde estão.</p>
        {mods.some((m) => m.id === 'esportes') && (<>
          <h2>Esportes</h2>
          <p>Três perguntas por dia, de três destes oito temas: futebol (Copas do Mundo desde 1930, Copa feminina e Bola de Ouro), Olimpíadas de Moscou 1980 em diante, tênis (Grand Slams de 1990 em diante), Fórmula 1 de 1980 em diante, boxe de 1980 em diante, MMA, NBA de 1985 em diante e NFL (Super Bowls de 2005 em diante).</p>
        </>)}
        {mods.some((m) => m.id === 'foto') && (<>
          <h2>Foto</h2>
          <p>Uma fotografia aparece na tela e você arrasta a linha do tempo, de 1900 a 2026, até o ano em que acha que ela foi tirada; as setas do teclado e os botões de ±1 e ±10 ajustam, e Enter confirma. Como no mapa, quanto mais perto, mais pontos: cravar o ano vale o máximo, errar por um ano vale 85%, e a pontuação cai a cerca de um terço a {K_FOTO.estagiario} anos de distância no Estagiário e a {K_FOTO.prime} anos no Prime. Se o tempo acabar com o cursor fora do lugar inicial, vale a posição dele. Há cenas do cotidiano, em que contam carros, roupas e a própria imagem, e fotos de fatos históricos. O tempo só começa quando a foto termina de carregar. São {fmtInt(FOTOS.length)} fotos de acervos públicos ou com licença livre, com fonte, autor e licença ao fim de cada rodada.</p>
        </>)}
        {mods.some((m) => m.id === 'logica') && (<>
          <h2>Lógica</h2>
          <p>Três desafios rápidos de raciocínio, de tipos diferentes a cada dia: continuar uma sequência de números, prever o giro de uma seta, contar lados, achar a figura que não combina, pesar formas numa balança, reconhecer o reflexo de uma peça no espelho, adiantar um relógio e completar um quadro de formas. São gerados por regra, então não se repetem.</p>
        </>)}
        <h2>Guerras</h2>
        <p>O módulo usa {conflictItems('estagiario').length} conflitos dos séculos XX e XXI: as duas guerras mundiais, Afeganistão e Iraque, as guerras com Israel, as guerras do Oriente Médio e as guerras com países europeus como beligerantes principais. Duas dinâmicas se alternam. No Dossiê, as pistas de um conflito aparecem uma de cada vez; com uma pista aberta, o acerto vale 100%, com duas 75%, com três 50% e com as quatro 30%. Em Lados, você diz de que lado estava cada participante.</p>
        <h2>Pontos</h2>
        <p>Cada rodada vale até 1.000 pontos: 850 pela precisão e até 150 pela rapidez, na proporção da precisão. Chute rápido e errado não ganha bônus. Nos pares, conta a fração de ligações certas.</p>
        <p>{regrasNaoSei() ? 'Em' : `A partir do Desafio de ${formatDateBR(NAO_SEI_DESDE)}, em`} Bandeiras, Mundo hoje, Cultura, Esportes, Lógica e Guerras há o botão Não sei (tecla 0), que vale zero. Resposta errada custa {fmtInt(PENALIDADE_ERRO)} pontos, 10% de um acerto; deixar o tempo acabar vale zero. Assim, chutar sem saber deixa de compensar. Mapa e Foto não têm Não sei nem desconto: neles a pontuação cai com a distância. O total da partida nunca fica abaixo de zero.</p>
        <h2>Por que não dá para decorar</h2>
        <p>O desafio percorre todo o acervo de cada módulo antes de repetir um item, e a ordem muda a cada ciclo. Intervalo mínimo até um item voltar ao desafio:</p>
        <table className="detalhe">
          <thead><tr><th scope="col">Nível</th><th scope="col" className="num">Mapa</th><th scope="col" className="num">Bandeiras</th><th scope="col" className="num">Guerras</th></tr></thead>
          <tbody>
            {LEVEL_ORDER.map((l) => (
              <tr key={l}>
                <td>{LEVELS[l].nome}</td>
                <td className="num">{dias(Math.floor(mapPool(l).length / ROUNDS_PER_MODULE))}</td>
                <td className="num">{dias(Math.floor(flagPool(l).length / ROUNDS_PER_MODULE))}</td>
                <td className="num">{dias(Math.floor(conflictItems(l).length / ROUNDS_PER_MODULE))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="detalhe">
          <thead><tr><th scope="col">Tema do quiz</th>{LEVEL_ORDER.map((l) => <th key={l} scope="col" className="num">{LEVELS[l].nome}</th>)}</tr></thead>
          <tbody>
            {[...TEMAS_MUNDO, ...TEMAS_CULTURA].map((t) => (
              <tr key={t}><td>{NOME_TEMA[t]}</td>{LEVEL_ORDER.map((l) => <td key={l} className="num">{dias(temaPool(t, l).length)}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <h2>Desafio do Dia e duelos</h2>
        <p>A partida do dia é a mesma para todos e vira à meia-noite de Brasília. Só a primeira tentativa em cada nível vale para o ranking; começar e abandonar também consome a tentativa. Um duelo carrega as rodadas e o placar de quem desafiou, sem servidor e sem cadastro.</p>
      </div>
    </Pagina>
  );
}

function Sobre({ onBack }: { onBack: () => void }) {
  return (
    <Pagina titulo="Sobre e créditos" onBack={onBack}>
      <div className="texto-corrido">
        <p>Quem é o Especialista é um projeto pessoal. Versão de conteúdo {CONTENT_VERSION}.</p>
        {rankingAtivo()
          ? <p>Privacidade: o jogo não usa cookies nem anúncios. Pontuações, sequência e preferências ficam guardadas neste navegador. Se você escolher um apelido para o ranking, o apelido e, para cada Desafio do Dia, a pontuação, a duração e a data vão para o servidor do ranking (Supabase, região de São Paulo). Não pedimos nome, e-mail nem login, e você pode apagar tudo na tela do ranking. Como em qualquer site, os provedores de hospedagem (GitHub e Supabase) registram dados técnicos de acesso, como o endereço IP.</p>
          : <p>Privacidade: o jogo não usa cookies, não tem anúncios nem coleta dados. Pontuações, sequência e preferências ficam guardadas só neste navegador.</p>}
        <h2>Dados</h2>
        <ul>
          <li>Países e terras: Natural Earth, escala 1:50m na partida e 1:110m no menu, via world-atlas {DATA_VERSIONS['world-atlas']} (dados em domínio público; pacote sob licença ISC).</li>
          <li>Cidades, coordenadas e população: GeoNames, licença CC BY 4.0, via all-the-cities {DATA_VERSIONS['all-the-cities']}.</li>
          <li>Códigos, ONU, área e idiomas: world-countries {DATA_VERSIONS['world-countries']}, licença ODbL 1.0.</li>
          <li>Nomes em português do Brasil, população e moedas em circulação (nomes, códigos e símbolos): Unicode CLDR {DATA_VERSIONS['cldr-core']}, Unicode License v3.</li>
          <li>Religião predominante: CIA World Factbook, campo Religions, em domínio público, via factbook.json. Só entram países em que o maior grupo passa de 50% e supera o segundo por 15 pontos.</li>
          <li>Líderes do G20, esportes e cultura pop: listas da Wikipedia em inglês consultadas em 09/11/2026 (chefes de governo de cada país, finais das Copas do Mundo, sedes olímpicas, campeões da Fórmula 1 e da Bola de Ouro, Oscar de melhor filme e de direção, livros e jogos mais vendidos).</li>
          <li>Filosofia e arte: verbetes da Wikipedia em português e em inglês, citados em cada pergunta.</li>
          <li>Exônimos de cidades: Wikipédia em português e Natural Earth 5.1.2, camada de localidades povoadas (domínio público), com a lista curada pelo projeto.</li>
          <li>Bandeiras: flag-icons {DATA_VERSIONS['flag-icons']}, licença MIT.</li>
          {FOTOS.length > 0 && <li>Fotografias: {fmtInt(FOTOS.length)} imagens em domínio público ou com licença livre, do Nationaal Archief (coleção Anefo, CC0), da NASA, da Library of Congress (Bain News Service, Harris & Ewing e FSA/OWI), dos National Archives e das Forças Armadas dos EUA, do Imperial War Museums e de outros acervos públicos, em domínio público, do Bundesarchiv (CC BY-SA), da Agência Brasil (CC BY 3.0 BR) e de fotógrafos que publicam no Wikimedia Commons (CC BY e CC BY-SA), entre outros. Autor, acervo, licença e link de cada foto aparecem ao fim da rodada. As imagens foram reduzidas e, nas fotos de negativos, aparadas nas bordas; as versões alteradas de obras CC BY-SA seguem sob a mesma licença.</li>}
          <li>Guerras e conflitos: textos escritos pelo projeto a partir de Britannica, Wikipedia, World History Encyclopedia e outras fontes, listadas ao fim de cada rodada.</li>
        </ul>
        <h2>Correções feitas nos dados</h2>
        <ul>
          <li>O Vaticano aparece como membro da ONU no world-countries; a Santa Sé é Estado observador.</li>
          <li>O GeoNames ainda chama a capital do Cazaquistão de Nur-Sultan; aqui ela é Astana.</li>
          <li>Bairros e subúrbios que o GeoNames registra como cidades foram descartados (Brooklyn, Kowloon, Çankaya).</li>
        </ul>
        <h2>Animação, voz e tipografia</h2>
        <p>Animações feitas com Remotion, usada sob a licença gratuita para pessoas físicas. Narração com a voz do autor do projeto, gerada no ElevenLabs a partir de um clone autorizado por ele. Tipografia Inter, de Rasmus Andersson, e Playfair Display, de Claus Eggers Sørensen, ambas sob a SIL Open Font License 1.1, empacotadas pelo Fontsource.</p>
        <h2>Licenças</h2>
        <p>CC BY 4.0: creativecommons.org/licenses/by/4.0. As licenças das fotografias têm link em cada rodada. ODbL 1.0: opendatacommons.org/licenses/odbl/1-0. Unicode License v3: unicode.org/license.txt. SIL OFL 1.1: openfontlicense.org. Os dados do world-countries continuam sob a ODbL; alterações feitas aqui estão listadas acima.</p>
      </div>
    </Pagina>
  );
}

function BotaoTema() {
  const [tema, setTema] = useState(getSettings().tema);
  return (
    <button type="button" className="botao-texto" onClick={() => setTema(alternarTema())} aria-label={`Aparência ${TEMA_NOME[tema]}. Toque para trocar.`}>
      Aparência: {TEMA_NOME[tema]}
    </button>
  );
}
