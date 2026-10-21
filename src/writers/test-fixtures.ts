import type { ParseResponse, Transaction } from '@/lib/types'

// Shared statement fixtures for the writer tests. Test-only: nothing in the app imports this.

export function tx(partial: Partial<Transaction>): Transaction {
  return {
    date: '2026-08-01T09:00:00',
    narration: 'X',
    debit: '0',
    credit: '0',
    balance: null,
    reference: null,
    currency: 'NGN',
    has_time: true,
    ...partial,
  }
}

export const SAMPLE: ParseResponse = {
  format_version: 'test-1',
  metadata: {
    bank: 'gtb',
    account_holder: null,
    account_number_masked: '****1234',
    statement_period_start: '2026-08-01T00:00:00',
    statement_period_end: '2026-08-30T00:00:00',
    opening_balance: '1000.00',
    closing_balance: '1210.00',
  },
  totals: { credit: '250.00', debit: '40.00' },
  reconciliation: { totals: 'passed', row_wise: 'passed', row_wise_reason: null },
  transactions: [
    tx({ date: '2026-08-01T09:00:00', narration: 'Salary, "August"', credit: '250.00', balance: '1250.00', reference: 'REF001' }),
    tx({ date: '2026-08-02T09:00:00', narration: 'POS FOO STORES', debit: '40.00', balance: '1210.00' }),
    tx({ date: '2026-08-02T10:00:00', narration: 'Opening line, no money', balance: '1210.00' }),
  ],
}
