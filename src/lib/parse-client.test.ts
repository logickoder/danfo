import { describe, expect, it } from 'vitest'

import { ERROR_COPY } from './error-copy'
import { isParseResponse, readParseResponse, rejectFile, toParseError } from './parse-client'

describe('toParseError', () => {
  it('maps 503 over_capacity to over_capacity', () => {
    expect(toParseError(503, { error: 'over_capacity' })).toBe('over_capacity')
  })

  it('maps 403 turnstile_failed to turnstile_failed', () => {
    expect(toParseError(403, { error: 'turnstile_failed' })).toBe('turnstile_failed')
  })

  it('maps server_not_configured regardless of status', () => {
    expect(toParseError(500, { error: 'server_not_configured' })).toBe('server_not_configured')
  })

  it.each([
    ['ReconciliationError', 'reconciliation_failed'],
    ['EncryptedSourceError', 'encrypted'],
    ['EmptyStatementError', 'empty_statement'],
    ['LayoutDriftError', 'layout_drift'],
    ['ParseError', 'unsupported'],
  ])('maps a 422 %s to %s', (errorClass, code) => {
    expect(toParseError(422, { error: 'parse_failed', error_class: errorClass })).toBe(code)
  })

  it('falls back to parse_failed for an unknown error class', () => {
    expect(toParseError(422, { error: 'parse_failed', error_class: 'SomethingNew' })).toBe('parse_failed')
  })

  it('falls back to parse_failed for an unrecognized 4xx body', () => {
    expect(toParseError(400, {})).toBe('parse_failed')
    expect(toParseError(422, null)).toBe('parse_failed')
  })

  it('never blames the file for an unrecognized 5xx (outage, HTML error page)', () => {
    expect(toParseError(500, {})).toBe('unavailable')
    expect(toParseError(502, 'not an object')).toBe('unavailable')
  })

  it.each(['busy', 'unavailable', 'not_pdf', 'too_large'] as const)('passes the proxy code %s through', (code) => {
    expect(toParseError(400, { error: code })).toBe(code)
  })
})

describe('isParseResponse', () => {
  it('accepts a body the card can render', () => {
    expect(isParseResponse({ transactions: [], reconciliation: { totals: 'passed' } })).toBe(true)
  })

  it('rejects an empty or half-shaped body', () => {
    expect(isParseResponse({})).toBe(false)
    expect(isParseResponse({ transactions: [] })).toBe(false)
    expect(isParseResponse({ transactions: {}, reconciliation: { totals: 'passed' } })).toBe(false)
    expect(isParseResponse(null)).toBe(false)
  })
})

describe('ERROR_COPY', () => {
  it('never phrases over_capacity as a parse failure', () => {
    expect(ERROR_COPY.over_capacity.body).not.toMatch(/fail/i)
    expect(ERROR_COPY.over_capacity.body).toMatch(/nothing was converted/i)
  })

  it('says the doesnt-add-up statement converted nothing', () => {
    expect(ERROR_COPY.reconciliation_failed.body).toMatch(/nothing was converted/i)
  })

  it('carries no em-dashes in any user-facing string', () => {
    for (const copy of Object.values(ERROR_COPY)) {
      expect(`${copy.label} ${copy.title} ${copy.body}`).not.toMatch(/\u2014/)
    }
  })
})

describe('rejectFile', () => {
  it('accepts a PDF under the size cap', () => {
    const file = new File(['%PDF'], 'statement.pdf', { type: 'application/pdf' })
    expect(rejectFile(file)).toBeNull()
  })

  it('rejects a non-PDF mime type and extension', () => {
    const file = new File(['x'], 'statement.png', { type: 'image/png' })
    expect(rejectFile(file)).toBe('not_pdf')
  })

  it('accepts a .pdf extension even with a missing mime type', () => {
    const file = new File(['%PDF'], 'statement.pdf', { type: '' })
    expect(rejectFile(file)).toBeNull()
  })

  it('rejects a file over the size cap', () => {
    const big = new Uint8Array(16 * 1024 * 1024)
    const file = new File([big], 'statement.pdf', { type: 'application/pdf' })
    expect(rejectFile(file)).toBe('too_large')
  })
})

describe('readParseResponse', () => {
  const recon = { totals: 'passed', row_wise: 'passed', row_wise_reason: null }
  const row = (debit: string, credit: string) => ({ date: '2026-08-01T00:00:00', narration: 'X', debit, credit, balance: null, reference: null, currency: 'NGN', has_time: false })

  it('accepts a statement that moves money', () => {
    expect(readParseResponse(200, { transactions: [row('5.00', '0')], reconciliation: recon }).ok).toBe(true)
  })

  it('calls a statement whose rows all move nothing empty, before any writer sees it', () => {
    expect(readParseResponse(200, { transactions: [row('0', '0.00')], reconciliation: recon })).toEqual({ ok: false, code: 'empty_statement' })
  })

  it('maps a non-2xx through toParseError', () => {
    expect(readParseResponse(429, { error: 'busy' })).toEqual({ ok: false, code: 'busy' })
  })
})
