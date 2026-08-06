-- ============================================================================
-- Trigger: cria automaticamente um advisor ao surgir um novo auth.users.
--
-- Rodar manualmente no SQL Editor do Supabase, após supabase/schema.sql.
-- ============================================================================

create or replace function public.handle_new_advisor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.advisors (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_advisor();
