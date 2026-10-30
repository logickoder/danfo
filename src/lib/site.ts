import type { Metadata } from 'next'

import { TARGETS } from '../writers'
import { formatLabel, type Target } from '../writers/target'

import { AUTHOR_URL, REPO_URL, SITE_URL } from './links'
import { appPath, bankPath, routePath, type Route } from './routes'
import { BANK_NAMES, withArticle, type Bank } from './statement'
import { FEATURED_NAMES, FEATURED_TARGETS } from './targets'

// The words search engines and share previews show. Lockup rule (docs/rules/voice.md): the name
// never travels alone.

export const SITE_TITLE = 'Danfo: statement to budget app'

/** "First Bank statement to YNAB | Danfo: ...": a page title with the lockup, as the layout's template writes it. */
export function withLockup(title: string): string {
  return `${title} | ${SITE_TITLE}`
}

/**
 * What every page's share card carries. Next replaces openGraph and twitter whole per segment
 * instead of merging them, so each page spreads these in rather than relying on the layout.
 */
export const OPEN_GRAPH_BASE = { type: 'website', siteName: 'Danfo', locale: 'en_NG' } as const
export const TWITTER_BASE = { card: 'summary_large_image' } as const

export const SITE_DESCRIPTION = `Turn a Nigerian bank statement PDF into the exact file ${FEATURED_NAMES} imports. Free, no account, nothing stored.`

/** A route page's title. The layout's template adds the lockup after it. */
export function routeTitle({ bank, target }: Route): string {
  return `${bank.name} statement to ${target.name}`
}

export function routeDescription({ bank, target }: Route): string {
  return `Turn ${withArticle(bank.name)} statement PDF into the ${formatLabel(target)} file ${target.name} imports, checked against the statement first. Free, no account, nothing stored.`
}

/** The brand yellow, for browser chrome (theme-color, the manifest). Mirrors --color-yellow. */
export const THEME_COLOR = '#F2B705'

/** The paper background, for the manifest splash. Mirrors --color-paper. */
export const PAPER_COLOR = '#FAF7F0'

/**
 * schema.org description of the tool, for search results. Only facts the page itself states:
 * free, web, no install. Serialised into a <script type="application/ld+json"> on the page.
 */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Danfo',
  alternateName: SITE_TITLE,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any (runs in the browser)',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
  author: { '@type': 'Person', name: 'Jeffery Orazulike', url: AUTHOR_URL },
  sameAs: [REPO_URL],
} as const

/** JSON safe to inline in a script element: "<" escaped so no string in it can close the tag. */
function inlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function structuredDataScript(): string {
  return inlineJson(STRUCTURED_DATA)
}

export interface Crumb {
  name: string
  /** Site-relative, e.g. "/banks/first-bank". */
  path: string
}

export function breadcrumbScript(crumbs: readonly Crumb[]): string {
  return inlineJson({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.path}` })),
  })
}

export function bankTitle(bank: Bank): string {
  return `${bank.name} statement to your budget app`
}

// "YNAB, Actual Budget, and Goodbudget": the first featured apps, as examples in a sentence.
const EXAMPLE_APPS = new Intl.ListFormat('en', { type: 'conjunction' }).format(FEATURED_TARGETS.slice(0, 3).map((t) => t.name))

export function bankDescription(bank: Bank): string {
  return `Turn ${withArticle(bank.name)} statement PDF into the exact import file for ${TARGETS.length} budget apps, including ${EXAMPLE_APPS}. Checked first, nothing stored.`
}

export function appTitle(target: Target): string {
  return `Nigerian bank statement to ${target.name}`
}

export function appDescription(target: Target): string {
  return `Turn a statement PDF from ${BANK_NAMES} into the ${formatLabel(target)} file ${target.name} imports. Checked first, free, nothing stored.`
}

/**
 * A page's metadata: its title and description, everywhere search and shares read them. The
 * layout's template adds the lockup to <title> only, so the share titles get it here.
 */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const shareTitle = withLockup(title)
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_BASE, url: path, title: shareTitle, description },
    twitter: { ...TWITTER_BASE, title: shareTitle, description },
  }
}

export interface Heading {
  /** The headline's first line, plain. */
  line: string
  /** The headline's second line, on the yellow plate. */
  plate: string
}

/** The hero headline, shared with the page's share image so the two never drift. */
export function heading(bank?: Bank, target?: Target): Heading {
  return { line: `${bank?.name ?? 'Statement'} in.`, plate: `${target?.name ?? 'Budget'} out.` }
}

const HOME_CRUMB: Crumb = { name: 'Danfo', path: '/' }

export function bankCrumbs(bank: Bank): Crumb[] {
  return [HOME_CRUMB, { name: bank.name, path: bankPath(bank) }]
}

export function appCrumbs(target: Target): Crumb[] {
  return [HOME_CRUMB, { name: target.name, path: appPath(target) }]
}

export function routeCrumbs(route: Route): Crumb[] {
  return [...bankCrumbs(route.bank), { name: route.target.name, path: routePath(route) }]
}
