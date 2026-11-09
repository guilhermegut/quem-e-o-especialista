-- Módulo Foto: o Desafio passa a ter 6 módulos (18.000 pontos brutos) a partir de ranking.foto_desde().
-- Antes dessa data valem 15.000 pontos e o Prime libera com 9.000; depois, com 10.800.

create or replace function ranking.foto_desde() returns date
language sql immutable set search_path = '' as $$
  select '2099-01-01'::date
$$;

create or replace function ranking.max_bruto(p_data date) returns integer
language sql immutable set search_path = '' as $$
  select case when p_data >= ranking.foto_desde() then 18000 else 15000 end
$$;

alter table ranking.resultados drop constraint if exists resultados_bruto_check;
alter table ranking.resultados add constraint resultados_bruto_check check (bruto between 0 and 18000);

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
  if p_bruto is null or p_bruto < 0 or p_bruto > ranking.max_bruto(p_data) then
    raise exception 'pontuacao_invalida' using errcode = 'P0001';
  end if;
  if p_duracao_s is null or p_duracao_s < 30 or p_duracao_s > 10800 then
    raise exception 'duracao_invalida' using errcode = 'P0001';
  end if;
  if p_nivel = 'prime' and not exists (
    select 1 from ranking.resultados r
    where r.jogador = p_jogador and r.data = p_data and r.nivel = 'estagiario'
      and r.bruto >= round(ranking.max_bruto(p_data) * 0.6)) then
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


revoke all on all functions in schema ranking from public;
revoke execute on function public.qe_enviar(uuid, text, date, text, integer, integer, text) from public;
grant execute on function public.qe_enviar(uuid, text, date, text, integer, integer, text) to anon, authenticated;
