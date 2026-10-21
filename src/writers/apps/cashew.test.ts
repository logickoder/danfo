import { describe, expect, it } from 'vitest'

import { SAMPLE, tx } from '../test-fixtures'

import { writeCashew } from './cashew'

describe('cashew writer', () => {
  it('emits lowercase headers, one signed amount, the placeholder category, ISO dates', () => {
    const data = {
      ...SAMPLE,
      transactions: [...SAMPLE.transactions, tx({ date: '2026-08-04T00:00:00', narration: 'USSD', debit: '6.98', has_time: false })],
    }
    expect(writeCashew(data)).toBe(
      [
        'date,amount,category,title,note',
        '2026-08-01T09:00:00,250.00,Uncategorised,"Salary, ""August""",REF001',
        '2026-08-02T09:00:00,-40.00,Uncategorised,POS FOO STORES,',
        '2026-08-04,-6.98,Uncategorised,USSD,',
        '',
      ].join('\n'),
    )
  })

  it('signs each leg of a two-sided row, and flips a negative side', () => {
    const data = { ...SAMPLE, transactions: [tx({ debit: '50.00', credit: '10.00', has_time: false }), tx({ debit: '-3.00', has_time: false })] }
    expect(writeCashew(data).split('\n').slice(1, 4).map((l) => l.split(',')[1])).toEqual(['-50.00', '10.00', '3.00'])
  })
})
