import { writeCashew } from './apps/cashew'
import { writeYnab } from './apps/ynab'
import { writeOfx } from './formats/ofx'
import type { Target } from './target'

// The whole product is this registry. One entry per target budgeting app; several entries can
// share one writer (the user picks their app, never a file format). Adding an app is a new
// entry here plus, at most, a new writer file. Every entry's format and import steps come from
// docs/research/import-targets.md, which cites the app's own docs.

// One summary for every app on the OFX writer (formats/ofx.ts).
const OFX_SUMMARY =
  'An OFX 2.2 file: the format banks hand budget apps, so it imports with no column mapping and the currency travels with it.'

export const TARGETS: readonly Target[] = [
  {
    id: 'ynab',
    name: 'YNAB',
    importInstruction: 'In YNAB on the web: open the account, click Import, choose this file.',
    write: writeYnab,
    fileExtension: 'csv',
    featured: true,
    fileSummary: "A CSV in YNAB's own import columns: Date, Payee, Memo, Outflow, Inflow.",
    notes: [
      'YNAB never imports categories: you assign them in YNAB after the import.',
      'Rows that move no money are left out. YNAB would import them as zero-amount transactions.',
    ],
  },
  {
    id: 'actual',
    name: 'Actual Budget',
    importInstruction: 'In Actual: open the account, click Import, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
    fileSummary: OFX_SUMMARY,
    notes: [
      "Actual's own docs recommend OFX for imports, which is why this file is OFX and not CSV.",
    ],
  },
  {
    id: 'goodbudget',
    name: 'Goodbudget',
    importInstruction: 'In Goodbudget on the web: Transactions, Import Bank Transactions, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
    fileSummary: OFX_SUMMARY,
    notes: [
      "Goodbudget recommends OFX over CSV. Its CSV import takes only two date orders and shows any other date as 1969; OFX has one date form, so that can't happen.",
    ],
  },
  {
    id: 'toshl',
    name: 'Toshl',
    importInstruction: 'In Toshl on the web: Import, upload this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
    fileSummary: OFX_SUMMARY,
    notes: [
      'Import runs in the Toshl web app only.',
      "Toshl's free plan allows 2 accounts.",
    ],
  },
  {
    id: 'wallet',
    name: 'Wallet',
    importInstruction:
      'In Wallet on the web (web.budgetbakers.com): click Import, pick a naira account that is not bank-linked, upload this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
    fileSummary: OFX_SUMMARY,
    notes: [
      'Wallet calls that a General account. One account and one currency per file, about 1,000 rows per import.',
      'Wallet accepts OFX 2.2 only, the form this file is written in. It categorises rows from the note and payee itself.',
    ],
  },
  // Desktop and other apps that import the same OFX file with no column mapping.
  {
    id: 'gnucash',
    name: 'GnuCash',
    importInstruction: 'In GnuCash: File, Import, Import OFX/QFX, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [
      'GnuCash asks which account the file belongs to the first time, then remembers it. Naira is in its currency list.',
      'Free and open source.',
    ],
  },
  {
    id: 'homebank',
    name: 'HomeBank',
    importInstruction: 'In HomeBank: File, Import, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [
      "HomeBank uses each transaction's id to skip rows it already has, so an overlapping statement does not double up.",
      'Free and open source.',
    ],
  },
  {
    id: 'kmymoney',
    name: 'KMyMoney',
    importInstruction: 'In KMyMoney: File, Import, OFX, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [
      'KMyMoney imports OFX through its OFX plugin. Naira is in its currency list.',
      'Free and open source.',
    ],
  },
  {
    id: 'mmex',
    name: 'Money Manager Ex',
    importInstruction: 'In Money Manager Ex (1.9 or later): import as OFX, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [
      'Money Manager Ex reads the date, amount, transaction id and memo from each row, so the full narration goes in the memo.',
      'Needs version 1.9 or later. Free and open source.',
    ],
  },
  {
    id: 'moneydance',
    name: 'Moneydance',
    importInstruction: 'In Moneydance: File, Import, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [
      'Imported transactions arrive marked Unconfirmed in Moneydance, for you to review.',
    ],
  },
  {
    id: 'banktivity',
    name: 'Banktivity',
    importInstruction: 'In Banktivity: File, Import Transactions, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [
      'Banktivity screens out duplicates on import.',
    ],
  },
  {
    id: 'moneywiz',
    name: 'MoneyWiz',
    importInstruction: 'In MoneyWiz: drag this file onto the window to open the Import Wizard.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [],
  },
  {
    id: 'moneypro',
    name: 'Money Pro',
    importInstruction: 'In Money Pro: Balance, Import, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
    fileSummary: OFX_SUMMARY,
    notes: [
      'Money Pro is a subscription app.',
    ],
  },
  {
    id: 'cashew',
    name: 'Cashew',
    importInstruction:
      'In Cashew: open the wallet to fill, then Import & Export, Import CSV File, choose this file. Every row comes in as Uncategorised for you to sort.',
    write: writeCashew,
    fileExtension: 'csv',
    featured: false,
    fileSummary: "A CSV in Cashew's import columns: date, amount, category, title, note. Times are kept when the statement prints them.",
    notes: [
      'Cashew creates a category from any name it is given, so a blank would become a category with no name. One placeholder on every row avoids that.',
      'Rows go into the wallet you have open when you import.',
    ],
  },
  // Money Manager (Realbyte) has a writer (./apps/realbyte.ts) but stays out until a real import
  // settles its expense word. See that file.
]
