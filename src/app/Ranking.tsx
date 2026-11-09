import { useEffect, useState } from 'react';
import { formatDateBR } from '../engine/date';
import { LEVELS, type LevelId } from '../engine/levels';
import {
  apagarMeusDados, colocacaoSalva, enviar, ErroRanking, jogadorAtual, rankingDia, rankingGeral, rankingSemana,
  registrar, segundaDaSemana, sincronizar, type Colocacao, type Jogador, type LinhaDia, type LinhaSoma,
} from '../engine/ranking';

const fmt = (n: number) => n.toLocaleString('pt-BR');
const fmtDur = (s: number) => `${Math.floor(s / 60)}min${String(s % 60).padStart(2, '0')}`;
const somaDias = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

export const AVISO_RANKING =
  'Para entrar no ranking, guardamos o apelido que você escolher e, para cada Desafio do Dia, a pontuação, a duração e a data. Nada mais: sem nome, e-mail ou login. Você pode apagar tudo a qualquer momento na tela do ranking.';

/** Formulário de apelido. Ao entrar, envia os resultados ranqueados de hoje e de ontem que ainda não foram. */
export function EntrarNoRanking({ onEntrou }: { onEntrou: (j: Jogador) => void }) {
  const [apelido, setApelido] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(''); setEnviando(true);
    try {
      const j = await registrar(apelido);
      await sincronizar();
      onEntrou(j);
    } catch (err) {
      setErro(err instanceof ErroRanking ? err.message : 'Algo deu errado. Tente de novo.');
    } finally { setEnviando(false); }
  };
  return (
    <form className="ranking-entrar" onSubmit={entrar}>
      <label className="campo">
        <span>Seu apelido no ranking</span>
        <input value={apelido} maxLength={20} onChange={(e) => setApelido(e.target.value)} placeholder="De 2 a 20 letras ou números" autoComplete="nickname" aria-describedby="aviso-ranking" />
      </label>
      <p id="aviso-ranking" className="dica">{AVISO_RANKING}</p>
      {erro && <p className="ranking-erro" role="alert">{erro}</p>}
      <div className="cartao-acoes">
        <button type="submit" className="botao botao-primario" disabled={enviando || apelido.trim().length < 2}>{enviando ? 'Entrando…' : 'Entrar no ranking'}</button>
      </div>
    </form>
  );
}

/** Bloco do ranking na tela de resultado do Desafio do Dia. */
export function RankingNoResultado({ data, niveis, onVerRanking }: { data: string; niveis: LevelId[]; onVerRanking: () => void }) {
  const [jogador, setJogador] = useState(jogadorAtual());
  const [col, setCol] = useState<Partial<Record<LevelId, Colocacao>>>({});
  const [erro, setErro] = useState('');
  const chave = niveis.join(',');

  useEffect(() => {
    if (!jogador) return;
    let vivo = true;
    (async () => {
      const out: Partial<Record<LevelId, Colocacao>> = {};
      for (const n of chave.split(',') as LevelId[]) {
        try { out[n] = colocacaoSalva(data, n) ?? (await enviar(data, n)) ?? undefined; } catch (e) {
          if (vivo) setErro(e instanceof ErroRanking ? e.message : 'Não foi possível enviar ao ranking agora.');
        }
      }
      if (vivo) setCol(out);
    })();
    return () => { vivo = false; };
  }, [jogador, data, chave]);

  return (
    <section className="ranking-resultado" aria-labelledby="titulo-ranking-res">
      <h2 id="titulo-ranking-res">Ranking do dia</h2>
      {!jogador ? (
        <>
          <p>Escolha um apelido para o seu resultado de hoje aparecer no ranking público.</p>
          <EntrarNoRanking onEntrou={setJogador} />
        </>
      ) : (
        <>
          {niveis.map((n) => col[n] && (
            <p key={n} className="ranking-colocacao">
              {LEVELS[n].titulo}: <strong>{col[n]!.posicao}º</strong> de {fmt(col[n]!.total)} {col[n]!.total === 1 ? 'jogador' : 'jogadores'} até agora.
            </p>
          ))}
          {erro && <p className="ranking-erro" role="alert">{erro} O envio será tentado de novo quando você voltar ao jogo.</p>}
          <p className="dica">Você joga como {jogador.apelido}.</p>
        </>
      )}
      <div className="cartao-acoes">
        <button type="button" className="botao" onClick={onVerRanking}>Ver o ranking</button>
      </div>
    </section>
  );
}

type Aba = 'dia' | 'semana' | 'geral';

