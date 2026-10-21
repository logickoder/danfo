import type { ParseErrorCode } from '@/lib/route-state'
import type { ParseResponse } from '@/lib/types'

import { movesMoney } from '../writers/shared'

// Client-side call to the proxy at /api/parse, plus the pure mapping from its response to an
// error code (its copy lives in error-copy.ts). toParseError is pure (status + parsed body in, code
// out) so the whole error table is testable without a browser or a mock fetch.

/** Largest upload accepted, in MB. Statements run well under it; the error copy quotes it. */
export const MAX_FILE_MB = 15
/** The same cap in bytes. The proxy enforces it too: the browser check is a courtesy, not a guard. */
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

// Codes the proxy answers with directly, passed through as they are.
const PROXY_CODES: readonly ParseErrorCode[] = [
  'over_capacity',
  'turnstile_failed',
  'server_not_configured',
  'busy',
  'unavailable',
  'not_pdf',
  'too_large',
]

// bankstract-cloud's 422 error classes, mapped to what the user can do about each.
const ERROR_CLASS_CODES: Record<string, ParseErrorCode> = {
  ReconciliationError: 'reconciliation_failed',
  EncryptedSourceError: 'encrypted',
  EmptyStatementError: 'empty_statement',
  LayoutDriftError: 'layout_drift',
  ParseError: 'unsupported',
}

/** Rejects an obviously-wrong file before it reaches upstream. Runs in the browser and the proxy. */
export function rejectFile(file: File): ParseErrorCode | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'not_pdf'
  if (file.size > MAX_FILE_BYTES) return 'too_large'
  return null
}

function field(body: unknown, key: string): unknown {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[key] : undefined
}

/** Maps a non-ok proxy response to an error code. Pure: no fetch. */
export function toParseError(status: number, body: unknown): ParseErrorCode {
  const error = field(body, 'error')
  const proxyCode = PROXY_CODES.find((code) => code === error)
  if (proxyCode) return proxyCode

  const errorClass = field(body, 'error_class')
  if (typeof errorClass === 'string') {
    const code = ERROR_CLASS_CODES[errorClass]
    if (code) return code
  }
  // No body we recognise. A 5xx is the server or the network, never the user's file.
  return status >= 500 ? 'unavailable' : 'parse_failed'
}

/** Enough of the ParseResponse shape that the card can render it. Anything less is not a parse. */
export function isParseResponse(body: unknown): body is ParseResponse {
  return (
    Array.isArray(field(body, 'transactions')) &&
    typeof field(field(body, 'reconciliation'), 'totals') === 'string'
  )
}

interface ParseSuccess {
  ok: true
  data: ParseResponse
}

interface ParseFailure {
  ok: false
  code: ParseErrorCode
}

export async function parseStatement(file: File, turnstileToken: string): Promise<ParseSuccess | ParseFailure> {
  const formData = new FormData()
  formData.set('file', file)
  formData.set('turnstile_token', turnstileToken)

  let response: Response
  try {
    response = await fetch('/api/parse', { method: 'POST', body: formData })
  } catch {
    return { ok: false, code: 'network' }
  }

  const body: unknown = await response.json().catch(() => ({}))
  return readParseResponse(response.status, body)
}

/** What a proxy response means for the card. Pure: status + parsed body in. */
export function readParseResponse(status: number, body: unknown): ParseSuccess | ParseFailure {
  if (status < 200 || status >= 300) return { ok: false, code: toParseError(status, body) }
  if (!isParseResponse(body)) return { ok: false, code: 'unavailable' }
  // Rows that all move nothing are an empty statement as far as any budget app is concerned:
  // say so here, once, instead of handing every writer a file with no transactions in it.
  if (!body.transactions.some(movesMoney)) return { ok: false, code: 'empty_statement' }
  return { ok: true, data: body }
}
