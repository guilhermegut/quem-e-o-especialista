import { PENALIDADE_ERRO } from '../../engine/scoring';
import { fmtInt } from '../../app/format';

/** Botão "Não sei": encerra a rodada com zero ponto, sem a penalidade de quem marca e erra. */
export function NaoSei({ onClick }: { onClick: () => void }) {
  return (
    <div className="nao-sei">
      <button type="button" className="botao botao-nao-sei" onClick={onClick}>
        <span className="tecla" aria-hidden>0</span> Não sei
      </button>
      <span className="dica">Vale 0. Errar custa {fmtInt(PENALIDADE_ERRO)} pontos.</span>
    </div>
  );
}

export function PontosRodada({ pontos }: { pontos: number }) {
  return <div className={`placar-pontos ${pontos < 0 ? 'placar-negativo' : ''}`}>{pontos < 0 ? '−' : '+'}{fmtInt(Math.abs(pontos))}</div>;
}
