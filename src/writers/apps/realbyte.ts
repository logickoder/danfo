import type { ParseResponse } from '@/lib/types'

import { statementLegs, UNCATEGORISED } from '../shared'

// Money Manager by Realbyte: tab-separated import in the column order of its official template
// (docs/research/samples/realbyte-money-manager-import-template.xlsx):
// Date, Account, Category, Subcategory, Note, Amount, Income/Expense, Description.
// Dates mm/dd/yyyy (help.realbyteapps.com article 360043223253). Amount positive, direction in
// the Income/Expense column. Account and Category must already exist in the app with exactly
// these names, so the import instruction tells the user to create them first.
//
// NOT in TARGETS yet: Realbyte's two official articles disagree on the expense word
// ("Expenses" in 360043223253, "Expense" in 360043536233). The writers rule forbids guessing,
// so this waits for one real export or import to settle it, then gets locked in tests.
export const REALBYTE_EXPENSE_WORD = 'Expense'
const INCOME_WORD = 'Income'
const HEADER = ['Date', 'Account', 'Category', 'Subcategory', 'Note', 'Amount', 'Income/Expense', 'Description'] as const

/** "2026-08-03T09:00:00" -> "08/03/2026". String slices only. */
function usDate(iso: string): string {
  return `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}`
}

/** Tabs and line breaks would split a TSV cell; narrations are single-line text anyway. */
function tsvField(value: string): string {
  return value.replace(/[\t\r\n]+/g, ' ')
}

export function writeRealbyte(data: ParseResponse, account: string): string {
  const rows = statementLegs(data.transactions).map(({ t, inflow, amount }) => [
    usDate(t.date),
    account,
    UNCATEGORISED,
    '',
    t.narration,
    amount,
    inflow ? INCOME_WORD : REALBYTE_EXPENSE_WORD,
    t.reference ?? '',
  ])
  return [HEADER, ...rows].map((r) => r.map(tsvField).join('\t')).join('\n') + '\n'
}
