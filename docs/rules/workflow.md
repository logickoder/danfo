# Workflow

## Human in the loop

No `git commit`, `git push`, `gh pr create`, `gh release create`, or deploy without explicit
owner command in the current turn. Edit, save, halt.

## Surgical edits

Touch what the task needs. Do not restyle the page while fixing a writer, do not refactor the
registry while wiring Turnstile.

## The gate

`pnpm typecheck && pnpm lint && pnpm test` clean before any work is called done.

## Response format

State change: terse confirmation with file and function. Diagnosis: root cause in a sentence
or two, then the fix. Refusal: cite the rule. Never apologize.
