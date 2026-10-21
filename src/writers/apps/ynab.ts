import type { ParseResponse } from '@/lib/types'

import { csvFile } from '../formats/csv'
import { isoDateOnly, statementLegs } from '../shared'

// YNAB File-Based Import, CSV (its docs call CSV "recommended and preferred"). YNAB maps
// columns in a preview to Date, Payee, Memo, Outflow, Inflow, so this header is exactly that
// field list. No Category column: YNAB never imports categories, and since September 2026 it
// auto-categorizes by payee itself. Both amount columns positive, the unused side blank, so no
// sign math touches a money string. Source: docs/research/import-targets.md.
//
// Open before launch: YNAB does not document its CSV date formats. YYYY-MM-DD needs one real
// import to confirm, then freeze it here.
const HEADER = ['Date', 'Payee', 'Memo', 'Outflow', 'Inflow'] as const

export function writeYnab(data: ParseResponse): string {
  // Legs drop zero rows (YNAB would import them as 0 transactions) and split a two-sided row.
  const rows = statementLegs(data.transactions).map(({ t, inflow, amount }) => [
    isoDateOnly(t.date),
    t.narration,
    t.reference ?? '',
    inflow ? '' : amount,
    inflow ? amount : '',
  ])
  return csvFile(HEADER, rows)
}
