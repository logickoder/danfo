import type { ParseResponse, Transaction } from './types'
import type { Bank } from './statement'

// A made-up statement in the shape of a bank's real ones, for the example file on its pages.
// The rows are invented and labelled EXAMPLE wherever they show; the shape is the bank's own:
// a time on every row where its statements print one, a running balance only where they
// print it. Narrations stay generic on purpose: they never imitate a bank's own wording.

interface ExampleRow {
  day: string
  time: string
  narration: string
  debit: string
  credit: string
  balance: string
}

// Opening balance 120000.00. Every balance follows from the one before (prev - debit + credit).
const ROWS: readonly ExampleRow[] = [
  { day: '2026-08-01', time: '09:14:02', narration: 'SALARY FROM EMPLOYER LTD', debit: '0', credit: '350000.00', balance: '470000.00' },
  { day: '2026-08-02', time: '18:40:51', narration: 'POS PURCHASE SUPERMARKET', debit: '18450.00', credit: '0', balance: '451550.00' },
  { day: '2026-08-04', time: '07:05:33', narration: 'AIRTIME PURCHASE', debit: '2000.00', credit: '0', balance: '449550.00' },
  { day: '2026-08-05', time: '12:22:10', narration: 'TRANSFER TO LANDLORD', debit: '250000.00', credit: '0', balance: '199550.00' },
  { day: '2026-08-05', time: '12:22:11', narration: 'ELECTRONIC MONEY TRANSFER LEVY', debit: '50.00', credit: '0', balance: '199500.00' },
]

export function exampleStatement(bank: Bank): ParseResponse {
  const transactions: Transaction[] = ROWS.map((r) => ({
    date: `${r.day}T${bank.hasTime ? r.time : '00:00:00'}`,
    narration: r.narration,
    debit: r.debit,
    credit: r.credit,
    balance: bank.printsBalance ? r.balance : null,
    reference: null,
    currency: 'NGN',
    has_time: bank.hasTime,
  }))
  return {
    format_version: 'example',
    metadata: {
      bank: bank.id,
      account_holder: null,
      account_number_masked: '******0000',
      statement_period_start: '2026-08-01T00:00:00',
      statement_period_end: '2026-08-31T00:00:00',
      opening_balance: bank.printsBalance ? '120000.00' : null,
      closing_balance: bank.printsBalance ? '199500.00' : null,
    },
    totals: { credit: '350000.00', debit: '270500.00' },
    reconciliation: { totals: 'passed', row_wise: bank.printsBalance ? 'passed' : 'not_available', row_wise_reason: null },
    transactions,
  }
}
