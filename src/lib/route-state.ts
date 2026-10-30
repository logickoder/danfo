import type { ParseResponse } from '@/lib/types'

// The three stops are always on screen; this is not a wizard. State controls which stop is
// lit, where the bus sits on the road, and what each panel shows. A discriminated union instead
// of boolean flags, so an invalid combination (e.g. "parsing" with no file) cannot be built.

export type ParseErrorCode =
  | 'not_pdf'
  | 'too_large'
  | 'over_capacity'
  | 'busy'
  | 'unavailable'
  | 'reconciliation_failed'
  | 'encrypted'
  | 'empty_statement'
  | 'layout_drift'
  | 'unsupported'
  | 'parse_failed'
  | 'server_not_configured'
  | 'turnstile_failed'
  | 'network'

export type RouteState =
  | { kind: 'idle' }
  | { kind: 'fileChosen'; file: File }
  | { kind: 'parsing'; file: File; requestId: number }
  | { kind: 'parseError'; file: File; code: ParseErrorCode }
  | { kind: 'parsed'; file: File; data: ParseResponse }
  | { kind: 'targetChosen'; file: File; data: ParseResponse; targetId: string }
  | { kind: 'downloaded'; file: File; data: ParseResponse; targetId: string }
  | { kind: 'writeError'; file: File; data: ParseResponse; targetId: string }

export type RouteEvent =
  | { type: 'FILE_CHOSEN'; file: File }
  | { type: 'FILE_REJECTED'; code: ParseErrorCode }
  | { type: 'PARSE_STARTED'; requestId: number }
  | { type: 'PARSE_OK'; requestId: number; data: ParseResponse; targetId?: string }
  | { type: 'PARSE_FAILED'; requestId: number; code: ParseErrorCode }
  | { type: 'TARGET_CHOSEN'; targetId: string }
  | { type: 'DOWNLOADED' }
  | { type: 'WRITE_FAILED' }
  | { type: 'RESET' }

export const initialRouteState: RouteState = { kind: 'idle' }

export function routeReducer(state: RouteState, event: RouteEvent): RouteState {
  switch (event.type) {
    case 'FILE_CHOSEN':
      // From any state: a new file discards whatever was parsed and sends the bus back to
      // stop 1.
      return { kind: 'fileChosen', file: event.file }

    case 'FILE_REJECTED':
      if (state.kind === 'idle') {
        // No file was ever chosen (e.g. a bad drop with nothing prior); nothing to attach the
        // rejection to, so there is no file-bearing state to report it from. Stay idle; the
        // caller surfaces the rejection directly.
        return state
      }
      return { kind: 'parseError', file: state.file, code: event.code }

    case 'PARSE_STARTED':
      if (state.kind !== 'fileChosen' && state.kind !== 'parseError') return state
      return { kind: 'parsing', file: state.file, requestId: event.requestId }

    case 'PARSE_OK':
      // Stale-response guard: ignore a response for a request that is no longer the current
      // one (the user swapped files mid-parse). Keyed on a counter, not File identity, so two
      // selections of the same file are still distinguishable.
      if (state.kind !== 'parsing' || state.requestId !== event.requestId) return state
      // A bank-and-app page names the app up front, so its card arrives with it picked.
      if (event.targetId) return { kind: 'targetChosen', file: state.file, data: event.data, targetId: event.targetId }
      return { kind: 'parsed', file: state.file, data: event.data }

    case 'PARSE_FAILED':
      if (state.kind !== 'parsing' || state.requestId !== event.requestId) return state
      return { kind: 'parseError', file: state.file, code: event.code }

    case 'TARGET_CHOSEN':
      if (state.kind === 'parsed' || state.kind === 'targetChosen' || state.kind === 'writeError') {
        return { kind: 'targetChosen', file: state.file, data: state.data, targetId: event.targetId }
      }
      if (state.kind === 'downloaded') {
        // Grabbing a second format after already downloading one: stay at stop 3, bus does not
        // move.
        return { kind: 'targetChosen', file: state.file, data: state.data, targetId: event.targetId }
      }
      return state

    case 'DOWNLOADED':
      if (state.kind !== 'targetChosen') return state
      return { kind: 'downloaded', file: state.file, data: state.data, targetId: state.targetId }

    case 'WRITE_FAILED':
      if (state.kind !== 'targetChosen') return state
      return { kind: 'writeError', file: state.file, data: state.data, targetId: state.targetId }

    case 'RESET':
      return { kind: 'idle' }

    default:
      return state
  }
}

/** What the danfo carries. One bus, always looping; its load says where the user is. */
export type BusLoad = 'waiting' | 'stuffed' | 'sorting' | 'bundled' | 'stalled'

export function busLoad(state: RouteState): BusLoad {
  switch (state.kind) {
    case 'idle':
      return 'waiting'
    case 'fileChosen':
    case 'parsing':
      return 'stuffed'
    case 'parsed':
    case 'targetChosen':
    case 'writeError':
      return 'sorting'
    case 'downloaded':
      return 'bundled'
    case 'parseError':
      return 'stalled'
  }
}

/** The parsed statement, once it exists; null before then. */
export function routeData(state: RouteState): ParseResponse | null {
  switch (state.kind) {
    case 'parsed':
    case 'targetChosen':
    case 'downloaded':
    case 'writeError':
      return state.data
    default:
      return null
  }
}

/** The chosen target id, once one has been chosen; null before then. */
export function routeTargetId(state: RouteState): string | null {
  switch (state.kind) {
    case 'targetChosen':
    case 'downloaded':
    case 'writeError':
      return state.targetId
    default:
      return null
  }
}
