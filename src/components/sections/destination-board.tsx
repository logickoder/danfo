'use client'

import { useEffect, useState } from 'react'

// The route board on the front of a danfo: one name at a time, fixed height whatever the list
// length (DESIGN.md, Scaling). Under reduced motion it holds on the first name. The full list
// is always in the DOM for screen readers.

const FLIP_MS = 2000

export interface DestinationBoardProps {
  /** Plural noun for the list, e.g. "banks". */
  kind: string
  items: readonly string[]
}

export function DestinationBoard({ kind, items }: DestinationBoardProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), FLIP_MS)
    return () => clearInterval(id)
  }, [items.length])

  return (
    <div className="flex flex-col gap-2.5">
      <div aria-hidden="true" className="relative flex h-[58px] items-center justify-center overflow-hidden rounded-md border-[3px] border-ink bg-[#1A1A1A]">
        <span className="absolute top-1.5 left-2 h-1.5 w-1.5 rounded-full bg-hazard" />
        <span key={index} className="dn-flip-in font-mono text-base font-bold tracking-[3px] text-yellow uppercase sm:text-lg">
          {items[index]}
        </span>
      </div>
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href="#faq" className="text-sm font-semibold">
        See all {items.length} {kind}
      </a>
    </div>
  )
}
