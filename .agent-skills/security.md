# Security guardrails

Use on every change touching auth, Supabase, data access, client records, env vars, or logs.

## Hard rules

- Never commit secrets, `.env*`, tokens, credentials, dumps, or real client data.
- Keep settings in code/config; secrets only in environment variables.
- Do not change Supabase schema, migrations, RPC, grants, Auth, or RLS unless explicitly requested.
- If a new persisted field is required, create a new migration; never edit old migrations.
- Do not weaken advisor isolation: data must stay scoped to the authenticated advisor.
- Do not log personal, financial, health, or family data.
- Do not render unsanitized HTML from user/customer input.

## Review checklist

- Did this expose client financial data to a broader surface?
- Did this bypass `auth.uid()`/advisor scoping?
- Did this trust browser input without validation?
- Did this add storage, cookies, localStorage, or network calls?

## Codex insecure-defaults audit

If Codex has `insecure-defaults@trailofbits` installed, run before production security review:

```text
/insecure-defaults:audit app components lib supabase middleware.ts proxy.ts next.config.ts package.json
```

Expected output: defaults reachable, sink, severity, and correction. Save notable reports under `docs/security/`.
