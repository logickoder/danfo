import type { ParseResponse, Reconciliation } from '@/lib/types'
import { isoDateOnly, statementLegs } from '../writers/shared'

// Pure display helpers for a parsed statement. Money stays a string throughout: the sign is a
// string prefix and the amount is the DecimalString exactly as it arrived.

/** Banks on the route today. Mirrors the engine's parser list (bankstract-cloud /v1/banks). */
export const BANKS: readonly { id: string; name: string }[] = [
  { id: 'fbn', name: 'First Bank' },
  { id: 'opay', name: 'OPay' },
  { id: 'palmpay', name: 'PalmPay' },
  { id: 'zenith', name: 'Zenith Bank' },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function bankName(slug: string | null | undefined): string | null {
  return BANKS.find((b) => b.id === slug)?.name ?? null
}

/** "August 2026" from the statement's period end, or null when the statement has none. */
export function periodLabel(data: ParseResponse): string | null {
  const end = data.metadata?.statement_period_end
  if (!end) return null
  const year = end.slice(0, 4)
  const month = MONTHS[Number(end.slice(5, 7)) - 1]
  return month ? `${month} ${year}` : null
}

/** The file chip's second line: "Read as a First Bank statement · August 2026". */
export function statementSummary(data: ParseResponse): string {
  const bank = bankName(data.metadata?.bank)
  const period = periodLabel(data)
  const read = bank ? `Read as ${/^[AEIOU]/.test(bank) ? 'an' : 'a'} ${bank} statement` : 'Statement read'
  return period ? `${read} · ${period}` : read
}

interface CheckLine {
  passed: boolean
  text: string
}

/** One line per reconciliation check, worded for the user. A disabled check quotes the engine. */
export function checkLines(reconciliation: Reconciliation): CheckLine[] {
  const lines: CheckLine[] = []
  lines.push(
    reconciliation.totals === 'passed'
      ? { passed: true, text: 'Totals match the statement' }
      : { passed: false, text: 'This statement prints no totals to check against' },
  )
  if (reconciliation.row_wise === 'passed') {
    lines.push({ passed: true, text: 'Every running balance adds up' })
  } else if (reconciliation.row_wise === 'disabled') {
    const reason = reconciliation.row_wise_reason
    lines.push({ passed: false, text: reason ? `Running balances not checked: ${reason}` : 'Running balances not checked' })
  } else {
    lines.push({ passed: false, text: 'This statement has no running balance to check' })
  }
  return lines
}

interface PreviewRow {
  narration: string
  when: string
  amount: string
  credit: boolean
  currency: string
}

/**
 * The first `count` lines the file will carry, ready to render. Built from the same legs every
 * writer writes, so the preview never shows a zero row the download skips, and a two-sided row
 * shows as its two lines. Times show only when the statement printed one.
 */
export function previewRows(data: ParseResponse, count = 3): PreviewRow[] {
  return statementLegs(data.transactions)
    .slice(0, count)
    .map(({ t, inflow, amount }) => {
      const date = isoDateOnly(t.date)
      return {
        narration: t.narration,
        when: t.has_time ? `${date} · ${t.date.slice(11, 16)}` : date,
        amount: `${inflow ? '+' : '-'}${amount}`,
        credit: inflow,
        currency: t.currency,
      }
    })
}
