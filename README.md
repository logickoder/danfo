# Danfo: statement to budget app

Turn a Nigerian bank statement PDF into the exact import file your budgeting app accepts.
Upload, pick your app, download, import it yourself. Free. No account. Nothing stored.

No budgeting app's bank sync reaches Nigeria. Danfo is the missing step: it carries your
transactions from your bank's PDF to YNAB, Actual Budget, Goodbudget or Toshl.

## How it works

1. Drop your statement PDF. It is parsed in memory by the
   [bankstract](https://github.com/logickoder/bankstract) engine (via
   [bankstract-cloud](https://github.com/logickoder/bankstract-cloud)'s API) and never written
   to disk.
2. Pick the app you budget in.
3. Download the file, shaped exactly how that app imports, and bring it in yourself.

No OAuth, no sync, no saved history. One-shot file conversion.

## Development

```bash
pnpm install
cp .env.example .env.local   # fill DANFO_API_KEY
pnpm dev

pnpm typecheck
pnpm lint
pnpm test
```

Writers live in `src/writers/`, one function per target format, all consuming the same
`ParseResponse` shape. Adding a budgeting app is a new entry in `src/writers/index.ts`; see
[CONTRIBUTING.md](./CONTRIBUTING.md) for the bar.

Money is a decimal string end to end. Never `Number()` a naira amount.

Product spec: [PRD.md](./PRD.md). Visual system: [DESIGN.md](./DESIGN.md). Agent charter:
[AGENTS.md](./AGENTS.md).

## License

MIT. Built on [bankstract](https://github.com/logickoder/bankstract) by
[logickoder](https://logickoder.dev).
