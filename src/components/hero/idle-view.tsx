'use client'

import { useRef, useState, type DragEvent } from 'react'

import { BANKS } from '@/lib/statement'

import { FileInput, Progress } from './card-parts'

export function IdleView({ onFile }: { onFile: (file: File) => void }) {
  const depth = useRef(0)
  const [dragging, setDragging] = useState(false)

  const onDrag = (e: DragEvent<HTMLLabelElement>, delta: number) => {
    e.preventDefault()
    depth.current = Math.max(0, depth.current + delta)
    setDragging(depth.current > 0)
  }

  return (
    <>
      <Progress stop={1} />
      <label
        onDragEnter={(e) => onDrag(e, 1)}
        onDragLeave={(e) => onDrag(e, -1)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          depth.current = 0
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) onFile(file)
        }}
        className={`flex cursor-pointer flex-col items-center gap-3.5 rounded-[10px] border-2 border-dashed border-ink px-4 py-8 text-center transition-colors duration-150 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ink ${dragging ? 'bg-yellow' : 'bg-paper'}`}
      >
        <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" className="stroke-ink" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M12 17v-6" />
          <path d="M9 13l3-3 3 3" />
        </svg>
        <span className="font-display text-lg leading-tight sm:text-2xl">Oya, drop your statement.</span>
        <span className="text-sm text-ink-soft">PDF straight from your bank app or downloads.</span>
        <span className="inline-flex min-h-[52px] items-center rounded-lg border-2 border-ink bg-yellow px-7 font-display text-sm shadow-hard-4 sm:text-base">
          Tap to upload
        </span>
        <FileInput onFile={onFile} />
      </label>
      <p className="text-sm text-ink-soft">
        Works with{' '}
        <a href="#how" className="font-bold text-ink underline">
          {BANKS.length} Nigerian banks
        </a>
        . Parsed in memory, never stored.
      </p>
    </>
  )
}
