import Link from 'next/link'

import { routePath, routesForApp, routesForBank } from '@/lib/routes'
import type { Bank } from '@/lib/statement'
import { formatLabel, type Target } from '@/writers/target'

import { AppNotes } from './route-details'
import { Section, SectionTitle } from './section'

// The hub pages: one per bank (every app it can go to) and one per app (every bank that can
// feed it). Each pair page links up to both (Another trip?), so search sees a bank, an app and the
// route between.

// auto-rows-fr makes every row as tall as the tallest; h-full lets each card fill its cell.
const CARD = 'flex h-full flex-col gap-2 rounded-[10px] border-2 border-ink bg-card p-5 no-underline hover:bg-paper'

export function BankHub({ bank }: { bank: Bank }) {
  const routes = routesForBank(bank)
  return (
    <Section id="how" titleId="hub-title">
      <div className="flex flex-col gap-3">
        <SectionTitle id="hub-title">
          {bank.name} statements, checked first
        </SectionTitle>
        <p className="max-w-[720px] text-[15px] leading-relaxed text-ink-soft md:text-base">
          {bank.checks}{' '}
          {bank.hasTime
            ? `${bank.name} prints a time on every row, so apps that take times get them.`
            : `${bank.name} prints dates without times, so every row lands on its day.`}{' '}
          Drop the PDF from the app or internet banking.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-lg md:text-xl">Pick where it goes</h3>
        <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <li key={r.slug} className="h-full">
              <Link href={routePath(r)} className={CARD}>
                <span className="font-display text-base">{r.target.name}</span>
                <span className="text-sm text-ink-soft">
                  {formatLabel(r.target)} file. {r.target.notes[0]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

export function AppHub({ target }: { target: Target }) {
  const routes = routesForApp(target)
  return (
    <Section id="how" titleId="hub-title">
      <div className="flex flex-col gap-3">
        <SectionTitle id="hub-title">
          Into {target.name}
        </SectionTitle>
        <div className="max-w-[720px] text-[15px] leading-relaxed text-ink-soft md:text-base">
          <p>{target.fileSummary}</p>
          <p className="mt-2">{target.importInstruction}</p>
          <AppNotes target={target} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-lg md:text-xl">Pick your bank</h3>
        <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((r) => (
            <li key={r.slug} className="h-full">
              <Link href={routePath(r)} className={CARD}>
                <span className="font-display text-base">{r.bank.name}</span>
                <span className="text-sm text-ink-soft">{r.bank.checks}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
