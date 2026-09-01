# Agent skills index

Shared lightweight rules for Claude Code, Codex and Claudinho.

In prompts, reference only what the task needs:

```text
Leia .agent-skills/README.md.
Para esta tarefa, siga .agent-skills/ponytail.md e .agent-skills/security.md.
```

## Files

- `ponytail.md` — minimum useful diff, no overbuild.
- `security.md` — Supabase/Auth/RLS/secrets/LGPD guardrails.
- `design.md` — module seams and calculation/UI boundaries.
- `review-only.md` — Codex review-only contract.
- `qa.md` — production QA checklist.

## Default workflow

```text
Gabriel -> Claudinho -> Claude Code -> Codex -> Claudinho -> PR/merge decision
```

- Claude Code writes code.
- Codex reviews without editing.
- Claudinho verifies with real commands and prepares next prompt.

## Default checks

```bash
npm test -- --run
npm run lint
npm run build
npx tsc --noEmit
```

## Git rules

- Stage explicit paths only.
- Never use `git add .` or `git add -A`.
- Do not open PR, merge, push to main, or change secrets unless explicitly asked.
