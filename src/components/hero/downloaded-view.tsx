import { otherFeaturedTargets } from '@/lib/targets'
import type { ParseResponse } from '@/lib/types'
import { downloadName, type Target } from '@/writers/target'

import { AppButton } from './app-button'
import { Progress } from './card-parts'

const OTHER_TILE =
  'min-h-12 rounded-lg border-2 border-ink bg-card px-2 font-display text-[10px] transition-colors duration-150 hover:bg-paper sm:text-xs'

export function DownloadedView({
  data,
  target,
  onDownload,
  onReset,
}: {
  data: ParseResponse
  target: Target
  onDownload: (targetId: string) => void
  onReset: () => void
}) {
  // Only the featured apps as one-tap tiles; anything else is back in the picker.
  const others = otherFeaturedTargets(target.id)

  return (
    <>
      <Progress stop={3} />
      <div aria-live="polite" className="flex items-center gap-3.5">
        <span aria-hidden="true" className="flex h-12 w-12 flex-none items-center justify-center rounded-full border-[3px] border-ink bg-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-display text-xl sm:text-2xl">Bus don land.</h2>
          <span className="truncate font-mono text-xs sm:text-[13px]">{downloadName(target, data)} is in your downloads</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 rounded-[10px] border-2 border-ink bg-paper p-4">
        <span className="font-mono text-[11px] font-bold tracking-wider">NEXT, IN {target.name.toUpperCase()}</span>
        <p className="text-[15px] leading-normal">{target.importInstruction}</p>
      </div>
      {others.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t-2 border-dashed border-ink pt-3">
          <h3 className="font-display text-base sm:text-lg">Another app?</h3>
          <p className="text-sm text-ink-soft">Same statement, another trip. Nothing is uploaded again.</p>
          <div className="grid grid-cols-3 gap-2.5">
            {others.map((t) => (
              <AppButton key={t.id} target={t} onPick={onDownload} className={OTHER_TILE} />
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-between text-sm font-semibold">
        <button type="button" className="underline" onClick={() => onDownload(target.id)}>
          Download again
        </button>
        <button type="button" className="underline" onClick={onReset}>
          Start a new statement
        </button>
      </div>
    </>
  )
}
