import { describe, expect, it } from 'vitest'

import { SAMPLE } from '../test-fixtures'

import { writeRealbyte } from './realbyte'

describe('realbyte writer (not yet a target)', () => {
  it('emits the official template columns as TSV, US dates, positive amounts', () => {
    expect(writeRealbyte(SAMPLE, 'First Bank')).toBe(
      [
        'Date\tAccount\tCategory\tSubcategory\tNote\tAmount\tIncome/Expense\tDescription',
        '08/01/2026\tFirst Bank\tUncategorised\t\tSalary, "August"\t250.00\tIncome\tREF001',
        '08/02/2026\tFirst Bank\tUncategorised\t\tPOS FOO STORES\t40.00\tExpense\t',
        '',
      ].join('\n'),
    )
  })
})
