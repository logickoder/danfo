import { describe, expect, it } from 'vitest'

import { TARGETS } from '../writers'

import { FEATURED_NAMES, FEATURED_TARGETS, findTarget, MORE_TARGETS, otherFeaturedTargets, searchMoreTargets } from './targets'

describe('target selectors', () => {
  it('splits the registry into featured and more, losing none', () => {
    expect(FEATURED_TARGETS.length + MORE_TARGETS.length).toBe(TARGETS.length)
    expect(FEATURED_TARGETS.every((t) => t.featured)).toBe(true)
    expect(MORE_TARGETS.some((t) => t.featured)).toBe(false)
  })

  it('finds a target by id, and nothing for null or an unknown id', () => {
    expect(findTarget('ynab')?.name).toBe('YNAB')
    expect(findTarget(null)).toBeUndefined()
    expect(findTarget('nope')).toBeUndefined()
  })

  it('names every featured app in one phrase', () => {
    for (const t of FEATURED_TARGETS) expect(FEATURED_NAMES).toContain(t.name)
    expect(FEATURED_NAMES).toMatch(/, or /)
  })

  it('searches More apps by name, ignoring case and outer spaces', () => {
    expect(searchMoreTargets('  GNU ').map((t) => t.id)).toEqual(['gnucash'])
    expect(searchMoreTargets('')).toEqual(MORE_TARGETS)
    expect(searchMoreTargets('ynab')).toEqual([])
  })

  it('offers up to three other featured apps after a download', () => {
    const others = otherFeaturedTargets('ynab')
    expect(others).toHaveLength(3)
    expect(others.some((t) => t.id === 'ynab')).toBe(false)
  })
})
