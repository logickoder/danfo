import type { Transaction } from '@/lib/types'

// Helpers every writer uses, whatever the file format. Money stays a string end to end:
// bankstract's DecimalString values pass through verbatim, never through Number()/parseFloat.

/** "2026-01-05T09:30:00" -> "2026-01-05". String slice, no Date parsing, no timezone drift. */
export function isoDateOnly(iso: string): string {
  return iso.slice(0, 10)
}

/** A DecimalString is nonzero if it is not empty and not zero-valued ("0", "0.00", "-0"). */
export function isNonZero(value: string): boolean {
  return value !== '' && !/^-?0(\.0+)?$/.test(value)
}

/** Rows with no money in either direction are dropped by every writer (docs/rules/writers.md). */
export function movesMoney(t: Transaction): boolean {
  return isNonZero(t.debit) || isNonZero(t.credit)
}

/** One direction of money on one row. `amount` never carries a sign; `inflow` says which way. */
export interface Leg {
  t: Transaction
  inflow: boolean
  amount: string
}

function unsigned(value: string): { negative: boolean; amount: string } {
  return value.startsWith('-') ? { negative: true, amount: value.slice(1) } : { negative: false, amount: value }
}

/**
 * What a row moves, as one-sided legs: debit first, then credit, zero sides dropped. bankstract
 * reads debit and credit from separate columns and reconciles a row that has both, so a writer
 * that picked one side would lose the other's money. Two legs keep both, untouched: nothing is
 * netted. A negative side (a debit printed as "-50.00") is money the other way, so its sign
 * flips direction instead of doubling up as "--50.00". String operations only.
 */
export function legs(t: Transaction): Leg[] {
  const out: Leg[] = []
  if (isNonZero(t.debit)) {
    const { negative, amount } = unsigned(t.debit)
    out.push({ t, inflow: negative, amount })
  }
  if (isNonZero(t.credit)) {
    const { negative, amount } = unsigned(t.credit)
    out.push({ t, inflow: !negative, amount })
  }
  return out
}

/** Every leg of a statement, in statement order. What every writer writes, one line each. */
export function statementLegs(transactions: readonly Transaction[]): Leg[] {
  return transactions.flatMap(legs)
}

/** The leg as one signed amount: money out carries a "-" prefix. */
export function signedAmount(leg: Leg): string {
  return leg.inflow ? leg.amount : `-${leg.amount}`
}

/** The one category word writers may emit, for apps that refuse a blank (docs/rules/writers.md). */
export const UNCATEGORISED = 'Uncategorised'
