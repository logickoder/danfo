# Writers are the product

Pure functions that all consume the same `ParseResponse`, split by what they target:

- `src/writers/formats/`: generic file formats several apps import (CSV plumbing, OFX).
- `src/writers/apps/`: writers shaped for one app's own import layout (YNAB, Cashew, Realbyte).
- `src/writers/shared.ts`: helpers every writer uses (money-as-string, zero-row filter, the
  placeholder category).

Prefer pointing a new app at an existing format. Add an app writer only when the app needs its
own layout. The registry in `src/writers/index.ts` is the only place the UI learns about targets. A writer
does not enter `TARGETS` without:

1. the target app's real import format confirmed from its own docs or a real export, never
   guessed, and recorded with its source in
   [docs/research/import-targets.md](../research/import-targets.md), and
2. tests locking the exact output.

## Categories

Writers never guess a category. Where an app accepts a blank one, leave it blank. Where an app
refuses a row without one, or creates a category from whatever it is given, write the fixed
placeholder `Uncategorised` on every row, and say so in that target's import instruction so the
user knows to sort them. Never vary it per row.

## Shared rules for every writer

- Drop rows where both debit and credit are zero. Some apps now import them as 0 transactions.
- Write legs, not rows (`statementLegs` in `src/writers/shared.ts`). bankstract can send a row
  with both debit and credit set, and it reconciles; picking one side would drop money. Each
  side becomes its own transaction, never netted. A negative side flips direction by string,
  never "--".
- Output is deterministic: the same statement gives the byte-identical file. No timestamps of
  when the file was made, no random ids.
