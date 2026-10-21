import { TARGETS } from '../writers'
import type { Target } from '../writers/target'

// Selectors the app picker and the downloaded card read over the TARGETS registry (DESIGN.md,
// Scaling). Pure.

/** Shown as tiles up front, in registry order. */
export const FEATURED_TARGETS: readonly Target[] = TARGETS.filter((t) => t.featured)

/** "YNAB, Actual Budget, Goodbudget, Toshl, or Wallet": the featured apps as one phrase. */
export const FEATURED_NAMES = new Intl.ListFormat('en', { type: 'disjunction' }).format(FEATURED_TARGETS.map((t) => t.name))

/** Behind "More apps", with a search. */
export const MORE_TARGETS: readonly Target[] = TARGETS.filter((t) => !t.featured)

export function findTarget(id: string | null): Target | undefined {
  return TARGETS.find((t) => t.id === id)
}

/** "More apps" entries whose name contains the query, ignoring case and outer spaces. */
export function searchMoreTargets(query: string): readonly Target[] {
  const needle = query.trim().toLowerCase()
  return MORE_TARGETS.filter((t) => t.name.toLowerCase().includes(needle))
}

/** Featured apps other than the one just downloaded, for one-tap downloads of the same statement. */
export function otherFeaturedTargets(currentId: string, limit = 3): readonly Target[] {
  return FEATURED_TARGETS.filter((t) => t.id !== currentId).slice(0, limit)
}
