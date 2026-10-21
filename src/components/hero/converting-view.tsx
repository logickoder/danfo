'use client'

import { useEffect, useState } from 'react'

import { FileChip, Progress } from './card-parts'

const SLOGANS = ['No shaking.', 'Hold your change.', 'Last stop: your budget.'] as const

export function ConvertingView({ fileName }: { fileName: string }) {
  const [slogan, setSlogan] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSlogan((i) => (i + 1) % SLOGANS.length), 1500)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <Progress stop={1} label="Converting" />
      <FileChip name={fileName} detail="Reading in memory" />
      <p aria-live="polite" className="py-3 text-center font-display text-xl sm:text-2xl">
        {SLOGANS[slogan]}
      </p>
      <div aria-hidden="true" className="h-3.5 overflow-hidden rounded-lg border-2 border-ink bg-paper">
        <div className="dn-fill h-full w-2/5 border-r-2 border-ink bg-yellow" />
      </div>
      <p className="text-sm text-ink-soft">No file is made until the rows check out against your statement.</p>
    </>
  )
}
