-- Ranking do Quem é o Especialista.
-- As tabelas ficam no esquema "ranking", que a API pública do Supabase não expõe.
-- O site só fala com o banco pelas funções qe_* do esquema public, que conferem cada pedido.
-- Ninguém faz login: cada jogador tem um ID e um token aleatórios guardados no próprio navegador;
-- o banco guarda só o hash do token.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists ranking;
revoke all on schema ranking from public;

create table if not exists ranking.jogadores (
  id uuid primary key default gen_random_uuid(),
  apelido text not null,
  apelido_norm text not null unique,
  token_hash text not null,
  criado_em timestamptz not null default now()
);

create table if not exists ranking.resultados (
  jogador uuid not null references ranking.jogadores (id) on delete cascade,
  data date not null,
  nivel text not null check (nivel in ('estagiario', 'prime')),
  bruto integer not null check (bruto between 0 and 15000),
  pontos integer not null,
  duracao_s integer not null check (duracao_s between 30 and 10800),
  versao text not null check (length(versao) <= 12),
  criado_em timestamptz not null default now(),
  primary key (jogador, data, nivel),
  check (pontos = case nivel when 'prime' then round(bruto * 1.25)::integer else bruto end)
);

create index if not exists resultados_data_nivel on ranking.resultados (data, nivel, pontos desc);

alter table ranking.jogadores enable row level security;
alter table ranking.resultados enable row level security;

-- Data do Desafio do Dia: o jogo vira à meia-noite de Brasília.
create or replace function ranking.hoje() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

