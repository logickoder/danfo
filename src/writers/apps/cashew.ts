import type { ParseResponse } from '@/lib/types'

import { csvFile } from '../formats/csv'
import { isoDateOnly, signedAmount, statementLegs, UNCATEGORISED } from '../shared'

// Cashew CSV import, confirmed from its source (github.com/jameskokoska/Cashew,
// budget/lib/widgets/importCSV.dart). Headers are matched by exact lowercase name. One signed
// amount: a leading "-" is money out, a string prefix on the DecimalString. Dates go through
// Dart's DateTime.parse, which takes ISO directly; the time is kept only when the statement
// printed one. No wallet column: Cashew then uses the wallet the user has open.
//
// Cashew creates a category from whatever name it is given, so a blank would become an
// empty-named category. Every row gets the fixed placeholder instead (docs/rules/writers.md).
const HEADER = ['date', 'amount', 'category', 'title', 'note'] as const

export function writeCashew(data: ParseResponse): string {
  const rows = statementLegs(data.transactions).map((leg) => [
    leg.t.has_time ? leg.t.date : isoDateOnly(leg.t.date),
    signedAmount(leg),
    UNCATEGORISED,
    leg.t.narration,
    leg.t.reference ?? '',
  ])
  return csvFile(HEADER, rows)
}
