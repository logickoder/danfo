import type { ParseResponse } from '@/lib/types'

// What a registry entry is (index.ts), and the pieces the UI needs to save its file.
export type FileExtension = 'csv' | 'ofx'

export interface Target {
  /** Stable id, used in the picker and the download filename. */
  id: string
  /** Display name, exactly as the target app brands itself. */
  name: string
  /** One line shown under the download button. Kills the "now what?" support question. */
  importInstruction: string
  write: (data: ParseResponse) => string
  fileExtension: FileExtension
  /** Shown as a tile up front. The rest sit behind "More apps" in the picker. */
  featured: boolean
}

export const MIME_TYPES: Record<FileExtension, string> = {
  csv: 'text/csv;charset=utf-8',
  ofx: 'application/x-ofx',
}

/** Download filename: e.g. "ynab-gtb-2026-08.csv". Bank and period pulled from the parse. */
export function downloadName(target: Target, data: ParseResponse): string {
  const bank = data.metadata?.bank ?? 'statement'
  const period = data.metadata?.statement_period_end?.slice(0, 7) ?? 'export'
  return `${target.id}-${bank}-${period}.${target.fileExtension}`
}