export function TelaRanking({ hoje, onBack }: { hoje: string; onBack: () => void }) {
  const [aba, setAba] = useState<Aba>('dia');
  const [nivel, setNivel] = useState<LevelId>('estagiario');
  const [linhas, setLinhas] = useState<(LinhaDia | LinhaSoma)[] | null>(null);
  const [erro, setErro] = useState('');
  const [jogador, setJogador] = useState(jogadorAtual());
  const [confirmaApagar, setConfirmaApagar] = useState(false);
  const segunda = segundaDaSemana(hoje);

  useEffect(() => {
    let vivo = true;
    setLinhas(null); setErro('');
    (async () => {
      try {
        await sincronizar();
        const r = aba === 'dia' ? await rankingDia(hoje, nivel) : aba === 'semana' ? await rankingSemana(segunda) : await rankingGeral();
        if (vivo) setLinhas(r);
      } catch (e) {
        if (vivo) setErro(e instanceof ErroRanking ? e.message : 'Não foi possível carregar o ranking.');
      }
    })();
    return () => { vivo = false; };
  }, [aba, nivel, hoje, segunda, jogador]);

  useEffect(() => { if (!confirmaApagar) return; const t = window.setTimeout(() => setConfirmaApagar(false), 6000); return () => window.clearTimeout(t); }, [confirmaApagar]);

  const apagarTudo = async () => {
    try { await apagarMeusDados(); setJogador(null); setConfirmaApagar(false); } catch (e) {
      setErro(e instanceof ErroRanking ? e.message : 'Não foi possível apagar agora.');
    }
  };

  const legenda = aba === 'dia'
    ? `Desafio do Dia ${formatDateBR(hoje)}, ${LEVELS[nivel].titulo}. Empate: vence quem terminou mais rápido.`
    : aba === 'semana'
      ? `Semana de ${formatDateBR(segunda)} a ${formatDateBR(somaDias(segunda, 6))}: soma dos pontos dos dois níveis.`
      : 'Desde o lançamento: soma dos pontos dos dois níveis, com os dias jogados e a média por dia.';

  return (
    <div className="pagina">
      <button type="button" className="botao-texto voltar" onClick={onBack}>Voltar</button>
      <h1 className="pagina-titulo">Ranking</h1>
      <div className="abas" role="tablist" aria-label="Período do ranking">
        {([['dia', 'Hoje'], ['semana', 'Semana'], ['geral', 'Geral']] as const).map(([id, nome]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} className="aba" onClick={() => setAba(id)}>{nome}</button>
        ))}
      </div>
      {aba === 'dia' && (
        <div className="abas abas-pequenas" role="group" aria-label="Nível">
          {(['estagiario', 'prime'] as const).map((n) => (
            <button key={n} type="button" aria-pressed={nivel === n} className="aba" onClick={() => setNivel(n)}>{LEVELS[n].titulo}</button>
          ))}
        </div>
      )}
      <div role="tabpanel" aria-live="polite">
        {erro && <p className="ranking-erro" role="alert">{erro}</p>}
        {!erro && !linhas && <p className="dica">Carregando…</p>}
        {linhas && linhas.length === 0 && <p className="dica">Ninguém entrou neste ranking ainda.</p>}
        {linhas && linhas.length > 0 && (<>
          <p className="dica ranking-legenda" id="legenda-ranking">{legenda}</p>
          <table className="detalhe ranking-tabela" aria-describedby="legenda-ranking">
            <thead>
              <tr>
                <th scope="col" className="num">#</th>
                <th scope="col">Apelido</th>
                <th scope="col" className="num">Pontos</th>
                {aba === 'dia' ? <th scope="col" className="num">Tempo</th> : <><th scope="col" className="num">Dias</th><th scope="col" className="num">Média</th></>}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={`${l.posicao}-${l.apelido}`} className={l.voce ? 'ranking-voce' : undefined}>
                  <td className="num">{l.posicao}</td>
                  <td>{l.apelido}{l.voce && <span className="sr-only"> (você)</span>}</td>
                  <td className="num">{fmt(l.pontos)}</td>
                  {'duracao_s' in l
                    ? <td className="num">{fmtDur(l.duracao_s)}</td>
                    : <><td className="num">{l.dias}</td><td className="num">{fmt(l.media)}</td></>}
                </tr>
              ))}
            </tbody>
          </table>
        </>)}
      </div>
      <section className="ranking-voce-bloco" aria-label="Sua participação">
        {jogador ? (
          <>
            <p>Você joga como <strong>{jogador.apelido}</strong>. Só a primeira tentativa de cada dia entra no ranking.</p>
            {confirmaApagar ? (
              <p className="sair-confirma" role="group" aria-label="Confirmar exclusão">
                <button type="button" className="botao-texto" onClick={() => setConfirmaApagar(false)} autoFocus>Cancelar</button>
                <button type="button" className="botao-texto botao-texto-alerta" onClick={apagarTudo}>Apagar apelido e resultados</button>
              </p>
            ) : (
              <button type="button" className="botao-texto" onClick={() => setConfirmaApagar(true)}>Apagar meus dados do ranking</button>
            )}
          </>
        ) : (
          <>
            <p>Você ainda não está no ranking. Seus resultados ranqueados de hoje e de ontem entram assim que escolher um apelido.</p>
            <EntrarNoRanking onEntrou={setJogador} />
          </>
        )}
      </section>
    </div>
  );
}
