'use client'

import type { ReactNode } from 'react'

import { routeTargetId, type RouteState } from '@/lib/route-state'
import { findTarget } from '@/lib/targets'

import { HazardBand } from './card-parts'
import { ConvertingView } from './converting-view'
import { DownloadedView } from './downloaded-view'
import { ErrorView } from './error-view'
import { IdleView } from './idle-view'
import { LoadedView } from './loaded-view'

// The converter. Every state lives in this one card (DESIGN.md, The hero card); the page never
// navigates. The card renders; the parent hero owns the reducer and the side effects.

interface HeroCardProps {
  state: RouteState
  onFile: (file: File) => void
  onChoose: (targetId: string) => void
  onDownload: (targetId: string) => void
  onRetry: () => void
  onReset: () => void
  /** The Turnstile mount. Always rendered so a challenge can appear if Cloudflare needs one. */
  children: ReactNode
}

export function HeroCard({ state, onFile, onChoose, onDownload, onRetry, onReset, children }: HeroCardProps) {
  const isError = state.kind === 'parseError'
  return (
    <div
      id="convert"
      className="pointer-events-auto relative overflow-hidden rounded-xl border-[3px] border-ink bg-card text-ink shadow-hard-8"
    >
      {isError && <HazardBand />}
      <div className="flex flex-col gap-4 p-5 sm:p-7">
        <CardBody state={state} onFile={onFile} onChoose={onChoose} onDownload={onDownload} onRetry={onRetry} onReset={onReset} />
        {children}
      </div>
    </div>
  )
}

function CardBody({ state, onFile, onChoose, onDownload, onRetry, onReset }: Omit<HeroCardProps, 'children'>) {
  switch (state.kind) {
    case 'idle':
      return <IdleView onFile={onFile} />
    case 'fileChosen':
    case 'parsing':
      return <ConvertingView fileName={state.file.name} />
    case 'parseError':
      return <ErrorView code={state.code} onFile={onFile} onRetry={onRetry} />
    case 'parsed':
    case 'targetChosen':
    case 'writeError':
      return (
        <LoadedView
          fileName={state.file.name}
          data={state.data}
          target={findTarget(routeTargetId(state))}
          writeFailed={state.kind === 'writeError'}
          onFile={onFile}
          onChoose={onChoose}
          onDownload={onDownload}
        />
      )
    case 'downloaded': {
      const target = findTarget(state.targetId)
      return target ? <DownloadedView data={state.data} target={target} onDownload={onDownload} onReset={onReset} /> : null
    }
  }
}
