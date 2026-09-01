# Design rules for this repo

Use when touching dashboard, calculations, wizard, Supabase payloads, or shared helpers.

## Module seams

- Financial rules live in `lib/calculos.ts` or an existing calculation module.
- UI components display results and handle interaction; they should not own business math.
- If multiple tabs need the same projection, create/reuse one calculation helper.
- Prefer deep modules: small interface, useful behavior hidden inside.
- Do not create service/factory/interface layers for future possibilities.

## Product consistency

Dashboard, Simulations, Plan, and Presentation must tell the same financial story for the same client.
If two numbers intentionally differ, label them differently.

## Current product rules

- Emergency reserve = 4x monthly expense.
- Objectives with value + valid horizon affect the future curve as withdrawals.
- Objectives without horizon do not generate monthly aporte or curve impact.
- Retirement exhaustion is different from pre-retirement deficit caused by objectives.
