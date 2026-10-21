import { describe, expect, it } from 'vitest'

import { isNonZero, isoDateOnly, legs, movesMoney, signedAmount } from './shared'
import { tx } from './test-fixtures'

describe('shared helpers', () => {
  it('treats zero-valued decimal strings as zero, verbatim strings otherwise', () => {
    expect(isNonZero('0')).toBe(false)
    expect(isNonZero('0.00')).toBe(false)
    expect(isNonZero('')).toBe(false)
    expect(isNonZero('-0')).toBe(false)
    expect(isNonZero('0.01')).toBe(true)
  })

  it('slices dates without Date() parsing', () => {
    expect(isoDateOnly('2026-08-01T09:00:00')).toBe('2026-08-01')
  })

  it('keeps only rows that move money', () => {
    expect(movesMoney(tx({ debit: '5.00' }))).toBe(true)
    expect(movesMoney(tx({ credit: '5.00' }))).toBe(true)
    expect(movesMoney(tx({}))).toBe(false)
  })

  it('splits a row into one-sided legs, keeping both sides of a two-sided row untouched', () => {
    const both = tx({ debit: '50.00', credit: '10.00' })
    expect(legs(both).map((l) => [l.inflow, l.amount])).toEqual([
      [false, '50.00'],
      [true, '10.00'],
    ])
    expect(legs(tx({ credit: '7.50' })).map(signedAmount)).toEqual(['7.50'])
    expect(legs(tx({ debit: '7.50' })).map(signedAmount)).toEqual(['-7.50'])
    expect(legs(tx({}))).toEqual([])
  })

  it('reads a negative side as money the other way, never as "--"', () => {
    expect(legs(tx({ debit: '-50.00' })).map((l) => [l.inflow, l.amount])).toEqual([[true, '50.00']])
    expect(legs(tx({ credit: '-50.00' })).map(signedAmount)).toEqual(['-50.00'])
  })
})
