import type { ReactNode } from 'react'

import { exampleStatement } from '@/lib/example-statement'
import type { Route } from '@/lib/routes'
import { downloadName, formatLabel, type Target } from '@/writers/target'

import { Section, SectionTitle } from './section'

// A bank-and-app page's "how it works": three stops, each in this route's own facts. The bank's
// checks come from its parser, the file from its writer, the import steps from the app's docs
// (docs/research/import-targets.md). Nothing here is generic filler.

/** What to know about importing into this app (Target.notes, sourced in the research file). */
export function AppNotes({ target }: { target: Target }) {
  if (target.notes.length === 0) return null
  return (
    <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5">
      {target.notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  )
}

// "An OFX", "a CSV": the article follows how the letters are said, not how they are spelt.
const FORMAT_ARTICLE = { ofx: 'An', csv: 'A' } as const

export function RouteDetails({ route }: { route: Route }) {
  const { bank, target } = route
  const example = downloadName(target, exampleStatement(bank))
  const stops: { label: string; title: string; body: ReactNode }[] = [
    {
      label: `From ${bank.name}`,
      title: 'Your statement, checked',
      body: `Download your ${bank.name} statement as a PDF from the app or internet banking, then drop it above. ${bank.checks} If anything doesn't add up, no file is made.`,
    },
    {
      label: 'The danfo',
      title: `${FORMAT_ARTICLE[target.fileExtension]} ${formatLabel(target)} file for ${target.name}`,
      body: (
        <>
          {target.fileSummary} Named for the trip, e.g. <span className="font-mono whitespace-nowrap text-ink">{example}</span>. Built
          in your browser.
        </>
      ),
    },
    {
      label: `Into ${target.name}`,
      title: 'Import it',
      body: (
        <>
          {target.importInstruction}
          <AppNotes target={target} />
        </>
      ),
    },
  ]

  return (
    <Section id="how" titleId="route-title">
      <SectionTitle id="route-title">
        {bank.name} to {target.name}, three stops.
      </SectionTitle>
      <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
        {stops.map((stop, i) => (
          <li key={stop.label} className="flex flex-col gap-2.5 rounded-[10px] border-2 border-ink bg-card p-5 md:p-7">
            <span className="font-mono text-xs font-bold tracking-wider uppercase">
              Stop {i + 1} · {stop.label}
            </span>
            <h3 className="font-display text-base leading-snug md:text-xl">{stop.title}</h3>
            <div className="text-[15px] leading-relaxed text-ink-soft md:text-base">{stop.body}</div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
