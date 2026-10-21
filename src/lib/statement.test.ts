import { describe, expect, it } from 'vitest'

import { bankName, checkLines, periodLabel, previewRows, statementSummary } from './statement'
import type { ParseResponse } from '@/lib/types'

const DATA: ParseResponse = {
  format_version: 'test-1',
  metadata: {
    bank: 'fbn',
    account_holder: null,
    account_number_masked: null,
    statement_period_start: '2026-08-01T00:00:00',
    statement_period_end: '2026-08-31T00:00:00',
    opening_balance: null,
    closing_balance: null,
  },
  totals: { credit: null, debit: null },
  reconciliation: { totals: 'passed', row_wise: 'passed', row_wise_reason: null },
  transactions: [
    { date: '2026-08-01T00:00:00', narration: 'RENT', debit: '250000.00', credit: '0', balance: null, reference: null, currency: 'NGN', has_time: false },
    { date: '2026-08-05T14:21:09', narration: 'SALARY', debit: '0', credit: '620000.00', balance: null, reference: null, currency: 'NGN', has_time: true },
    { date: '2026-08-06T00:00:00', narration: 'USSD', debit: '6.98', credit: '0', balance: null, reference: null, currency: 'NGN', has_time: false },
    { date: '2026-08-07T00:00:00', narration: 'FOURTH', debit: '1.00', credit: '0', balance: null, reference: null, currency: 'NGN', has_time: false },
  ],
}

describe('bankName', () => {
  it('maps an engine slug to the display name', () => {
    expect(bankName('fbn')).toBe('First Bank')
    expect(bankName('opay')).toBe('OPay')
  })

  it('is null for an unknown or missing slug', () => {
    expect(bankName('gtb')).toBeNull()
    expect(bankName(null)).toBeNull()
  })
})

describe('periodLabel', () => {
  it('names the month and year of the period end', () => {
    expect(periodLabel(DATA)).toBe('August 2026')
  })

  it('is null without metadata', () => {
    expect(periodLabel({ ...DATA, metadata: null })).toBeNull()
  })
})

describe('statementSummary', () => {
  it('names the bank and the period', () => {
    expect(statementSummary(DATA)).toBe('Read as a First Bank statement · August 2026')
  })

  it('uses "an" before a vowel', () => {
    expect(statementSummary({ ...DATA, metadata: DATA.metadata && { ...DATA.metadata, bank: 'opay' } })).toBe(
      'Read as an OPay statement · August 2026',
    )
  })

  it('falls back when the bank or the period is unknown', () => {
    expect(statementSummary({ ...DATA, metadata: null })).toBe('Statement read')
  })
})

describe('checkLines', () => {
  it('passes both checks for a fully reconciled statement', () => {
    expect(checkLines(DATA.reconciliation)).toEqual([
      { passed: true, text: 'Totals match the statement' },
      { passed: true, text: 'Every running balance adds up' },
    ])
  })

  it("quotes the engine's reason verbatim when row-wise is disabled", () => {
    const lines = checkLines({ totals: 'passed', row_wise: 'disabled', row_wise_reason: 'wallet balance hides auto-save moves' })
    expect(lines[1]).toEqual({ passed: false, text: 'Running balances not checked: wallet balance hides auto-save moves' })
  })

  it('says plainly when a check had nothing to run against', () => {
    const lines = checkLines({ totals: 'not_available', row_wise: 'not_available', row_wise_reason: null })
    expect(lines.every((l) => !l.passed)).toBe(true)
  })
})

describe('previewRows', () => {
  it('returns the first three rows only', () => {
    expect(previewRows(DATA)).toHaveLength(3)
  })

  it('skips zero rows, as every writer does', () => {
    const zero = { date: '2026-07-31T00:00:00', narration: 'OPENING BALANCE', debit: '0.00', credit: '0.00', balance: null, reference: null, currency: 'NGN', has_time: false }
    const rows = previewRows({ ...DATA, transactions: [zero, ...DATA.transactions] })
    expect(rows.map((r) => r.narration)).toEqual(['RENT', 'SALARY', 'USSD'])
  })

  it('keeps amounts as the exact strings, sign as a prefix', () => {
    const [rent, salary] = previewRows(DATA)
    expect(rent?.amount).toBe('-250000.00')
    expect(salary?.amount).toBe('+620000.00')
    expect(salary?.credit).toBe(true)
  })

  it('shows a time only when the statement printed one', () => {
    const [rent, salary] = previewRows(DATA)
    expect(rent?.when).toBe('2026-08-01')
    expect(salary?.when).toBe('2026-08-05 · 14:21')
  })
})
