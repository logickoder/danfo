import { describe, expect, it } from 'vitest'

import { ROUTES } from './routes'
import { TARGETS } from '../writers'

import { appDescription, appTitle, bankDescription, bankTitle, breadcrumbScript, routeDescription, routeTitle, SITE_DESCRIPTION, SITE_TITLE, structuredDataScript } from './site'
import { BANKS } from './statement'
import { FEATURED_TARGETS } from './targets'

describe('site copy', () => {
  it('keeps the lockup in the title', () => {
    expect(SITE_TITLE).toBe('Danfo: statement to budget app')
  })

  it('names every featured app, fits a search snippet, and carries no em-dash', () => {
    for (const t of FEATURED_TARGETS) expect(SITE_DESCRIPTION).toContain(t.name)
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160)
    expect(SITE_DESCRIPTION).not.toMatch(/—/)
  })

  it('gives every route page a title and a snippet-length description of its own', () => {
    const titles = ROUTES.map(routeTitle)
    expect(new Set(titles).size).toBe(ROUTES.length)
    expect(titles).toContain('First Bank statement to YNAB')
    for (const r of ROUTES) expect(routeDescription(r).length).toBeLessThanOrEqual(160)
    expect(ROUTES.map(routeDescription).find((d) => d.includes('OPay'))).toMatch(/^Turn an OPay /)
  })

  it('inlines JSON-LD that parses and cannot close its script tag', () => {
    const script = structuredDataScript()
    expect(script).not.toContain('<')
    expect(JSON.parse(script)).toMatchObject({ '@type': 'WebApplication', name: 'Danfo' })
  })

  it('gives every hub a distinct title and a snippet-length description', () => {
    const titles = [...BANKS.map(bankTitle), ...TARGETS.map(appTitle)]
    expect(new Set(titles).size).toBe(titles.length)
    for (const b of BANKS) expect(bankDescription(b).length).toBeLessThanOrEqual(160)
    for (const t of TARGETS) expect(appDescription(t).length).toBeLessThanOrEqual(160)
  })

  it('numbers breadcrumbs from 1 with absolute URLs', () => {
    const crumbs = JSON.parse(breadcrumbScript([{ name: 'Danfo', path: '/' }, { name: 'YNAB', path: '/apps/ynab' }]))
    expect(crumbs.itemListElement[1]).toMatchObject({ position: 2, name: 'YNAB' })
    expect(crumbs.itemListElement[1].item).toMatch(/^https:\/\/.+\/apps\/ynab$/)
  })
})
