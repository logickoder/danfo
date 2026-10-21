// Small pieces several card states share.

export function Progress({ stop, label }: { stop: 1 | 2 | 3; label?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-xs font-bold tracking-wider uppercase">
        Stop {stop} of 3{label ? ` · ${label}` : ''}
      </span>
      <div aria-hidden="true" className="flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-2 w-7 rounded border-2 border-ink ${n < stop ? 'bg-ink' : n === stop ? 'bg-yellow' : 'bg-paper'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function FileInput({ onFile }: { onFile: (file: File) => void }) {
  return (
    <input
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      onChange={(e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (file) onFile(file)
      }}
    />
  )
}

export function FileChip({ name, detail, onFile }: { name: string; detail: string; onFile?: (file: File) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border-2 border-ink bg-paper p-3">
      <span aria-hidden="true" className="flex h-11 w-9 flex-none items-center justify-center rounded border-2 border-ink bg-card font-mono text-[10px] font-bold">
        PDF
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-semibold" title={name}>
          {name}
        </span>
        <span className="text-[13px] text-ink-soft">{detail}</span>
      </div>
      {onFile && (
        <label className="inline-flex min-h-11 flex-none cursor-pointer items-center rounded-lg border-2 border-ink bg-card px-3 text-sm font-semibold focus-within:outline-3 focus-within:outline-ink">
          Change
          <FileInput onFile={onFile} />
        </label>
      )}
    </div>
  )
}

export function HazardBand() {
  return (
    <svg aria-hidden="true" width="100%" height="12" className="block">
      <defs>
        <pattern id="hazard" width="40" height="12" patternUnits="userSpaceOnUse">
          <rect width="40" height="12" className="fill-hazard" />
          <rect width="20" height="12" className="fill-ink" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#hazard)" />
    </svg>
  )
}
