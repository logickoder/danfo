'use client'

import Link from 'next/link'
import { useState } from 'react'

import { findBank, routePath, routeSlug, type Route } from '@/lib/routes'
import { BANKS } from '@/lib/statement'
import { findTarget } from '@/lib/targets'
import { TARGETS } from '@/writers'

// "From [bank] to [app], go": the way onto any route page, on the home page and under each route
// page. Go is a real link to the chosen route, so it works before this script loads (pointing at
// the starting route) and stays a plain anchor for crawlers and new-tab clicks.

const SELECT =
  'min-h-12 w-full appearance-none rounded-lg border-2 border-ink bg-paper px-3 pr-9 font-display text-sm text-ink sm:text-base'

const BANK_OPTIONS = BANKS.map((b) => ({ value: b.slug, name: b.name }))
const APP_OPTIONS = TARGETS.map((t) => ({ value: t.id, name: t.name }))

function Picker({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; name: string }[] }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="font-mono text-[11px] font-bold tracking-wider text-paper uppercase">{label}</span>
      <span className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.name}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 12 8" className="pointer-events-none absolute top-1/2 right-3 h-2 w-3 -translate-y-1/2">
          <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  )
}

/** While the pickers still point at the page's own route, say so instead of linking to itself. */
function GoButton({ route, current }: { route: Route; current?: string }) {
  if (route.slug === current) {
    return <span className="inline-flex min-h-12 flex-none items-center justify-center rounded-lg border-2 border-paper/40 px-6 font-display text-sm text-paper/70 sm:text-base">You&apos;re here</span>
  }
  return (
    <Link href={routePath(route)} className="inline-flex min-h-12 flex-none items-center justify-center gap-2 rounded-lg border-2 border-paper bg-yellow px-6 font-display text-sm text-ink no-underline shadow-hard-paper-5 sm:text-base">
      Go <span aria-hidden="true">→</span>
      <span className="sr-only">: {route.bank.name} to {route.target.name}</span>
    </Link>
  )
}

/**
 * `from` and `to` start the pickers on a route; otherwise the first of each. `current` is the
 * page's own route: while the pickers still point at it, the button says so instead of linking
 * back to the same page.
 */
export function TripPlanner({ from, to, current }: { from?: string; to?: string; current?: string }) {
  const [bankSlug, setBankSlug] = useState(from ?? BANKS[0]?.slug ?? '')
  const [appId, setAppId] = useState(to ?? TARGETS[0]?.id ?? '')
  const bank = findBank(bankSlug)
  const target = findTarget(appId)
  const route = bank && target ? { slug: routeSlug(bank, target), bank, target } : undefined

  return (
    <div className="flex flex-col gap-4 rounded-xl border-[3px] border-ink bg-ink p-5 shadow-hard-6 sm:flex-row sm:items-end md:p-7">
      <Picker label="From" value={bankSlug} onChange={setBankSlug} options={BANK_OPTIONS} />
      <Picker label="To" value={appId} onChange={setAppId} options={APP_OPTIONS} />
      {route && <GoButton route={route} current={current} />}
    </div>
  )
}
