import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Hero } from '@/components/hero/hero'
import { ExampleFile } from '@/components/sections/example-file'
import { RouteDetails } from '@/components/sections/route-details'
import { RelatedRoutes } from '@/components/sections/route-links'
import { SiteNav } from '@/components/sections/site-nav'
import { Terminus } from '@/components/sections/terminus'
import { findRoute, routeParams, routePath, type Route } from '@/lib/routes'
import { heading, pageMetadata, routeCrumbs, routeDescription, routeTitle } from '@/lib/site'

// One page per (bank, app) pair, e.g. /first-bank-statement-to-ynab (PRD.md, Distribution). All
// prerendered from the two registries; any other path is a 404, never rendered on demand. What
// makes each one its own: the bank's checks, the app's notes, and the real file the app gets
// (ExampleFile). The home page's general sections stay on the home page.

interface Props {
  params: Promise<{ route: string }>
}

export const dynamicParams = false

export const generateStaticParams = routeParams

async function routeFor(params: Props['params']): Promise<Route> {
  const route = findRoute((await params).route)
  if (!route) notFound()
  return route
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await routeFor(params)
  return pageMetadata(routePath(route), routeTitle(route), routeDescription(route))
}

export default async function RoutePage({ params }: Props) {
  const route = await routeFor(params)
  const { bank, target } = route

  return (
    <>
      <SiteNav crumbs={routeCrumbs(route)} />
      <main>
        <Hero
          heading={heading(bank, target)}
          intro={`Drop your ${bank.name} statement PDF. Get the exact file ${target.name} imports, checked against the statement first.`}
          targetId={target.id}
        />
        <RouteDetails route={route} />
        <ExampleFile bank={bank} target={target} />
        <RelatedRoutes route={route} />
      </main>
      <Terminus />
    </>
  )
}
