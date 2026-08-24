-- ============================================================================
-- Financeiro Fase 1: salário líquido e outras rendas.
--
-- Migration não destrutiva: mantém renda_mensal como total mensal usado nos
-- cálculos atuais e guarda os detalhes novos em salario_liquido/outras_rendas.
-- ============================================================================

alter table clients
  add column if not exists salario_liquido numeric(14, 2),
  add column if not exists outras_rendas   jsonb not null default '[]'::jsonb;

create or replace function public.create_client_full(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_advisor_id  uuid := auth.uid();
  v_conjuge     jsonb := payload -> 'conjuge';
  v_client_id   uuid;
begin
  if v_advisor_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  insert into clients (
    advisor_id, nome, data_nascimento, idade, profissao, estado_civil,
    esporte_favorito, hobbies,
    salario_liquido, outras_rendas, renda_mensal, despesa_mensal, patrimonio_investido,
    tem_participacao_societaria, valor_participacao,
    idade_aposentadoria, expectativa_vida, pretensao_salarial_aposentadoria,
    pretende_adquirir_bens, e_clt, tem_seguro_vida,
    peso_kg, altura_cm, possui_patologia, patologias,
    usa_medicamentos, medicamentos, fuma, anda_moto, frequencia_moto
  )
  values (
    v_advisor_id,
    payload ->> 'nome',
    (payload ->> 'data_nascimento')::date,
    (payload ->> 'idade')::integer,
    payload ->> 'profissao',
    payload ->> 'estado_civil',
    payload ->> 'esporte_favorito',
    payload ->> 'hobbies',
    coalesce((payload ->> 'salario_liquido')::numeric, (payload ->> 'renda_mensal')::numeric),
    coalesce(payload -> 'outras_rendas', '[]'::jsonb),
    (payload ->> 'renda_mensal')::numeric,
    (payload ->> 'despesa_mensal')::numeric,
    (payload ->> 'patrimonio_investido')::numeric,
    coalesce((payload ->> 'tem_participacao_societaria')::boolean, false),
    (payload ->> 'valor_participacao')::numeric,
    (payload ->> 'idade_aposentadoria')::integer,
    (payload ->> 'expectativa_vida')::integer,
    (payload ->> 'pretensao_salarial_aposentadoria')::numeric,
    coalesce((payload ->> 'pretende_adquirir_bens')::boolean, false),
    coalesce((payload ->> 'e_clt')::boolean, false),
    coalesce((payload ->> 'tem_seguro_vida')::boolean, false),
    (payload ->> 'peso_kg')::numeric,
    (payload ->> 'altura_cm')::integer,
    coalesce((payload ->> 'possui_patologia')::boolean, false),
    payload ->> 'patologias',
    coalesce((payload ->> 'usa_medicamentos')::boolean, false),
    payload ->> 'medicamentos',
    coalesce((payload ->> 'fuma')::boolean, false),
    coalesce((payload ->> 'anda_moto')::boolean, false),
    payload ->> 'frequencia_moto'
  )
  returning id into v_client_id;

  if v_conjuge is not null and v_conjuge <> 'null'::jsonb then
    insert into spouses (client_id, nome, data_nascimento, dependente)
    values (
      v_client_id,
      v_conjuge ->> 'nome',
      (v_conjuge ->> 'data_nascimento')::date,
      coalesce((v_conjuge ->> 'dependente')::boolean, false)
    );
  end if;

  insert into children (client_id, nome, data_nascimento, dependente)
  select
    v_client_id,
    f.nome,
    f.data_nascimento,
    coalesce(f.dependente, false)
  from jsonb_to_recordset(coalesce(payload -> 'filhos', '[]'::jsonb)) as f (
    nome text, data_nascimento date, dependente boolean
  );

  insert into properties (client_id, tipo, valor, financiado, adquirido_apos_casamento)
  select
    v_client_id,
    'imovel'::property_tipo,
    p.valor,
    coalesce(p.financiado, false),
    coalesce(p.adquirido_apos_casamento, false)
  from jsonb_to_recordset(coalesce(payload -> 'imoveis', '[]'::jsonb)) as p (
    valor numeric, financiado boolean, adquirido_apos_casamento boolean
  );

  insert into properties (client_id, tipo, valor, financiado, adquirido_apos_casamento)
  select
    v_client_id,
    'automovel'::property_tipo,
    a.valor,
    coalesce(a.financiado, false),
    coalesce(a.adquirido_apos_casamento, false)
  from jsonb_to_recordset(coalesce(payload -> 'automoveis', '[]'::jsonb)) as a (
    valor numeric, financiado boolean, adquirido_apos_casamento boolean
  );

  insert into goals (client_id, prazo, descricao, valor_estimado, horizonte_anos)
  select
    v_client_id,
    g.prazo::goal_prazo,
    g.descricao,
    g.valor_estimado,
    g.horizonte_anos
  from jsonb_to_recordset(coalesce(payload -> 'objetivos', '[]'::jsonb)) as g (
    prazo text, descricao text, valor_estimado numeric, horizonte_anos integer
  );

  insert into assumptions (client_id, inflacao_projetada, cdi_atual, rentabilidade_real_padrao)
  values (v_client_id, 0.04, 0.1415, 0.0475);

  return v_client_id;
end;
$$;

grant execute on function public.create_client_full(jsonb) to authenticated;
