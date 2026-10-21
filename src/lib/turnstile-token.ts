// The client half of Turnstile as a promise. A Turnstile token is single-use, and execute() on a
// widget that already answered does not mint a new one: every request after the first has to
// reset the widget first. A request that hears nothing (a challenge left open, a script that
// stalled) rejects after a timeout instead of leaving the converter spinning forever.

/** How long a visible challenge gets before the convert attempt gives up. */
export const TOKEN_TIMEOUT_MS = 120_000

/** The two widget calls a request makes. window.turnstile satisfies it. */
interface WidgetControls {
  execute: (widgetId: string) => void
  reset: (widgetId: string) => void
}

export interface TokenSource {
  /** Mints a fresh token from the widget. */
  request: (widget: WidgetControls, widgetId: string) => Promise<string>
  /** Wire to the widget's callback. */
  resolve: (token: string) => void
  /** Wire to the widget's error-callback and expired-callback. */
  reject: (reason: string) => void
}

export function createTokenSource(timeoutMs = TOKEN_TIMEOUT_MS): TokenSource {
  let pending: { resolve: (token: string) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null
  let used = false

  const settle = (): typeof pending => {
    const current = pending
    if (current) clearTimeout(current.timer)
    pending = null
    return current
  }

  return {
    request(widget, widgetId) {
      settle()?.reject(new Error('turnstile_superseded'))
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => settle()?.reject(new Error('turnstile_timeout')), timeoutMs)
        pending = { resolve, reject, timer }
        if (used) widget.reset(widgetId)
        used = true
        widget.execute(widgetId)
      })
    },
    resolve(token) {
      settle()?.resolve(token)
    },
    reject(reason) {
      settle()?.reject(new Error(reason))
    },
  }
}
