# Danfo: PRD

**Status:** v1 in build. **License:** MIT. **Stack:** Next.js 16 + Tailwind v4.
**Parse dependency:** [bankstract-cloud](https://github.com/logickoder/bankstract-cloud)'s
hosted `/v1/parse` (engine: [bankstract](https://github.com/logickoder/bankstract), MIT).

## The gap

No budgeting app's bank sync reaches Nigeria. Plaid, Yodlee, Salt Edge: none of them connect a
GTB or Opay account. A Nigerian using YNAB, Actual Budget, Goodbudget or Toshl is stuck typing
transactions by hand, because "connect your bank" is a button that does nothing for them. The
only real path is: download the PDF statement, convert it by hand into whatever CSV that app
wants, import it. Danfo is that conversion step, done properly.

`budgetbakers-wallet-importer` proved the shape for one app as a CLI. Danfo widens it to more apps
and gives it a UI a non-technical person will actually use.

## The name

Danfo is the yellow Lagos bus. It carries anything, anywhere, cheap, for everyone. That is the
product: it carries your transactions from your bank to your budget app.

Lockup rule: the name never travels alone. Everywhere it appears in public it ships as
"Danfo: statement to budget app". The transport name reads as logistics without context; four
words resolve it, and the mismatch is what makes it stick.

## What it does

One page. Three stops, drawn as a bus route:

1. **Drop your statement.** PDF from any bank the bankstract engine supports. Tap-to-upload
   first-class: most users arrive on a phone with the statement already in downloads.
2. **Pick your app.** A grid of budgeting apps by name. The user picks the app they use, not a
   file format. Two apps can share one writer under the hood; the user never sees that.
3. **Download and import.** The file comes down named for the trip, e.g.
   `ynab-gtb-2026-08.csv`, with a one-line import instruction for that specific app under the
   button.

No OAuth, no sync, no account, no saved history. One-shot file conversion.

## Target apps

Every target's import format, sources and quirks live in
[docs/research/import-targets.md](./docs/research/import-targets.md). Summary:

| App | File | Status |
|---|---|---|
| YNAB | CSV `Date,Payee,Memo,Outflow,Inflow` | v1. CSV date format needs one real import to confirm |
| Actual Budget | OFX 2.2 | v1, its docs recommend OFX |
| Goodbudget | OFX 2.2 | v1, its docs recommend OFX |
| Toshl | OFX 2.2 | v1 |
| Wallet (BudgetBakers) | OFX 2.2 | v1, web app, into a General (not bank-linked) account |
| GnuCash, HomeBank, KMyMoney, Money Manager Ex, Moneydance, Banktivity, MoneyWiz, Money Pro | the same OFX | v1, behind "More apps" in the picker |
| Lunch Money | CSV | next |
| Cashew | CSV with the `Uncategorised` placeholder | v1, behind "More apps" |
| Money Manager (Realbyte) | TSV with the `Uncategorised` placeholder | writer built; held until a real export settles its expense word |
| Bluecoins | CSV with the placeholder | later, needs a real template |

One OFX writer serves most targets: it carries the currency, has one unambiguous date form and
a stable per-row id that importers use to skip duplicates.

Not targeting: Copilot, EveryDollar, Monefy, Money Lover, 1Money (no manual file import),
Monarch (shows every amount as `$`), Firefly III (self-hosted, needs a config file), Quicken QFX
(would mean faking a bank id).

## Design

Full spec in [DESIGN.md](./DESIGN.md). The short version: light theme, danfo yellow and ink
black, Anton for display, Inter for body, JetBrains Mono for every naira amount. Hard 2px
borders and flat offset shadows, grounded in hand-painted danfo panels. Motion is in-world
only: the bus driving, idling, pulling into stops, nothing a generic SaaS template would do.
Pidgin as seasoning in the copy, never the whole dish.

## Architecture

- Next.js 16, one page, one API proxy route. Writers are pure TypeScript functions running
  client-side; only the parse call needs a server.
- `src/writers/`: generic formats in `formats/` (CSV, OFX), app-shaped writers in `apps/`, a
  registry (`TARGETS`) as the single source the UI reads. Adding an app is one entry plus at
  most one new writer file.
- The proxy holds the bankstract-cloud API key server-side and hard-fails on the `_sample`
  marker (bankstract's over-cap canned response). Converting that response would hand a user
  fake transactions; the check is non-negotiable.
- Hosting: Cloudflare Workers via the OpenNext adapter (`wrangler.jsonc`). Not Vercel: its functions cap request bodies at 4.5MB, under our 15MB upload limit. Domain: `danfo.logickoder.dev` first, TLD if usage validates.

## Privacy

The statement is parsed in memory by bankstract's worker and never written to disk. Danfo
stores nothing, has no accounts, and the conversion to your app's format happens in your own
browser. The only counting is how many conversions happened and for which target app, never
what was in them.

## Distribution

Search and communities, not ads.

- Programmatic SEO: one page per (bank, app) pair, e.g. "GTBank statement to YNAB", under a hub
  per bank and per app. The set grows automatically as the engine ships banks. Each page earns
  its place with facts only it has (the bank's checks, the app's notes, the real file the app
  gets), so it never reads as a doorway page. Watch Search Console for pages left out; the
  fallback is noindex on the long tail, never thinner pages.
- Communities where the pain lives: r/ynab, r/actualbudget, the Actual Discord, Nairaland's
  personal-finance board, Nigerian money-Twitter. Launch post is the honest builder story.
- A listing PR to bank2ynab's converter directory.

## Roadmap

**v1:** YNAB (CSV) plus 12 apps on one OFX writer (Actual, Goodbudget, Toshl and Wallet up
front, the desktop apps, Money Pro and Cashew behind "More apps"), four live banks, the landing page,
SEO pairs.
**v1.1:** Lunch Money, Realbyte and Bluecoins once each is confirmed with a real import; per-bank pages generated from the
engine's parser list.
**v2 trigger, not plan:** batch upload, email-in convenience, possibly a paid tier, if repeat
usage justifies any of them. Accounts arrive here and only here: every v2 feature needs
identity (history, email-in, billing), and nothing before it does. Until then "no account,
nothing stored" stays the trust line, verbatim.

## Out of scope

- OAuth or live sync into any budgeting app
- Parsing logic (bankstract's job, permanently)
- Categorization (writers leave it blank; the budget app guesses better from its own memory)
- Billing, accounts, saved history
- Statement-download automation
