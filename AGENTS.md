<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent collaboration rules

Use this file as the shared contract for Claude Code, Codex and Claudinho.
Keep prompts short: reference only the skill files needed for the task.

## Roles

- Claude Code: implements the requested change.
- Codex: reviews only; does not edit unless explicitly asked.
- Claudinho: orchestrates, verifies, decides next prompt/PR/merge with Gabriel.

## Default rules

- Smallest correct diff.
- One writer per branch/worktree.
- Do not use `git add .` or `git add -A`; stage explicit paths.
- Do not open PR, merge, change Supabase, or change secrets unless the prompt explicitly asks.
- Do not commit `.env*`, tokens, credentials, dumps, or real client data.
- Prefer existing code and modules over new abstractions/dependencies.
- Financial calculations belong in `lib/calculos.ts` or an existing calculation module; UI displays results.

## Shared skill files

- `.agent-skills/ponytail.md` — minimal diffs and anti-overbuild.
- `.agent-skills/security.md` — Supabase/Auth/RLS/secrets/LGPD guardrails.
- `.agent-skills/design.md` — module seams and calculation/UI boundaries.
- `.agent-skills/review-only.md` — Codex review contract.
- `.agent-skills/qa.md` — verification checklist for this product.

## Standard checks

Run the smallest relevant check first, then before final handoff run:

```bash
npm test -- --run
npm run lint
npm run build
npx tsc --noEmit
```

If a known preexisting failure appears, prove it against `main` or state why you could not.
