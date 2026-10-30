import Link from 'next/link'

import { appPath, bankPath } from '@/lib/routes'
import { BANKS } from '@/lib/statement'
import { TARGETS } from '@/writers'

import { TripPlanner } from './trip-planner'

// The home page's way onto the bank-and-app pages: the trip planner for people, and one quiet
// line of hub links per group. Search reaches every route page through the hubs (and the
// sitemap), so this section does not have to list all of them.

/** A quiet line of links: a mono label, then names separated by dots. Names never break. */
export function HubLine({ label, links }: { label: string; links: { href: string; name: string }[] }) {
  return (
    <p className="text-[15px] leading-relaxed text-ink-soft">
      <span className="mr-2 font-mono text-xs font-bold tracking-wider text-ink uppercase">{label}</span>
      {links.map((l, i) => (
        <span key={l.href}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <Link href={l.href} className="whitespace-nowrap text-ink">
            {l.name}
          </Link>
        </span>
      ))}
    </p>
  )
}

export function RouteIndex() {
  return (
    <section aria-labelledby="routes-title" className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-14 md:pb-20">
      <div className="flex flex-col gap-2">
        <h2 id="routes-title" className="font-display text-2xl leading-tight md:text-[40px]">
          Plan your trip
        </h2>
        <p className="text-[15px] text-ink-soft md:text-base">Pick your bank and your app for the steps and the exact file it gets.</p>
      </div>
      <TripPlanner />
      <div className="flex flex-col gap-1.5">
        <HubLine label="Banks" links={BANKS.map((b) => ({ href: bankPath(b), name: b.name }))} />
        <HubLine label="Apps" links={TARGETS.map((t) => ({ href: appPath(t), name: t.name }))} />
      </div>
    </section>
  )
}
