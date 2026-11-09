// Ranking público: fala com as funções qe_* do Supabase pela API REST, sem biblioteca.
// Sem login: o jogador recebe um ID e um token aleatório, guardados só neste navegador.
// Sem as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY no build, o ranking fica escondido.
import { CONTENT_VERSION } from '../data';
import { todayBR } from './date';
import type { LevelId } from './levels';
import { apagar, dailyDuracao, getDaily, gravarJSON, lerJSON, rawOf } from './storage';

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const URL_BASE = (env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const CHAVE = env.VITE_SUPABASE_KEY ?? '';

// VITE_RANKING_HOST prende o ranking a um endereço (o domínio próprio): o apelido fica guardado no navegador
// por endereço, então quem entrasse por outro endereço perderia a identidade na troca.
const HOST = (env.VITE_RANKING_HOST ?? '').toLowerCase();
const hostOk = () => {
  if (!HOST) return true;
  try { const h = window.location.hostname.toLowerCase(); return h === HOST || h === `www.${HOST}` || h === 'localhost'; } catch { return false; }
};

export const rankingAtivo = () => Boolean(URL_BASE && CHAVE) && env.VITE_PREVIEW !== '1' && hostOk();

export interface Jogador { id: string; token: string; apelido: string }
export interface LinhaDia { posicao: number; apelido: string; pontos: number; duracao_s: number; voce: boolean }
export interface LinhaSoma { posicao: number; apelido: string; pontos: number; dias: number; media: number; voce: boolean }
export interface Colocacao { posicao: number; total: number; repetido: boolean }

const K_JOGADOR = 'ranking:jogador';
const kEnviado = (data: string, nivel: LevelId) => `ranking:enviado:${data}:${nivel}`;

export const jogadorAtual = () => lerJSON<Jogador | null>(K_JOGADOR, null);

const MENSAGENS: Record<string, string> = {
  apelido_invalido: 'Use de 2 a 20 letras ou números, sem palavrões.',
  apelido_em_uso: 'Esse apelido já está em uso. Escolha outro.',
  jogador_invalido: 'Não reconheci este jogador. Talvez os dados tenham sido apagados.',
  data_fora_do_prazo: 'O prazo para enviar este resultado já passou.',
  prime_nao_liberado: 'O resultado do Nível Prime só entra depois do Nível Estagiário do mesmo dia.',
  pontuacao_invalida: 'Pontuação fora do permitido.',
  duracao_invalida: 'Duração da partida fora do permitido.',
};

export class ErroRanking extends Error {
  constructor(public codigo: string) { super(MENSAGENS[codigo] ?? 'Não foi possível falar com o ranking agora. Tente de novo mais tarde.'); }
}

async function rpc<T>(fn: string, corpo: Record<string, unknown>): Promise<T> {
  if (!rankingAtivo()) throw new ErroRanking('desligado');
  let r: Response;
  try {
    r = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new ErroRanking('rede');
  }
  if (!r.ok) {
    let codigo = 'servidor';
    try { const j = (await r.json()) as { message?: string }; if (j.message && MENSAGENS[j.message]) codigo = j.message; } catch { /* corpo vazio */ }
    throw new ErroRanking(codigo);
  }
  return (await r.json()) as T;
}

function tokenNovo(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Cria o jogador com o apelido escolhido e envia os resultados ranqueados de hoje e de ontem. */
export async function registrar(apelido: string): Promise<Jogador> {
  const token = tokenNovo();
  const id = await rpc<string>('qe_registrar', { p_apelido: apelido.trim(), p_token: token });
  const j: Jogador = { id, token, apelido: apelido.trim() };
  gravarJSON(K_JOGADOR, j);
  return j;
}

/** Envia o resultado ranqueado de um dia e nível, uma vez só. Devolve a colocação, ou null se não há o que enviar. */
export async function enviar(data: string, nivel: LevelId): Promise<Colocacao | null> {
  const j = jogadorAtual();
  const rec = getDaily(data, nivel);
  const dur = dailyDuracao(data, nivel);
  if (!j || !rec || dur === null) return null;
  const c = await rpc<Colocacao>('qe_enviar', {
    p_jogador: j.id, p_token: j.token, p_data: data, p_nivel: nivel,
    p_bruto: Math.max(0, Math.min(15000, rawOf(rec))), p_duracao_s: dur, p_versao: CONTENT_VERSION,
  });
  gravarJSON(kEnviado(data, nivel), c);
  return c;
}

export const colocacaoSalva = (data: string, nivel: LevelId) => lerJSON<Colocacao | null>(kEnviado(data, nivel), null);

/** Manda o que ficou pendente (hoje e ontem, Estagiário antes do Prime). Falhas de rede ficam para a próxima vez. */
export async function sincronizar(): Promise<void> {
  if (!rankingAtivo() || !jogadorAtual()) return;
  const hoje = todayBR();
  const ontem = todayBR(new Date(Date.now() - 86400000));
  for (const data of [ontem, hoje]) {
    for (const nivel of ['estagiario', 'prime'] as const) {
      if (colocacaoSalva(data, nivel) || !getDaily(data, nivel)) continue;
      try { await enviar(data, nivel); } catch (e) {
        if (e instanceof ErroRanking && (e.codigo === 'rede' || e.codigo === 'servidor')) return;
      }
    }
  }
}

export const rankingDia = (data: string, nivel: LevelId) =>
  rpc<LinhaDia[]>('qe_ranking_dia', { p_data: data, p_nivel: nivel, p_jogador: jogadorAtual()?.id ?? null, p_limite: 50 });

export const rankingSemana = (inicio: string) =>
  rpc<LinhaSoma[]>('qe_ranking_semana', { p_inicio: inicio, p_jogador: jogadorAtual()?.id ?? null, p_limite: 50 });

export const rankingGeral = () =>
  rpc<LinhaSoma[]>('qe_ranking_geral', { p_jogador: jogadorAtual()?.id ?? null, p_limite: 50 });

/** Apaga o jogador e todos os resultados dele no servidor, e esquece a identidade neste navegador. */
export async function apagarMeusDados(): Promise<void> {
  const j = jogadorAtual();
  if (!j) return;
  await rpc<boolean>('qe_apagar', { p_jogador: j.id, p_token: j.token });
  apagar(K_JOGADOR);
  const hoje = todayBR();
  const ontem = todayBR(new Date(Date.now() - 86400000));
  for (const data of [ontem, hoje]) for (const nivel of ['estagiario', 'prime'] as const) apagar(kEnviado(data, nivel));
}

/** Segunda-feira da semana de uma data ISO (a semana do ranking vai de segunda a domingo). */
export function segundaDaSemana(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  const dow = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dow);
  return t.toISOString().slice(0, 10);
}
