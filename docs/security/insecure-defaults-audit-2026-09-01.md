# Insecure defaults audit — 2026-09-01

Tool: Codex plugin `insecure-defaults@trailofbits` 2.0.0.
Scope: `app components lib supabase middleware.ts proxy.ts next.config.ts package.json`.

## Veredito

Bloquear produção até decidir/corrigir provisionamento de assessores.

## Achados

### Alta — cadastro público cria contas de assessor

`app/cadastro/page.tsx` permite `signUp`; `supabase/migrations/002_auth_trigger.sql` cria automaticamente um registro em `advisors`.

Risco: qualquer visitante pode virar assessor se o produto não for deliberadamente self-service.

### Média — senha mínima de 6 caracteres

Cadastro e redefinição aceitam `minLength={6}` / validação de 6 caracteres.

Arquivos:
- `app/cadastro/page.tsx`
- `app/redefinir-senha/page.tsx`

A política efetiva também precisa ser configurada no Supabase Auth.

### Média — `SECURITY DEFINER` com `search_path = public`

`create_client_full` usa `security definer` e `search_path = public` nas migrations 003–010.

Risco: função privilegiada resolvendo objetos não qualificados em schema mutável.

### Baixa — headers HTTP ausentes

`next.config.ts` não define CSP, `X-Content-Type-Options`, `Referrer-Policy` ou restrição de framing.

### Baixa — endpoint público expõe detalhe de erro upstream

`app/api/indicadores/route.ts` retorna `error.message` no JSON.

## Checks rodados pelo audit

- `npm audit --omit=dev --json`: 0 vulnerabilidades.
- `npm test -- --run`: 185 testes passaram.
- `npm run lint`: passou.
- `npx tsc --noEmit`: passou.
- `npm run build`: passou.

## Notas

- RLS está habilitada e restringe dados por `auth.uid()` nas tabelas auditadas.
- Ações críticas também filtram por assessor.
- Não foram encontrados secrets hardcoded, `service_role`, HTML inseguro ou acesso direto entre assessores.
