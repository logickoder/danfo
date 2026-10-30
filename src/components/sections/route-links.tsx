import { appPath, bankPath, relatedRoutes, routePath, type Route } from '@/lib/routes'

import { HubLine } from './route-index'
import { TripPlanner } from './trip-planner'

// Under a route page: the trip planner starting on this route, then the neighbours in two quiet
// lines (this bank to the other apps, the other banks to this app), each ending at its hub.

export function RelatedRoutes({ route }: { route: Route }) {
  const { bank, target } = route
  const { sameBank, sameApp } = relatedRoutes(route)
  return (
    <section aria-labelledby="related-title" className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-12 md:py-16">
      <h2 id="related-title" className="font-display text-2xl leading-tight md:text-[34px]">
        Another trip?
      </h2>
      <TripPlanner from={bank.slug} to={target.id} current={route.slug} />
      <div className="flex flex-col gap-1.5">
        <HubLine
          label={`${bank.name} to`}
          links={[...sameBank.map((r) => ({ href: routePath(r), name: r.target.name })), { href: bankPath(bank), name: 'every app' }]}
        />
        <HubLine
          label={`To ${target.name} from`}
          links={[...sameApp.map((r) => ({ href: routePath(r), name: r.bank.name })), { href: appPath(target), name: 'every bank' }]}
        />
      </div>
    </section>
  )
}
