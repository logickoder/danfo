// Ambient typing for Cloudflare's Turnstile script (loaded via next/script), so the widget can
// be driven with zero `any`. Only the subset of the API this app actually calls.

interface TurnstileRenderOptions {
  sitekey: string
  appearance?: 'always' | 'execute' | 'interaction-only'
  execution?: 'render' | 'execute'
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  execute: (widgetId: string) => void
  remove: (widgetId: string) => void
  reset: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export {}
