import { writeCashew } from './apps/cashew'
import { writeYnab } from './apps/ynab'
import { writeOfx } from './formats/ofx'
import type { Target } from './target'

// The whole product is this registry. One entry per target budgeting app; several entries can
// share one writer (the user picks their app, never a file format). Adding an app is a new
// entry here plus, at most, a new writer file. Every entry's format and import steps come from
// docs/research/import-targets.md, which cites the app's own docs.

export const TARGETS: readonly Target[] = [
  {
    id: 'ynab',
    name: 'YNAB',
    importInstruction: 'In YNAB on the web: open the account, click Import, choose this file.',
    write: writeYnab,
    fileExtension: 'csv',
    featured: true,
  },
  {
    id: 'actual',
    name: 'Actual Budget',
    importInstruction: 'In Actual: open the account, click Import, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
  },
  {
    id: 'goodbudget',
    name: 'Goodbudget',
    importInstruction: 'In Goodbudget on the web: Transactions, Import Bank Transactions, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
  },
  {
    id: 'toshl',
    name: 'Toshl',
    importInstruction: 'In Toshl on the web: Import, upload this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
  },
  {
    id: 'wallet',
    name: 'Wallet',
    importInstruction:
      'In Wallet on the web (web.budgetbakers.com): click Import, pick a naira account that is not bank-linked, upload this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: true,
  },
  // Desktop and other apps that import the same OFX file with no column mapping.
  {
    id: 'gnucash',
    name: 'GnuCash',
    importInstruction: 'In GnuCash: File, Import, Import OFX/QFX, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'homebank',
    name: 'HomeBank',
    importInstruction: 'In HomeBank: File, Import, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'kmymoney',
    name: 'KMyMoney',
    importInstruction: 'In KMyMoney: File, Import, OFX, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'mmex',
    name: 'Money Manager Ex',
    importInstruction: 'In Money Manager Ex (1.9 or later): import as OFX, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'moneydance',
    name: 'Moneydance',
    importInstruction: 'In Moneydance: File, Import, choose this file, then pick the account.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'banktivity',
    name: 'Banktivity',
    importInstruction: 'In Banktivity: File, Import Transactions, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'moneywiz',
    name: 'MoneyWiz',
    importInstruction: 'In MoneyWiz: drag this file onto the window to open the Import Wizard.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'moneypro',
    name: 'Money Pro',
    importInstruction: 'In Money Pro: Balance, Import, choose this file.',
    write: writeOfx,
    fileExtension: 'ofx',
    featured: false,
  },
  {
    id: 'cashew',
    name: 'Cashew',
    importInstruction:
      'In Cashew: open the wallet to fill, then Import & Export, Import CSV File, choose this file. Every row comes in as Uncategorised for you to sort.',
    write: writeCashew,
    fileExtension: 'csv',
    featured: false,
  },
  // Money Manager (Realbyte) has a writer (./apps/realbyte.ts) but stays out until a real import
  // settles its expense word. See that file.
]
