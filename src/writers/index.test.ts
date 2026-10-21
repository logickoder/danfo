import { describe, expect, it } from 'vitest'

import { TARGETS } from './index'
import { downloadName } from './target'
import { SAMPLE } from './test-fixtures'

describe('targets registry', () => {
  it('every listed target has a working writer', () => {
    for (const target of TARGETS) {
      expect(() => target.write(SAMPLE)).not.toThrow()
    }
  })

  it('has unique ids', () => {
    expect(new Set(TARGETS.map((t) => t.id)).size).toBe(TARGETS.length)
  })

  it('names the download for the trip, with the format the target imports', () => {
    const ynab = TARGETS.find((t) => t.id === 'ynab')
    const wallet = TARGETS.find((t) => t.id === 'wallet')
    expect(ynab && downloadName(ynab, SAMPLE)).toBe('ynab-gtb-2026-08.csv')
    expect(wallet && downloadName(wallet, SAMPLE)).toBe('wallet-gtb-2026-08.ofx')
  })

  it('keeps Money Manager (Realbyte) out until its expense word is confirmed', () => {
    expect(TARGETS.some((t) => t.id === 'realbyte')).toBe(false)
  })
})
