// Server-side half of the Turnstile check. Called from the parse proxy before the upstream
// bankstract call, never after: a bot check that runs after the parse already happened would
// not have checked anything.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface SiteverifyResponse {
  success: boolean
}

function isSiteverifyResponse(body: unknown): body is SiteverifyResponse {
  return typeof body === 'object' && body !== null && typeof (body as { success?: unknown }).success === 'boolean'
}

export async function verifyTurnstile(token: string, secretKey: string, remoteIp: string): Promise<boolean> {
  const body = new URLSearchParams({ secret: secretKey, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  let response: Response
  try {
    response = await fetch(SITEVERIFY_URL, { method: 'POST', body })
  } catch {
    return false
  }

  const data: unknown = await response.json().catch(() => ({}))
  return isSiteverifyResponse(data) && data.success
}
