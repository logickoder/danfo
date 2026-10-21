// Mirrors bankstract-cloud's public /v1/parse wire contract (packages/types in that repo).
// Danfo is a standalone repo, so the shape is vendored here. If the API revs, this revs.

/** A decimal serialized as a string, e.g. "250.50" or "0". Never parse with Number(). */
export type DecimalString = string

/** ISO 8601 datetime without timezone, e.g. "2026-01-05T09:30:00". */
export type IsoDateTime = string

export interface Transaction {
  date: IsoDateTime
  narration: string
  debit: DecimalString
  credit: DecimalString
  balance: DecimalString | null
  reference: string | null
  currency: string
  /** False when the statement printed no time for this row: the time in `date` is 00:00:00 padding. */
  has_time: boolean
}

export interface StatementMetadata {
  bank: string | null
  account_holder: string | null
  account_number_masked: string | null
  statement_period_start: IsoDateTime | null
  statement_period_end: IsoDateTime | null
  opening_balance: DecimalString | null
  closing_balance: DecimalString | null
}

export interface Totals {
  credit: DecimalString | null
  debit: DecimalString | null
}

/**
 * Which checks the engine actually ran. A statement that fails a check never returns 200, so
 * there is no "failed" here. `disabled` means the parser opts out; `row_wise_reason` then
 * carries the parser's own explanation, shown to the user verbatim.
 */
export interface Reconciliation {
  totals: 'passed' | 'not_available'
  row_wise: 'passed' | 'not_available' | 'disabled'
  row_wise_reason: string | null
}

export interface ParseResponse {
  format_version: string | null
  metadata: StatementMetadata | null
  totals: Totals
  transactions: Transaction[]
  reconciliation: Reconciliation
}
