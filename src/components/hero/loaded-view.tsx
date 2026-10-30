import { checkLines, previewRows, statementSummary } from '@/lib/statement'
import type { ParseResponse } from '@/lib/types'
import { downloadName, type Target } from '@/writers/target'

import { AppPicker } from './app-picker'
import { FileChip, Progress } from './card-parts'

export function LoadedView({
  fileName,
  data,
  target,
  writeFailed,
  onFile,
  onChoose,
  onDownload,
}: {
  fileName: string
  data: ParseResponse
  target: Target | undefined
  writeFailed: boolean
  onFile: (file: File) => void
  onChoose: (targetId: string) => void
  onDownload: (targetId: string) => void
}) {
  const lines = checkLines(data.reconciliation)
  const rows = previewRows(data)

  return (
    <>
      <Progress stop={2} />
      <FileChip name={fileName} detail={statementSummary(data)} onFile={onFile} />
      <ul className="flex flex-col gap-1.5 text-sm">
        {lines.map((line) => (
          <li key={line.text} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={`mt-px flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-xs font-bold ${line.passed ? 'bg-success text-card' : 'border-2 border-ink-soft text-ink-soft'}`}
            >
              {line.passed ? '✓' : '–'}
            </span>
            <span>{line.text}</span>
          </li>
        ))}
      </ul>
      {rows.length > 0 && (
        <div>
          <div className="overflow-hidden rounded-lg border-2 border-ink">
            {rows.map((row, i) => (
              <div key={i} className={`flex items-center justify-between gap-3 px-3 py-2 ${i > 0 ? 'border-t-2 border-ink' : ''} ${i % 2 ? 'bg-paper' : 'bg-card'}`}>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-medium" title={row.narration}>
                    {row.narration}
                  </span>
                  <span className="text-xs text-ink-soft">{row.when}</span>
                </div>
                <span className={`flex-none font-mono text-[13px] font-medium ${row.credit ? 'text-success' : ''}`}>
                  {row.amount} <span className="hidden sm:inline">{row.currency}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            {rows.length === 1 ? 'The first row' : `The first ${rows.length} rows`} of your statement. Check before you import.
          </p>
        </div>
      )}
      <AppPicker selected={target} onChoose={onChoose} />
      <button
        type="button"
        disabled={!target}
        onClick={() => target && onDownload(target.id)}
        className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-ink bg-ink px-4 py-2 text-yellow disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="font-display text-base">{target ? 'Oya, download' : 'Pick your app first'}</span>
        {target && <span className="font-mono text-xs text-paper">{downloadName(target, data)}</span>}
      </button>
      {target && <p className="text-center text-sm text-ink-soft">{target.importInstruction}</p>}
      {writeFailed && (
        <p role="alert" className="text-center text-sm text-error">
          Could not build the file for {target?.name ?? 'that app'}. Nothing was downloaded. Pick another app, or tell us.
        </p>
      )}
    </>
  )
}
