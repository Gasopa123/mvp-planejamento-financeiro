# Review-only contract

Use mainly for Codex.

## Rules

- Do not edit files.
- Do not commit.
- Do not push.
- Do not open PR.
- Report only objective findings.

## Review focus

- Security regressions.
- Financially misleading output.
- Dashboard vs presentation contradictions.
- Missing validation at trust boundaries.
- Missing regression tests for changed behavior.
- Overengineering or broad diffs outside scope.

## Output

- Veredito: aprovado / aprovado com ressalvas / bloquear.
- Segurança: objective findings.
- Cálculo/UX: objective findings.
- Testes rodados: command + result.
- Recomendações antes do merge: only real blockers.
