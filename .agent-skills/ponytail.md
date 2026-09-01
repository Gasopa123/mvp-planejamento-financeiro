# Ponytail — minimum useful diff

Use when implementing or reviewing code in this repo.

## Rules

- Smallest correct diff wins.
- Do not create abstractions for one caller.
- Do not add dependencies for simple code.
- Prefer deleting code over adding code.
- Reuse existing helpers before writing new ones.
- Fix root cause once, not symptoms in each caller.
- No redesign or refactor unless the task explicitly asks.

## Bug fixes

Before editing, trace every caller of the function/module you are changing.
A one-line fix in the shared calculation module is better than guards in each UI tab.

## Tests

Non-trivial logic needs one small regression test. No giant test scaffolding unless asked.
