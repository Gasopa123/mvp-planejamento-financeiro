# QA checklist for MVP planejamento financeiro

Use before saying the product is production-ready.

## Technical checks

```bash
npm test -- --run
npm run lint
npm run build
npx tsc --noEmit
```

If a failure is preexisting, prove it against `main` or say why you cannot.

## Functional QA

Test with synthetic clients only:

- healthy/conservative client;
- no initial patrimonio + positive aporte;
- large objective before retirement;
- absurd objective before retirement;
- no/negative monthly capacity;
- near-retirement client;
- invalid retirement age;
- invalid life expectancy;
- objective without horizon;
- insurance/property/car yes/no and removing the last asset.

## Must be consistent

- Dashboard tabs, Plan, Simulations, and Presentation tell the same story.
- Objectives with valid horizon affect the curve once, not twice.
- Pre-retirement deficit is not retirement exhaustion.
- Invalid ages do not produce optimistic verdicts.
- Emergency reserve is 4x monthly expense.
- Real vs nominal labels are clear.
- App reload/persistence works when Supabase credentials are available.

## Report shape

- Veredito: pronto / quase pronto / bloquear.
- Tested scenarios: expected vs observed.
- Bugs: severity, screen, steps, expected, actual.
- Technical checks: command + result.
- Recommendation: merge/produce or fix first.
