// O Desafio do Dia vira à meia-noite de Brasília.
export const TZ = 'America/Sao_Paulo';
export const EPOCH = '2026-11-01'; // dia 0 da rotação de conteúdo

export const todayBR = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

const toUTC = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const dayIndex = (iso: string) => Math.round((toUTC(iso) - toUTC(EPOCH)) / 86400000);

export const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toUTC(s));
