import type { ReactNode } from 'react'

// The page-width section and its headline, shared by the "how it works" sections (home, route
// and hub pages) so their spacing and type stay on one scale.

export function Section({ id, titleId, children }: { id?: string; titleId: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={titleId} className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-14 md:py-20">
      {children}
    </section>
  )
}

export function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-display text-[26px] leading-tight md:text-[40px]">
      {children}
    </h2>
  )
}
