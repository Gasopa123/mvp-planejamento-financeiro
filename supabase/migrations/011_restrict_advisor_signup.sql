-- ============================================================================
-- Restrict advisor provisioning to invited emails.
--
-- Public signup exists at Supabase Auth level, so the database trigger must not
-- auto-provision every new auth.users row as an advisor. Only emails present in
-- public.advisor_invites are allowed to become advisors.
-- ============================================================================

create table if not exists public.advisor_invites (
  email text primary key,
  nome text,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

alter table public.advisor_invites enable row level security;

-- No anon/authenticated policies on purpose: invites are managed manually by an
-- admin/service role in Supabase, not by the client app.

create or replace function public.handle_new_advisor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.advisor_invites%rowtype;
begin
  select *
    into v_invite
    from public.advisor_invites
   where email = lower(new.email)
     and used_at is null;

  if not found then
    raise exception 'Cadastro restrito a assessores convidados.';
  end if;

  insert into public.advisors (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', v_invite.nome, '')
  );

  update public.advisor_invites
     set used_at = now()
   where email = v_invite.email;

  return new;
end;
$$;
