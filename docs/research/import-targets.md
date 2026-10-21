# Import targets: which budgeting apps Danfo can feed

Researched 2026-10-20 from each app's own docs, official sample files and, where docs were thin,
the app's source code. This is the source of truth the writers rule points at: a target enters
`TARGETS` only when its format is confirmed here (or from a real export) and locked by tests.

Danfo hands the user a file. It never uses an app's API, login or sync. So "convertible" means
the app has a manual file import we can produce exactly.

Verdicts: **Convertible** (documented, we can target it exactly), **Unconfirmed** (import exists,
details undocumented, needs a real export), **Not possible** (no manual file import, or no way
to carry naira), **Unclear**.

## The headline: OFX

OFX is the bank-statement interchange format. It declares its own currency (`CURDEF`, ISO 4217,
so `NGN` is valid), carries a per-transaction id (`FITID`) that importers use to skip
duplicates, and has one unambiguous date form (`YYYYMMDD`). Apps that import it with no column
mapping at all: Wallet, Actual, Goodbudget, Toshl, Money Pro, GnuCash, HomeBank, KMyMoney,
Money Manager Ex, Moneydance, Banktivity, MoneyWiz, Buckets. YNAB takes it too but prefers CSV.

One OFX writer therefore reaches more apps correctly than any CSV. QIF is skipped: the file
cannot declare its date order, so 03/04 can land in the wrong month without warning, and it
reaches no app OFX misses.