create or replace function ranking.normaliza(p text) returns text
language sql immutable set search_path = '' as $$
  select regexp_replace(
    translate(lower(btrim(p)), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn'),
    '[^a-z0-9]', '', 'g')
$$;

create or replace function ranking.apelido_ok(p text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare
  n text := ranking.normaliza(p);
  palavra text;
  proibidas text[] := array[
    'porra','caralho','merda','puta','puto','buceta','boceta','viado','arrombado','arrombada',
    'fdp','vsf','pqp','cuzao','foda','fodase','foder','fuder','piroca','xoxota','xereca',
    'hitler','nazi','nazista','admin','administrador','moderador'];
begin
  if p is null or length(btrim(p)) < 2 or length(btrim(p)) > 20 then return false; end if;
  if btrim(p) !~ '^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9 ._-]*$' then return false; end if;
  if btrim(p) ~ '  ' or length(n) < 2 then return false; end if;
  foreach palavra in array proibidas loop
    if position(palavra in n) > 0 then return false; end if;
  end loop;
  return true;
end
$$;

create or replace function ranking.autentica(p_jogador uuid, p_token text) returns boolean
language sql stable set search_path = '' as $$
  select exists (
    select 1 from ranking.jogadores j
    where j.id = p_jogador
      and j.token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex'))
$$;

-- Cria o jogador com o apelido escolhido. Devolve o ID; o token fica só no navegador.
create or replace function public.qe_registrar(p_apelido text, p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare novo uuid;
begin
  if not ranking.apelido_ok(p_apelido) then
    raise exception 'apelido_invalido' using errcode = 'P0001';
  end if;
  if p_token is null or length(p_token) < 32 or length(p_token) > 128 then
    raise exception 'token_invalido' using errcode = 'P0001';
  end if;
  insert into ranking.jogadores (apelido, apelido_norm, token_hash)
  values (btrim(p_apelido), ranking.normaliza(p_apelido), encode(extensions.digest(p_token, 'sha256'), 'hex'))
  returning id into novo;
  return novo;
exception when unique_violation then
  raise exception 'apelido_em_uso' using errcode = 'P0001';
end
$$;

-- Registra a primeira tentativa do dia. Uma segunda chamada para o mesmo dia e nível não muda nada.
create or replace function public.qe_enviar(
  p_jogador uuid, p_token text, p_data date, p_nivel text, p_bruto integer, p_duracao_s integer, p_versao text)
returns json
language plpgsql security definer set search_path = '' as $$
declare
  hoje date := ranking.hoje();
  ja_tinha boolean;
  pos integer;
  total integer;
begin
  if not ranking.autentica(p_jogador, p_token) then
    raise exception 'jogador_invalido' using errcode = 'P0001';
  end if;
  if p_data is null or p_data < hoje - 1 or p_data > hoje then
    raise exception 'data_fora_do_prazo' using errcode = 'P0001';
  end if;
  if p_nivel is null or p_nivel not in ('estagiario', 'prime') then
    raise exception 'nivel_invalido' using errcode = 'P0001';
  end if;
  if p_bruto is null or p_bruto < 0 or p_bruto > 15000 then
    raise exception 'pontuacao_invalida' using errcode = 'P0001';
  end if;
  if p_duracao_s is null or p_duracao_s < 30 or p_duracao_s > 10800 then
    raise exception 'duracao_invalida' using errcode = 'P0001';
  end if;
  if p_nivel = 'prime' and not exists (
    select 1 from ranking.resultados r
    where r.jogador = p_jogador and r.data = p_data and r.nivel = 'estagiario' and r.bruto >= 9000) then
    raise exception 'prime_nao_liberado' using errcode = 'P0001';
  end if;

  select true into ja_tinha from ranking.resultados r
  where r.jogador = p_jogador and r.data = p_data and r.nivel = p_nivel;

  if ja_tinha is null then
    insert into ranking.resultados (jogador, data, nivel, bruto, pontos, duracao_s, versao)
    values (p_jogador, p_data, p_nivel, p_bruto,
            case p_nivel when 'prime' then round(p_bruto * 1.25)::integer else p_bruto end,
            p_duracao_s, left(coalesce(p_versao, ''), 12));
  end if;

  select count(*) + 1 into pos from ranking.resultados r, ranking.resultados eu
  where eu.jogador = p_jogador and eu.data = p_data and eu.nivel = p_nivel
    and r.data = p_data and r.nivel = p_nivel
    and (r.pontos > eu.pontos or (r.pontos = eu.pontos and r.duracao_s < eu.duracao_s)
         or (r.pontos = eu.pontos and r.duracao_s = eu.duracao_s and r.criado_em < eu.criado_em));
  select count(*) into total from ranking.resultados r where r.data = p_data and r.nivel = p_nivel;
  return json_build_object('posicao', pos, 'total', total, 'repetido', coalesce(ja_tinha, false));
end
$$;

-- Ranking de um dia e nível: os primeiros e, se não estiver entre eles, a linha de quem pediu.
create or replace function public.qe_ranking_dia(p_data date, p_nivel text, p_jogador uuid default null, p_limite integer default 50)
returns table (posicao integer, apelido text, pontos integer, duracao_s integer, voce boolean)
language sql stable security definer set search_path = '' as $$
  with ordem as (
    select row_number() over (order by r.pontos desc, r.duracao_s, r.criado_em)::integer as posicao,
           j.apelido, r.pontos, r.duracao_s, coalesce(r.jogador = p_jogador, false) as voce
    from ranking.resultados r join ranking.jogadores j on j.id = r.jogador
    where r.data = p_data and r.nivel = p_nivel)
  select * from ordem where posicao <= least(greatest(coalesce(p_limite, 50), 1), 100) or voce
  order by posicao
$$;

-- Soma dos pontos (Estagiário e Prime) entre duas datas, inclusive.
create or replace function ranking.soma(p_inicio date, p_fim date, p_jogador uuid, p_limite integer)
returns table (posicao integer, apelido text, pontos integer, dias integer, media integer, voce boolean)
language sql stable set search_path = '' as $$
  with por_jogador as (
    select r.jogador, sum(r.pontos)::integer as pontos, count(distinct r.data)::integer as dias,
           min(r.criado_em) as primeiro
    from ranking.resultados r
    where r.data between p_inicio and p_fim
    group by r.jogador),
  ordem as (
    select row_number() over (order by p.pontos desc, p.dias, p.primeiro)::integer as posicao,
           j.apelido, p.pontos, p.dias, round(p.pontos::numeric / p.dias)::integer as media,
           coalesce(p.jogador = p_jogador, false) as voce
    from por_jogador p join ranking.jogadores j on j.id = p.jogador)
  select * from ordem where posicao <= least(greatest(coalesce(p_limite, 50), 1), 100) or voce
  order by posicao
$$;

create or replace function public.qe_ranking_semana(p_inicio date, p_jogador uuid default null, p_limite integer default 50)
returns table (posicao integer, apelido text, pontos integer, dias integer, media integer, voce boolean)
language sql stable security definer set search_path = '' as $$
  select * from ranking.soma(p_inicio, p_inicio + 6, p_jogador, p_limite)
$$;

create or replace function public.qe_ranking_geral(p_jogador uuid default null, p_limite integer default 50)
returns table (posicao integer, apelido text, pontos integer, dias integer, media integer, voce boolean)
language sql stable security definer set search_path = '' as $$
  select * from ranking.soma('2000-01-01'::date, '2999-12-31'::date, p_jogador, p_limite)
$$;

-- Apaga o jogador e todos os resultados dele.
create or replace function public.qe_apagar(p_jogador uuid, p_token text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if not ranking.autentica(p_jogador, p_token) then
    raise exception 'jogador_invalido' using errcode = 'P0001';
  end if;
  delete from ranking.jogadores where id = p_jogador;
  return true;
end
$$;

-- Só as funções qe_* ficam acessíveis ao site.
revoke all on all functions in schema ranking from public;
revoke execute on function public.qe_registrar(text, text) from public;
revoke execute on function public.qe_enviar(uuid, text, date, text, integer, integer, text) from public;
revoke execute on function public.qe_ranking_dia(date, text, uuid, integer) from public;
revoke execute on function public.qe_ranking_semana(date, uuid, integer) from public;
revoke execute on function public.qe_ranking_geral(uuid, integer) from public;
revoke execute on function public.qe_apagar(uuid, text) from public;
grant execute on function public.qe_registrar(text, text) to anon, authenticated;
grant execute on function public.qe_enviar(uuid, text, date, text, integer, integer, text) to anon, authenticated;
grant execute on function public.qe_ranking_dia(date, text, uuid, integer) to anon, authenticated;
grant execute on function public.qe_ranking_semana(date, uuid, integer) to anon, authenticated;
grant execute on function public.qe_ranking_geral(uuid, integer) to anon, authenticated;
grant execute on function public.qe_apagar(uuid, text) to anon, authenticated;
