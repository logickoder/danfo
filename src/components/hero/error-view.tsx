import { ERROR_COPY } from '@/lib/error-copy'
import { FEEDBACK_URL } from '@/lib/links'
import type { ParseErrorCode } from '@/lib/route-state'

import { FileInput } from './card-parts'

const ACTION_CLASS =
  'inline-flex min-h-11 cursor-pointer items-center rounded-lg border-2 border-ink bg-yellow px-4 font-display text-xs shadow-hard-3'

export function ErrorView({
  code,
  onFile,
  onRetry,
}: {
  code: ParseErrorCode
  onFile: (file: File) => void
  onRetry: () => void
}) {
  const copy = ERROR_COPY[code]
  return (
    <div role="alert" className="flex flex-col gap-2.5">
      <span className="font-mono text-[11px] font-bold text-error">{copy.label}</span>
      <h2 className="font-display text-lg leading-tight">{copy.title}</h2>
      <p className="text-sm leading-normal text-ink-soft">{copy.body}</p>
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {copy.action === 'pick_file' && (
          <label className={ACTION_CLASS}>
            Try another file
            <FileInput onFile={onFile} />
          </label>
        )}
        {copy.action === 'tell_us' && (
          <>
            <a href={FEEDBACK_URL} className={`${ACTION_CLASS} no-underline`}>
              Tell us
            </a>
            <label className="cursor-pointer text-sm font-semibold underline">
              Try another file
              <FileInput onFile={onFile} />
            </label>
          </>
        )}
        {copy.action === 'retry' && (
          <button type="button" className={ACTION_CLASS} onClick={onRetry}>
            Try again
          </button>
        )}
        {copy.action === 'reload' && (
          <button type="button" className={ACTION_CLASS} onClick={() => window.location.reload()}>
            Reload
          </button>
        )}
      </div>
    </div>
  )
}
