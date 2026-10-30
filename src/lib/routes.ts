import { TARGETS } from '../writers'
import type { Target } from '../writers/target'

import { BANKS, type Bank } from './statement'

// Every (bank, app) pair gets its own page, e.g. /first-bank-statement-to-ynab (PRD.md,
// Distribution). The set is the product of the two registries, so a new bank or app adds its
// pages with no other change. Pure.

export interface Route {
  slug: string
  bank: Bank
  target: Target
}

/** "Money Manager Ex" -> "money-manager-ex". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function routeSlug(bank: Bank, target: Target): string {
  return `${bank.slug}-statement-to-${appSlug(target)}`
}

/** A bank's hub page: every app it can go to. */
export function bankPath(bank: Bank): string {
  return `/banks/${bank.slug}`
}

export function appSlug(target: Target): string {
  return slugify(target.name)
}

/** An app's hub page: every bank that can feed it. */
export function appPath(target: Target): string {
  return `/apps/${appSlug(target)}`
}

export function routePath(route: Route): string {
  return `/${route.slug}`
}

export function findBank(slug: string): Bank | undefined {
  return BANKS.find((b) => b.slug === slug)
}

export function findApp(slug: string): Target | undefined {
  return TARGETS.find((t) => appSlug(t) === slug)
}

export function routesForBank(bank: Bank): Route[] {
  return ROUTES.filter((r) => r.bank.id === bank.id)
}

export function routesForApp(target: Target): Route[] {
  return ROUTES.filter((r) => r.target.id === target.id)
}

export const ROUTES: readonly Route[] = BANKS.flatMap((bank) =>
  TARGETS.map((target) => ({ slug: routeSlug(bank, target), bank, target })),
)

export function findRoute(slug: string): Route | undefined {
  return ROUTES.find((r) => r.slug === slug)
}

/** The same bank to every other app, then every other bank to the same app: the page's links. */
export function relatedRoutes(route: Route): { sameBank: Route[]; sameApp: Route[] } {
  return {
    sameBank: routesForBank(route.bank).filter((r) => r.slug !== route.slug),
    sameApp: routesForApp(route.target).filter((r) => r.slug !== route.slug),
  }
}

// Each page and its share image prerender the same set of params.

export function routeParams(): { route: string }[] {
  return ROUTES.map((r) => ({ route: r.slug }))
}

export function bankParams(): { bank: string }[] {
  return BANKS.map((b) => ({ bank: b.slug }))
}

export function appParams(): { app: string }[] {
  return TARGETS.map((t) => ({ app: appSlug(t) }))
}
