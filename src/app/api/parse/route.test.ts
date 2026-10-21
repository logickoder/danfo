import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const PARSED = { transactions: [], reconciliation: { totals: 'passed', row_wise: 'passed', row_wise_reason: null } }

let upstreamBodies: FormData[]

/** Siteverify passes; upstream answers with `upstream` (or throws when it is an Error). */
function mockFetch(upstream: Response | Error): void {
  upstreamBodies = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === SITEVERIFY) return Response.json({ success: true })
      if (init?.body instanceof FormData) upstreamBodies.push(init.body)
      if (upstream instanceof Error) throw upstream
      return upstream
    }),
  )
}

function request(fields: Record<string, string | File>, headers: Record<string, string> = {}): Request {
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) form.set(k, v)
  return new Request('http://localhost/api/parse', { method: 'POST', body: form, headers })
}

const pdf = () => new File(['%PDF-1.4'], 'statement.pdf', { type: 'application/pdf' })

async function call(req: Request): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await POST(req)
  return { status: res.status, body: (await res.json()) as Record<string, unknown> }
}

beforeEach(() => {
  vi.stubEnv('DANFO_API_KEY', 'bsk_test')
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('POST /api/parse', () => {
  it('forwards only the file upstream, never the token or extra fields', async () => {
    mockFetch(Response.json(PARSED))
    const res = await call(request({ file: pdf(), turnstile_token: 'tok', strict: 'false' }))
    expect(res.status).toBe(200)
    expect(upstreamBodies).toHaveLength(1)
    expect([...upstreamBodies[0]!.keys()]).toEqual(['file'])
  })

  it('hard-fails the canned sample, by field or by header', async () => {
    mockFetch(Response.json({ ...PARSED, _sample: true }))
    expect(await call(request({ file: pdf(), turnstile_token: 'tok' }))).toEqual({ status: 503, body: { error: 'over_capacity' } })

    mockFetch(Response.json(PARSED, { headers: { 'X-Bankstract-Sample': 'true' } }))
    expect((await call(request({ file: pdf(), turnstile_token: 'tok' }))).body).toEqual({ error: 'over_capacity' })
  })

  it('refuses a non-PDF or an oversized file without calling upstream', async () => {
    mockFetch(Response.json(PARSED))
    const png = new File(['x'], 'shot.png', { type: 'image/png' })
    expect(await call(request({ file: png, turnstile_token: 'tok' }))).toEqual({ status: 400, body: { error: 'not_pdf' } })
    expect(await call(request({ file: pdf(), turnstile_token: 'tok' }, { 'content-length': String(64 * 1024 * 1024) }))).toEqual({
      status: 413,
      body: { error: 'too_large' },
    })
    expect(upstreamBodies).toHaveLength(0)
  })

  it.each([
    [429, 'busy'],
    [503, 'unavailable'],
    [500, 'unavailable'],
    [413, 'too_large'],
    [401, 'server_not_configured'],
  ])('maps an upstream %i to %s, never to a bad-file error', async (status, error) => {
    mockFetch(new Response('nope', { status }))
    expect((await call(request({ file: pdf(), turnstile_token: 'tok' }))).body).toEqual({ error })
  })

  it('passes a 422 error class through for the client to word', async () => {
    mockFetch(Response.json({ error_class: 'EncryptedSourceError' }, { status: 422 }))
    expect(await call(request({ file: pdf(), turnstile_token: 'tok' }))).toEqual({
      status: 422,
      body: { error: 'parse_failed', error_class: 'EncryptedSourceError' },
    })
  })

  it('answers unavailable when upstream is unreachable or sends junk', async () => {
    mockFetch(new TypeError('fetch failed'))
    expect(await call(request({ file: pdf(), turnstile_token: 'tok' }))).toEqual({ status: 502, body: { error: 'unavailable' } })

    mockFetch(new Response('<html>', { status: 200 }))
    expect((await call(request({ file: pdf(), turnstile_token: 'tok' }))).body).toEqual({ error: 'unavailable' })
  })

  it('rejects a request with no Turnstile token before anything else', async () => {
    mockFetch(Response.json(PARSED))
    expect(await call(request({ file: pdf() }))).toEqual({ status: 403, body: { error: 'turnstile_failed' } })
  })
})
