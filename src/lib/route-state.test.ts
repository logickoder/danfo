import { describe, expect, it } from 'vitest'

import {
  busLoad,
  initialRouteState,
  routeData,
  routeReducer,
  routeTargetId,
  type RouteState,
} from './route-state'
import type { ParseResponse } from '@/lib/types'

const FILE = new File(['%PDF'], 'statement.pdf', { type: 'application/pdf' })

const DATA: ParseResponse = {
  format_version: 'test-1',
  metadata: {
    bank: 'gtb',
    account_holder: null,
    account_number_masked: null,
    statement_period_start: null,
    statement_period_end: '2026-08-30T00:00:00',
    opening_balance: null,
    closing_balance: null,
  },
  totals: { credit: null, debit: null },
  reconciliation: { totals: 'passed', row_wise: 'passed', row_wise_reason: null },
  transactions: [],
}

describe('routeReducer', () => {
  it('idle -> fileChosen on FILE_CHOSEN', () => {
    const next = routeReducer(initialRouteState, { type: 'FILE_CHOSEN', file: FILE })
    expect(next).toEqual({ kind: 'fileChosen', file: FILE })
  })

  it('fileChosen -> parsing on PARSE_STARTED', () => {
    const state: RouteState = { kind: 'fileChosen', file: FILE }
    const next = routeReducer(state, { type: 'PARSE_STARTED', requestId: 1 })
    expect(next).toEqual({ kind: 'parsing', file: FILE, requestId: 1 })
  })

  it('parsing -> parsed on matching PARSE_OK', () => {
    const state: RouteState = { kind: 'parsing', file: FILE, requestId: 1 }
    const next = routeReducer(state, { type: 'PARSE_OK', requestId: 1, data: DATA })
    expect(next).toEqual({ kind: 'parsed', file: FILE, data: DATA })
  })

  it('ignores PARSE_OK with a stale requestId', () => {
    const state: RouteState = { kind: 'parsing', file: FILE, requestId: 2 }
    const next = routeReducer(state, { type: 'PARSE_OK', requestId: 1, data: DATA })
    expect(next).toBe(state)
  })

  it('ignores PARSE_FAILED with a stale requestId', () => {
    const state: RouteState = { kind: 'parsing', file: FILE, requestId: 2 }
    const next = routeReducer(state, { type: 'PARSE_FAILED', requestId: 1, code: 'network' })
    expect(next).toBe(state)
  })

  it('parsing -> parseError on matching PARSE_FAILED', () => {
    const state: RouteState = { kind: 'parsing', file: FILE, requestId: 1 }
    const next = routeReducer(state, { type: 'PARSE_FAILED', requestId: 1, code: 'over_capacity' })
    expect(next).toEqual({ kind: 'parseError', file: FILE, code: 'over_capacity' })
  })

  it('parsed -> targetChosen on TARGET_CHOSEN', () => {
    const state: RouteState = { kind: 'parsed', file: FILE, data: DATA }
    const next = routeReducer(state, { type: 'TARGET_CHOSEN', targetId: 'ynab' })
    expect(next).toEqual({ kind: 'targetChosen', file: FILE, data: DATA, targetId: 'ynab' })
  })

  it('targetChosen -> downloaded on DOWNLOADED', () => {
    const state: RouteState = { kind: 'targetChosen', file: FILE, data: DATA, targetId: 'ynab' }
    const next = routeReducer(state, { type: 'DOWNLOADED' })
    expect(next).toEqual({ kind: 'downloaded', file: FILE, data: DATA, targetId: 'ynab' })
  })

  it('targetChosen -> writeError on WRITE_FAILED', () => {
    const state: RouteState = { kind: 'targetChosen', file: FILE, data: DATA, targetId: 'wallet' }
    const next = routeReducer(state, { type: 'WRITE_FAILED' })
    expect(next).toEqual({ kind: 'writeError', file: FILE, data: DATA, targetId: 'wallet' })
  })

  it('FILE_CHOSEN from downloaded drops data and returns to fileChosen', () => {
    const state: RouteState = { kind: 'downloaded', file: FILE, data: DATA, targetId: 'ynab' }
    const otherFile = new File(['%PDF'], 'other.pdf', { type: 'application/pdf' })
    const next = routeReducer(state, { type: 'FILE_CHOSEN', file: otherFile })
    expect(next).toEqual({ kind: 'fileChosen', file: otherFile })
  })

  it('TARGET_CHOSEN from downloaded goes back to targetChosen for another trip', () => {
    const state: RouteState = { kind: 'downloaded', file: FILE, data: DATA, targetId: 'ynab' }
    const next = routeReducer(state, { type: 'TARGET_CHOSEN', targetId: 'actual' })
    expect(next).toEqual({ kind: 'targetChosen', file: FILE, data: DATA, targetId: 'actual' })
    expect(busLoad(next)).toBe('sorting')
  })

  it('RESET returns to idle from any state', () => {
    const state: RouteState = { kind: 'downloaded', file: FILE, data: DATA, targetId: 'ynab' }
    expect(routeReducer(state, { type: 'RESET' })).toEqual({ kind: 'idle' })
  })

  it('FILE_REJECTED is a no-op from idle (nothing to attach it to)', () => {
    const next = routeReducer(initialRouteState, { type: 'FILE_REJECTED', code: 'not_pdf' })
    expect(next).toBe(initialRouteState)
  })

  it('FILE_REJECTED from fileChosen becomes parseError', () => {
    const state: RouteState = { kind: 'fileChosen', file: FILE }
    const next = routeReducer(state, { type: 'FILE_REJECTED', code: 'too_large' })
    expect(next).toEqual({ kind: 'parseError', file: FILE, code: 'too_large' })
  })
})

describe('busLoad', () => {
  it('waits when idle', () => {
    expect(busLoad({ kind: 'idle' })).toBe('waiting')
  })

  it('is stuffed while a file is boarding or being read', () => {
    expect(busLoad({ kind: 'fileChosen', file: FILE })).toBe('stuffed')
    expect(busLoad({ kind: 'parsing', file: FILE, requestId: 1 })).toBe('stuffed')
  })

  it('sorts into bundles once parsed and while picking an app', () => {
    expect(busLoad({ kind: 'parsed', file: FILE, data: DATA })).toBe('sorting')
    expect(busLoad({ kind: 'targetChosen', file: FILE, data: DATA, targetId: 'ynab' })).toBe('sorting')
    expect(busLoad({ kind: 'writeError', file: FILE, data: DATA, targetId: 'ynab' })).toBe('sorting')
  })

  it('carries clean bundles once downloaded', () => {
    expect(busLoad({ kind: 'downloaded', file: FILE, data: DATA, targetId: 'ynab' })).toBe('bundled')
  })

  it('stalls on a parse error', () => {
    expect(busLoad({ kind: 'parseError', file: FILE, code: 'network' })).toBe('stalled')
  })
})

describe('routeData and routeTargetId', () => {
  it('are null before a parse', () => {
    expect(routeData(initialRouteState)).toBeNull()
    expect(routeTargetId(initialRouteState)).toBeNull()
  })

  it('expose the parse and the chosen app once they exist', () => {
    const state: RouteState = { kind: 'downloaded', file: FILE, data: DATA, targetId: 'ynab' }
    expect(routeData(state)).toBe(DATA)
    expect(routeTargetId(state)).toBe('ynab')
  })
})
