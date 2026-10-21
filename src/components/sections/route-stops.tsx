import type { ReactNode } from 'react'

import { Danfo } from '@/components/scene/danfo'
import { RoadStrip, VerticalRoad } from '@/components/scene/street'
import { FEEDBACK_URL } from '@/lib/links'
import { BANKS } from '@/lib/statement'
import { TARGETS } from '@/writers'

import { DestinationBoard } from './destination-board'

// "Three stops. One trip.": bus-stop signposts on the kerb. Desktop: signs in a row, each post
// part of its sign so it always reaches the kerb whatever the sign's height. Narrow screens:
// the road runs down the left and each sign hangs off it on a bracket arm.

interface SignProps {
  n: 1 | 2 | 3
  label: string
  title: string
  children: ReactNode
}

function Sign({ n, label, title, children }: SignProps) {
  return (
    <div className="relative flex w-full flex-col items-center md:w-[320px] md:justify-end">
      <span aria-hidden="true" className="absolute top-5 -left-[27px] h-2 w-6 rounded-sm bg-ink md:hidden" />
      <div className="w-full rounded-[10px] border-[3px] border-ink bg-card shadow-hard-6">
        <div className="flex items-center gap-2.5 rounded-t-[7px] border-b-[3px] border-ink bg-yellow px-4 py-2.5">
          <span aria-hidden="true" className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-ink bg-card font-display text-sm">
            {n}
          </span>
          <span className="font-display text-sm">{label}</span>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <h3 className="font-display text-base md:text-xl">{title}</h3>
          {children}
        </div>
      </div>
      <div aria-hidden="true" className="hidden min-h-6 w-2.5 flex-1 bg-ink md:block" />
    </div>
  )
}

export function RouteStops() {
  return (
    <section id="how" aria-labelledby="how-title" className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-14 md:py-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h2 id="how-title" className="font-display text-[26px] leading-tight md:text-[40px]">
          Three stops. One trip.
        </h2>
        <p className="max-w-[380px] text-[15px] leading-relaxed text-ink-soft md:text-base">
          Board at your bank. Alight at your budget app. You name the app, we handle the format.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[14px] border-[3px] border-ink bg-sky">
        <VerticalRoad id="stops-v" className="absolute inset-y-0 left-0 h-full w-[72px] md:hidden" />
        <div className="dn-descend absolute top-0 left-0 w-[60px] md:hidden">
          <Danfo load="waiting" className="block w-[110px] origin-top-left translate-x-[62px] rotate-90" />
        </div>

        <div className="relative flex flex-col gap-6 py-6 pr-4 pl-[92px] md:h-[440px] md:flex-row md:items-stretch md:justify-around md:gap-0 md:px-0 md:pt-10 md:pb-0">
          <Sign n={1} label="Your bank" title="Drop your statement">
            <p className="text-[15px] leading-normal text-ink-soft">The PDF from your bank app. These banks are on the route today.</p>
            <DestinationBoard kind="banks" items={BANKS.map((b) => b.name)} />
            <a href={FEEDBACK_URL} className="text-sm font-semibold">
              Bank not listed? Tell us
            </a>
          </Sign>
          <Sign n={2} label="The danfo" title="Read row by row">
            <p className="text-[15px] leading-normal text-ink-soft">
              Read in memory against your bank&apos;s own layout. Every row comes from a line on your statement. Nothing stored.
            </p>
          </Sign>
          <Sign n={3} label="Your app" title="Pick, download, import">
            <p className="text-[15px] leading-normal text-ink-soft">One file named for the trip, with the import steps for your app under the button.</p>
            <DestinationBoard kind="apps" items={TARGETS.map((t) => t.name)} />
          </Sign>
        </div>

        <div className="relative hidden h-[120px] md:block">
          <RoadStrip id="stops-h" className="absolute inset-0 h-full w-full" />
          <div className="dn-drive absolute bottom-[34px] left-0 w-[150px]" data-load="waiting">
            <Danfo load="waiting" className="block w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
