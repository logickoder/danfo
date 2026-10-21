# Out of scope: do not add

- OAuth or live sync into any budgeting app. Danfo makes files.
- Parsing logic. That is bankstract's job, permanently.
- Categorization. Writers leave category fields blank, or write the fixed placeholder
  `Uncategorised` where an app refuses a blank (docs/rules/writers.md). Never a guessed category:
  the budget app learns the user's categories better.
- Billing, accounts, saved history. These unlock together at v2 if its triggers fire
  (PRD.md roadmap), never piecemeal before it.
- Any target app without a confirmed manual-import path (Copilot, EveryDollar, Monefy, Money
  Lover, 1Money), or whose import cannot carry naira (Monarch shows every amount as `$`).
  Evidence per app is in docs/research/import-targets.md.
- Statement-download automation (logging into bank portals).

If asked, push back and cite PRD.md.
