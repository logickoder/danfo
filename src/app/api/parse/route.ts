import { NextResponse } from 'next/server'

import { MAX_FILE_BYTES, rejectFile } from '../../../lib/parse-client'
import { verifyTurnstile } from '../../../lib/turnstile-verify'

// Proxy to bankstract-cloud's /v1/parse. Exists for one reason: the API key stays
// server-side. The PDF passes through this process in memory and is never stored;
// bankstract's own privacy posture (in-memory parse, metadata-only audit) applies upstream.

const API_URL = process.env.BANKSTRACT_API_URL ?? 'https://bankstract.logickoder.dev'

// Room for the multipart envelope and the Turnstile token on top of the file itself.
const BODY_SLACK_BYTES = 64 * 1024

function fail(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request): Promise<NextResponse> {
  const key = process.env.DANFO_API_KEY
  if (!key) return fail('server_not_configured', 500)

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  if (!turnstileSecret) return fail('server_not_configured', 500)

  // Refuse an oversized body before buffering it. The file check below catches a missing or
  // lying Content-Length.
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_FILE_BYTES + BODY_SLACK_BYTES) return fail('too_large', 413)

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return fail('parse_failed', 400)
  }

  // The upstream API rate-limits per end user on this header (its network peer is only this
  // proxy's egress IP). Which request header carries the real client IP depends on what edge
  // fronts this app (Cloudflare: cf-connecting-ip, Vercel: x-real-ip, self-host: whatever the
  // reverse proxy sets), so it is config, not code. Never point this at x-forwarded-for's
  // left-most hop: that value is caller-spoofable, and a spoofed IP mints unlimited rate-limit
  // buckets on our upstream budget. Omitting the header entirely is the safe failure: the
  // worker collapses everyone into one shared bucket instead of trusting garbage.
  const ipHeader = process.env.CLIENT_IP_HEADER ?? 'cf-connecting-ip'
  const clientIp = request.headers.get(ipHeader) ?? ''

  const turnstileToken = formData.get('turnstile_token')
  if (typeof turnstileToken !== 'string' || !turnstileToken) return fail('turnstile_failed', 403)
  const verified = await verifyTurnstile(turnstileToken, turnstileSecret, clientIp)
  if (!verified) return fail('turnstile_failed', 403)

  // The browser runs the same check; this is the one that holds against a scripted caller.
  const file = formData.get('file')
  if (!(file instanceof File)) return fail('not_pdf', 400)
  const rejected = rejectFile(file)
  if (rejected) return fail(rejected, rejected === 'too_large' ? 413 : 400)

  // Forward the file and nothing else. Every field sent upstream rides on Danfo's key, so the
  // caller never picks any of them (the Turnstile token included).
  const upstreamForm = new FormData()
  upstreamForm.set('file', file)

  let upstream: Response
  try {
    upstream = await fetch(`${API_URL}/v1/parse`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        ...(clientIp ? { 'X-First-Party-Client-IP': clientIp } : {}),
      },
      body: upstreamForm,
    })
  } catch {
    return fail('unavailable', 502)
  }

  if (!upstream.ok) {
    // 401 and 402 are about Danfo's key or subscription, never the user's file.
    if (upstream.status === 401 || upstream.status === 402) return fail('server_not_configured', 500)
    // Rate limits and outages are not the file either: the user should retry, not re-download.
    if (upstream.status === 429) return fail('busy', 429)
    if (upstream.status === 413) return fail('too_large', 413)
    if (upstream.status >= 500) return fail('unavailable', 502)
    const body = (await upstream.json().catch(() => ({}))) as Record<string, unknown>
    const errorClass = typeof body.error_class === 'string' ? body.error_class : null
    return NextResponse.json(
      { error: 'parse_failed', error_class: errorClass },
      { status: upstream.status },
    )
  }

  let data: Record<string, unknown>
  try {
    data = (await upstream.json()) as Record<string, unknown>
  } catch {
    return fail('unavailable', 502)
  }

  // THE most important check in this app. Over its free cap, bankstract returns a 200 canned
  // SYNTHETIC statement marked with `_sample` (and X-Bankstract-Sample: true). Converting that
  // would hand the user fake transactions to import into their real budget. Hard-fail instead.
  if ('_sample' in data || upstream.headers.get('x-bankstract-sample') === 'true') {
    return fail('over_capacity', 503)
  }

  // `_demo` marks an anonymous demo-tier parse. A first-party key never gets one, so seeing it
  // means Danfo is running on the wrong key. Fail loudly rather than convert a watermarked parse.
  if ('_demo' in data) {
    return fail('server_not_configured', 500)
  }

  return NextResponse.json(data)
}
