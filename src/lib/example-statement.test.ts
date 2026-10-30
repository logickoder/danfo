import { describe, expect, it } from 'vitest'

import { TARGETS } from '../writers'

import { exampleStatement } from './example-statement'
import { BANKS } from './statement'

describe('exampleStatement', () => {
  it('takes the bank shape: times only where printed, balances only where printed', () => {
    for (const bank of BANKS) {
      const tx = exampleStatement(bank).transactions
      expect(tx.every((t) => t.has_time === bank.hasTime)).toBe(true)
      expect(tx.every((t) => (t.balance !== null) === bank.printsBalance)).toBe(true)
    }
  })

  it('converts through every writer for every bank', () => {
    for (const bank of BANKS) for (const target of TARGETS) expect(target.write(exampleStatement(bank)).length).toBeGreaterThan(0)
  })

  it('differs between banks of different shape', () => {
    const [fbn, opay] = [BANKS.find((b) => b.id === 'fbn'), BANKS.find((b) => b.id === 'opay')]
    const cashew = TARGETS.find((t) => t.id === 'cashew')
    if (!fbn || !opay || !cashew) throw new Error('missing fixture')
    expect(cashew.write(exampleStatement(fbn))).not.toBe(cashew.write(exampleStatement(opay)))
  })
})
