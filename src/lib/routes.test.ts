import { describe, expect, it } from 'vitest'

import { TARGETS } from '../writers'

import { appPath, bankPath, findApp, findBank, findRoute, relatedRoutes, ROUTES, routesForApp, routesForBank, slugify } from './routes'
import { BANKS } from './statement'

describe('routes', () => {
  it('has one page per bank and app, with unique slugs', () => {
    expect(ROUTES).toHaveLength(BANKS.length * TARGETS.length)
    expect(new Set(ROUTES.map((r) => r.slug)).size).toBe(ROUTES.length)
  })

  it('reads as the search a user types', () => {
    expect(ROUTES.map((r) => r.slug)).toContain('first-bank-statement-to-ynab')
    expect(ROUTES.map((r) => r.slug)).toContain('zenith-bank-statement-to-money-manager-ex')
  })

  it('slugifies names to lowercase words joined by hyphens', () => {
    expect(slugify('Money Manager Ex')).toBe('money-manager-ex')
    expect(slugify('MoneyWiz')).toBe('moneywiz')
  })

  it('finds a route by slug and nothing for an unknown one', () => {
    expect(findRoute('opay-statement-to-wallet')?.target.name).toBe('Wallet')
    expect(findRoute('gtbank-statement-to-ynab')).toBeUndefined()
  })

  it('links the same bank to other apps and other banks to the same app, never itself', () => {
    const route = findRoute('palmpay-statement-to-ynab')
    if (!route) throw new Error('missing route')
    const { sameBank, sameApp } = relatedRoutes(route)
    expect(sameBank).toHaveLength(TARGETS.length - 1)
    expect(sameApp).toHaveLength(BANKS.length - 1)
    expect([...sameBank, ...sameApp].some((r) => r.slug === route.slug)).toBe(false)
  })

  it('gives every bank and app a hub that lists its routes', () => {
    for (const bank of BANKS) {
      expect(findBank(bankPath(bank).split('/').pop() ?? '')).toBe(bank)
      expect(routesForBank(bank)).toHaveLength(TARGETS.length)
    }
    for (const target of TARGETS) {
      expect(findApp(appPath(target).split('/').pop() ?? '')).toBe(target)
      expect(routesForApp(target)).toHaveLength(BANKS.length)
    }
    expect(TARGETS.map(appPath)).toContain('/apps/ynab')
  })
})
