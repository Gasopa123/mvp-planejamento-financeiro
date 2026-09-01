# Advisor signup restriction

Status: implemented in migration `011_restrict_advisor_signup.sql`.

## Behavior

New Supabase Auth users become advisors only if their email exists in `public.advisor_invites` with `used_at is null`.

If there is no invite, `handle_new_advisor()` raises:

```text
Cadastro restrito a assessores convidados.
```

That aborts automatic advisor provisioning.

## Creating an invite

Run manually in Supabase SQL Editor with the real advisor email:

```sql
insert into public.advisor_invites (email, nome)
values (lower('advisor@example.com'), 'Nome do Assessor')
on conflict (email) do update
  set nome = excluded.nome,
      used_at = null;
```

Then create the Auth user through the approved admin flow.

## Notes

- The client app no longer exposes public signup.
- `advisor_invites` has RLS enabled and no anon/authenticated policies.
- The trigger uses `security definer` with `search_path = ''` and fully qualified tables.