OFX rules Danfo follows (OFX 2.2 spec,
https://financialdataexchange.org/wp-content/uploads/2025/12/OFX-2.2.pdf):

- `TRNAMT` is signed from the customer's side: money out gets a leading `-`. That is a string
  prefix on the DecimalString, never number math.
- `FITID` is unique within the account, at most 32 characters recommended, and **deterministic**:
  the same statement row always yields the same id, or re-import dedupe breaks.
- `NAME` is capped at 32 characters, so the full narration goes in `MEMO` (up to 255). Money
  Manager Ex ignores `NAME` and reads `MEMO`.
- One element per line, every element closed: Money Manager Ex converts line by line.
- Wallet accepts OFX 2.2 (XML) only, so Danfo writes the XML form.

## Mobile and web apps

| App | Verdict | Import | Format | Naira | Notes |
|---|---|---|---|---|---|
| Wallet (BudgetBakers) | Convertible | Web app only, into a "General" account (disconnect a bank-linked one first). One account and one currency per file. ~1,000 rows | CSV, XLSX, OFX 2.2. CSV: mapping wizard, required Amount + Date, one signed amount (`-100.00`), no thousands separators, dates `yyyy-MM-dd` (time dropped) | Yes, if the account is NGN | Categorises from Note and Payee itself. Imports free. Named in a Nigerian budget-app roundup |
| Money Manager (Realbyte) | Convertible | Android: More > Backup > Import Excel. iOS: via Finder | TSV, columns `Date, Account, Category, Subcategory, Note, Amount, Income/Expense, Description`. Template in `samples/` | Sub-currency variant has a Currency column | Account and Category are mandatory and must match the app. Dates `mm/dd/yyyy` (article 360043223253, example 11/15/2023). **Open:** its two official articles disagree on the expense word ("Expenses" and "Transfer-Out" in 360043223253, "Expense" and "Transfer out" in 360043536233). Writer built, held out of the picker until a real export settles it |
| Cashew | Convertible | In-app CSV import (Android, iOS, web) | Lowercase headers matched exactly: `date`, `amount`, `category`, `wallet`, optional `title`, `note`. One signed amount, plain `1000.50`. Many date patterns incl. time | Currency from the wallet | Auto-creates unknown categories by name, so a placeholder is needed. A blank wallet column means the open wallet. Menu: Import & Export, Import CSV File. Open source (GPL-3.0). **Shipped** |
| Bluecoins | Convertible, confirm with a real template | Settings > Data > Excel (.csv) | 12-column template: `Type, Date, Item or Payee, Amount, Category Type, Category, Account Type, Account, Notes, Label, Status, Split`. Type `e`/`i`/`t` | Advanced template adds Currency | Blank Category handling undocumented |
| Spendee | Unconfirmed | Web app, cash wallets only | CSV/XLS(X), needs date format, date, category, amount | One currency per file | Docs from 2021 |
| Money Pro | Unconfirmed | iOS, Android, desktop | OFX or CSV with column assignment, signed amount | Has a Currency column | Date formats undocumented. Subscription |
| Wally | Unclear | | | | The original Wally appears dead. A different "Wally Budgeting" has a documented CSV |
| Monefy, Money Lover, 1Money | Not possible | | | | Backup and restore of their own formats only |

Sources: support.budgetbakers.com articles 7077275632274, 7152318099346, 7002819743250;
help.realbyteapps.com 360043223253, 360043536233; github.com/jameskokoska/Cashew
(`budget/lib/widgets/importCSV.dart`); bluecoinsapp.com/guide/import-export;
help.spendee.com/article/121-import-transactions; money.pro/faq; monefy.com/faq;
note.moneylover.me/how-to-export-to-csv-or-excel.

## Western budgeting apps

| App | Verdict | Import | Format | Naira | Notes |
|---|---|---|---|---|---|
| YNAB | Convertible | Web or iPad, File-Based Import | CSV preferred, mapping UI. `Date,Payee,Memo,Outflow,Inflow` | Plan currency is free-form | Categories never import. Zero-amount rows now import as 0 transactions, so drop them. CSV date formats undocumented: `YYYY-MM-DD` needs a real test |
| Actual Budget | Convertible | Import in the account | OFX recommended by its docs. CSV: six date orders, auto-maps on `date`/`amount`/`payee`/`notes` headers | Amounts unitless | Without an `amount` header it guesses the first numeric column |
| Goodbudget | Convertible | Web, Transactions > Import Bank Transactions | OFX/QFX recommended. CSV: `Date,Name,Amount`, `MM/DD/YYYY` or `DD/MM/YYYY` only, one signed amount. Sample in `samples/` | Currency-neutral | Any other date shows as 1969 |
| Toshl | Convertible | Web app only | OFX/QFX/QIF need no mapping. CSV template in `samples/` (10 columns, UTF-8 BOM, `DD/MM/YYYY`) | Per-row currency | Free plan: 2 accounts |
| Lunch Money | Convertible | Web, Transactions > Import | CSV `date,payee,amount,notes`, `YYYY-MM-DD` | Currency picked at upload | Which sign means spending is not stated |
| Quicken Simplifi | Convertible | Web only | CSV `Date,Payee,Amount,Category,Tags,Notes,Check_No`, `M/D/YYYY`, signed. Template in `samples/` | Not stated | |
| Tiller | Convertible | Tiller Console > Import CSV | `Date,Description,Amount`, `MM/DD/YYYY`, spending negative | Not stated | No dedupe |
| Monarch | Not possible for naira | Web, Import transaction history | CSV `Date,Account,Amount` | **No.** Every amount displays as `$`; accounts are USD/CAD | The import path exists; the currency is the blocker |
| PocketGuard | Unconfirmed | "Generic" file import, Plus tier | Undocumented (page blocks fetchers) | | |
| Emma | Unconfirmed | CSV into an offline account, Pro/Ultimate | Date, payment reference, amount; rest undocumented | | |
| Copilot, EveryDollar | Not possible | | | | No general file import |
| Buddy | Unclear | | | | Third-party listing says no file import |

Sources: support.ynab.com/en_us/file-based-import-a-guide-Bkj4Sszyo;
actualbudget.org/docs/transactions/importing and
github.com/actualbudget/actual (`ImportTransactionsModal/utils.ts`);
goodbudget.com/help/using-accounts/how-to-import-csv;
toshl.com/blog/how-to-import-financial-data-web-app;
support.lunchmoney.app/guides/import-via-csv;
support.simplifi.quicken.com/en/articles/4413430;
help.tiller.com/en/articles/12159768;
help.monarch.com/hc/en-us/articles/4409682789908 and 360048393552;
everydollar.help.ramseysolutions.com/hc/en-us/articles/360037960692;
help.copilot.money/en/articles/8587945.

## Desktop and self-hosted

| App | Verdict | Best format | Notes |
|---|---|---|---|
| GnuCash | Convertible | OFX (pick the account once) | NGN in its ISO table. Free |
| HomeBank | Convertible | OFX with FITID dedupe | Its own CSV is semicolon-separated with a payment-code column. Free |
| KMyMoney | Convertible | OFX plugin | NGN present. Free |
| Money Manager Ex | Convertible | OFX (1.9.x) | Reads FITID, DTPOSTED, TRNAMT, MEMO only; one tag per line. Free |
| Moneydance | Convertible | OFX first, then QIF | Imports arrive "Unconfirmed" |
| Banktivity | Convertible | OFX | Duplicates screened |
| MoneyWiz | Convertible | OFX | |
| Buckets | Unconfirmed | OFX/QFX per changelog | |
| Firefly III | Not for Danfo's users | CSV or CAMT only, self-hosted Data Importer with column roles | Needs a config file and a self-hosted install |
| Quicken | Not via QFX | QFX checks a list of participating banks; Nigerian banks are not on it, and faking a bank id is spoofing | Windows CSV import exists, editions unclear |

Sources: code.gnucash.org/docs/C/gnucash-manual/trans-import.html;
gethomebank.org/help/use-import.html and misc-csvformat.html;
docs.kde.org (KMyMoney OFX import); github.com/moneymanagerex/moneymanagerex
(`src/import_export/ofx_import_gui.cpp`); infinitekind.tenderapp.com (Moneydance manual
downloads); banktivity.com/content/help/v9/importing/file_import.php;
help.wiz.money/en/collections/2553010-importing; github.com/buckets/application CHANGELOG;
github.com/firefly-iii/docs; info.quicken.com/win/import-transactions-from-csv-file.

## The placeholder category

Some apps (Money Manager, Cashew, Bluecoins, Spendee) refuse a row without a category, or
create one from whatever name they get. For those, Danfo writes the fixed word
**Uncategorised** on every row. It is not a guess: every row gets the same label, and the user
sorts them in their own app. The rule is in `docs/rules/writers.md`, and the import instruction
for each such app tells the user up front.

## Before any of these ships

The writers rule still applies: confirm with one real import per app, then lock the exact output
in tests. Order of real-import checks for OFX: Money Manager Ex and GnuCash (strictest parsers),
then Wallet (XML only), then Actual, Goodbudget, Toshl.
