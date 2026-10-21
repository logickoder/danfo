import { describe, expect, it } from 'vitest'

import { SAMPLE, tx } from '../test-fixtures'

import { writeYnab } from './ynab'

describe('ynab writer', () => {
  it("emits YNAB's own field list with one positive side per row and drops zero rows", () => {
    expect(writeYnab(SAMPLE)).toBe(
      ['Date,Payee,Memo,Outflow,Inflow', '2026-08-01,"Salary, ""August""",REF001,,250.00', '2026-08-02,POS FOO STORES,,40.00,', ''].join('\n'),
    )
  })
})

describe('ynab writer, two-sided rows', () => {
  it('writes both sides of a row as two lines, no money dropped or netted', () => {
    const data = { ...SAMPLE, transactions: [tx({ date: '2026-08-03T00:00:00', narration: 'REVERSAL', debit: '50.00', credit: '10.00' })] }
    expect(writeYnab(data)).toBe(
      ['Date,Payee,Memo,Outflow,Inflow', '2026-08-03,REVERSAL,,50.00,', '2026-08-03,REVERSAL,,,10.00', ''].join('\n'),
    )
  })
})
