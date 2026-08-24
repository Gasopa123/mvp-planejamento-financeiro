-- ============================================================================
-- MVP Planejamento Financeiro Dinâmico para Assessores
-- Schema inicial: tabelas, trigger de atualizado_em e Row Level Security.
--
-- Rodar manualmente no SQL Editor do Supabase (projeto vazio).
-- ============================================================================

-- Garante gen_random_uuid() disponível independente da versão do Postgres.
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tipos enumerados
-- ----------------------------------------------------------------------------

create type property_tipo as enum ('imovel', 'automovel');
create type goal_prazo as enum ('curto', 'medio', 'longo');

-- ----------------------------------------------------------------------------
-- advisors
-- Perfil do assessor, 1:1 com auth.users. Sem ON DELETE CASCADE aqui: a
-- remoção do usuário de auth não deve apagar silenciosamente o advisor.
-- ----------------------------------------------------------------------------

create table advisors (
  id         uuid primary key references auth.users (id),
  nome       text not null,
  email      text not null unique,
  plano      text not null default 'parceiro_fundador',
  criado_em  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- clients
-- ----------------------------------------------------------------------------

create table clients (
  id                                uuid primary key default gen_random_uuid(),
  advisor_id                        uuid not null references advisors (id) on delete cascade,

  -- Dados pessoais
  nome                              text not null,
  data_nascimento                   date,
  idade                             integer,
  profissao                         text,
  estado_civil                      text,

  -- Estilo de vida
  esporte_favorito                  text,
  hobbies                           text,

  -- Financeiro
  salario_liquido                   numeric(14, 2),
  outras_rendas                     jsonb not null default '[]'::jsonb,
  renda_mensal                      numeric(14, 2),
  despesa_mensal_base               numeric(14, 2),
  despesas_temporarias              jsonb not null default '[]'::jsonb,
  despesa_mensal                    numeric(14, 2),
  patrimonio_investido              numeric(14, 2),
  local_aplicado                    text,
  tem_investimento_exterior         boolean not null default false,
  valor_investimento_exterior       numeric(14, 2),

  -- Participação societária
  tem_participacao_societaria       boolean not null default false,
  valor_participacao                numeric(14, 2),

  -- Aposentadoria
  idade_aposentadoria               integer,
  expectativa_vida                  integer,
  pretensao_salarial_aposentadoria  numeric(14, 2),

  -- Planos futuros
  pretende_adquirir_bens            boolean not null default false,
  e_clt                             boolean not null default false,
  tem_seguro_vida                   boolean not null default false,

  -- Saúde e risco
  peso_kg                           numeric(5, 2),
  altura_cm                         integer,
  possui_patologia                  boolean not null default false,
  patologias                        text,
  usa_medicamentos                  boolean not null default false,
  medicamentos                      text,
  fuma                              boolean not null default false,
  anda_moto                         boolean not null default false,
  frequencia_moto                   text,

  criado_em                         timestamptz not null default now(),
  atualizado_em                     timestamptz not null default now()
);

create index clients_advisor_id_idx on clients (advisor_id);

-- ----------------------------------------------------------------------------
-- spouses (1:1 com clients)
-- ----------------------------------------------------------------------------

create table spouses (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null unique references clients (id) on delete cascade,
  nome             text not null,
  data_nascimento  date,
  dependente       boolean not null default false
);

-- ----------------------------------------------------------------------------
-- children (1:N com clients)
-- ----------------------------------------------------------------------------

create table children (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients (id) on delete cascade,
  nome             text not null,
  data_nascimento  date,
  dependente       boolean not null default false
);

create index children_client_id_idx on children (client_id);

-- ----------------------------------------------------------------------------
-- properties (1:N com clients) — imóveis e automóveis
-- ----------------------------------------------------------------------------

create table properties (
  id                         uuid primary key default gen_random_uuid(),
  client_id                  uuid not null references clients (id) on delete cascade,
  tipo                       property_tipo not null,
  valor                      numeric(14, 2),
  financiado                 boolean not null default false,
  adquirido_apos_casamento   boolean not null default false,
  subtipo                    text,
  modelo                     text,
  financiamento_termino      date,
  parcela_financiamento      numeric(14, 2)
);

create index properties_client_id_idx on properties (client_id);

-- ----------------------------------------------------------------------------
-- goals (1:N com clients) — objetivos de curto/médio/longo prazo
-- ----------------------------------------------------------------------------

create table goals (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients (id) on delete cascade,
  prazo            goal_prazo not null,
  descricao        text not null,
  valor_estimado   numeric(14, 2),
  horizonte_anos   integer
);

create index goals_client_id_idx on goals (client_id);

-- ----------------------------------------------------------------------------
-- assumptions (1:1 com clients) — premissas editáveis do motor de cálculo
-- ----------------------------------------------------------------------------

create table assumptions (
  id                          uuid primary key default gen_random_uuid(),
  client_id                   uuid not null unique references clients (id) on delete cascade,
  inflacao_projetada          numeric(6, 4),
  cdi_atual                   numeric(6, 4),
  rentabilidade_real_padrao   numeric(6, 4)
);

-- ----------------------------------------------------------------------------
-- Trigger: mantém clients.atualizado_em em dia a cada UPDATE
-- ----------------------------------------------------------------------------

create function set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger clients_set_atualizado_em
  before update on clients
  for each row
  execute function set_atualizado_em();

-- ============================================================================
-- Row Level Security
-- Regra geral: o advisor autenticado só enxerga/mexe nos próprios dados.
-- Nas tabelas filhas de clients, checa via subquery que o client_id
-- pertence a um cliente cujo advisor_id = auth.uid().
-- ============================================================================

alter table advisors    enable row level security;
alter table clients     enable row level security;
alter table spouses     enable row level security;
alter table children    enable row level security;
alter table properties  enable row level security;
alter table goals       enable row level security;
alter table assumptions enable row level security;

-- ----------------------------------------------------------------------------
-- advisors: cada advisor só acessa o próprio registro (id = auth.uid())
-- ----------------------------------------------------------------------------

create policy "advisors_select_own"
  on advisors for select
  using (id = auth.uid());

create policy "advisors_insert_own"
  on advisors for insert
  with check (id = auth.uid());

create policy "advisors_update_own"
  on advisors for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- clients: advisor_id = auth.uid()
-- ----------------------------------------------------------------------------

create policy "clients_select_own"
  on clients for select
  using (advisor_id = auth.uid());

create policy "clients_insert_own"
  on clients for insert
  with check (advisor_id = auth.uid());

create policy "clients_update_own"
  on clients for update
  using (advisor_id = auth.uid())
  with check (advisor_id = auth.uid());

create policy "clients_delete_own"
  on clients for delete
  using (advisor_id = auth.uid());

-- ----------------------------------------------------------------------------
-- spouses: client_id pertence a um client do advisor autenticado
-- ----------------------------------------------------------------------------

create policy "spouses_select_own"
  on spouses for select
  using (
    exists (
      select 1 from clients c
      where c.id = spouses.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "spouses_insert_own"
  on spouses for insert
  with check (
    exists (
      select 1 from clients c
      where c.id = spouses.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "spouses_update_own"
  on spouses for update
  using (
    exists (
      select 1 from clients c
      where c.id = spouses.client_id
        and c.advisor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from clients c
      where c.id = spouses.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "spouses_delete_own"
  on spouses for delete
  using (
    exists (
      select 1 from clients c
      where c.id = spouses.client_id
        and c.advisor_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- children: client_id pertence a um client do advisor autenticado
-- ----------------------------------------------------------------------------

create policy "children_select_own"
  on children for select
  using (
    exists (
      select 1 from clients c
      where c.id = children.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "children_insert_own"
  on children for insert
  with check (
    exists (
      select 1 from clients c
      where c.id = children.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "children_update_own"
  on children for update
  using (
    exists (
      select 1 from clients c
      where c.id = children.client_id
        and c.advisor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from clients c
      where c.id = children.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "children_delete_own"
  on children for delete
  using (
    exists (
      select 1 from clients c
      where c.id = children.client_id
        and c.advisor_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- properties: client_id pertence a um client do advisor autenticado
-- ----------------------------------------------------------------------------

create policy "properties_select_own"
  on properties for select
  using (
    exists (
      select 1 from clients c
      where c.id = properties.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "properties_insert_own"
  on properties for insert
  with check (
    exists (
      select 1 from clients c
      where c.id = properties.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "properties_update_own"
  on properties for update
  using (
    exists (
      select 1 from clients c
      where c.id = properties.client_id
        and c.advisor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from clients c
      where c.id = properties.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "properties_delete_own"
  on properties for delete
  using (
    exists (
      select 1 from clients c
      where c.id = properties.client_id
        and c.advisor_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- goals: client_id pertence a um client do advisor autenticado
-- ----------------------------------------------------------------------------

create policy "goals_select_own"
  on goals for select
  using (
    exists (
      select 1 from clients c
      where c.id = goals.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "goals_insert_own"
  on goals for insert
  with check (
    exists (
      select 1 from clients c
      where c.id = goals.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "goals_update_own"
  on goals for update
  using (
    exists (
      select 1 from clients c
      where c.id = goals.client_id
        and c.advisor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from clients c
      where c.id = goals.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "goals_delete_own"
  on goals for delete
  using (
    exists (
      select 1 from clients c
      where c.id = goals.client_id
        and c.advisor_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- assumptions: client_id pertence a um client do advisor autenticado
-- ----------------------------------------------------------------------------

create policy "assumptions_select_own"
  on assumptions for select
  using (
    exists (
      select 1 from clients c
      where c.id = assumptions.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "assumptions_insert_own"
  on assumptions for insert
  with check (
    exists (
      select 1 from clients c
      where c.id = assumptions.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "assumptions_update_own"
  on assumptions for update
  using (
    exists (
      select 1 from clients c
      where c.id = assumptions.client_id
        and c.advisor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from clients c
      where c.id = assumptions.client_id
        and c.advisor_id = auth.uid()
    )
  );

create policy "assumptions_delete_own"
  on assumptions for delete
  using (
    exists (
      select 1 from clients c
      where c.id = assumptions.client_id
        and c.advisor_id = auth.uid()
    )
  );
