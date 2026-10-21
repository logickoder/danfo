'use client'

import Script from 'next/script'
import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react'

import { createTokenSource } from '@/lib/turnstile-token'

// Managed widget, appearance: interaction-only. Invisible for almost everyone; if traffic looks
// like a bot, Cloudflare shows a real challenge instead of silently failing the user. execution:
// execute mints the token when getToken() is called (at convert time), which sidesteps the
// token's 300 second expiry entirely; nothing is minted, and nothing expires, while the user is
// still picking a file.
//
// No dev bypass branch exists here or on the server. Cloudflare's always-pass test keys (in
// .env.example) exercise this exact code path in local dev.

export interface TurnstileHandle {
  getToken: () => Promise<string>
}

export interface TurnstileProps {
  siteKey: string
  ref?: Ref<TurnstileHandle>
}

export function Turnstile({ siteKey, ref }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  // One source per mounted widget: it remembers whether a token was spent, so the next request resets.
  const tokensRef = useRef(createTokenSource())

  const render = useCallback(() => {
    const container = containerRef.current
    const turnstile = window.turnstile
    // Guards React 19 StrictMode's double effect from mounting two widgets on the same node.
    if (!container || !turnstile || widgetIdRef.current) return

    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      appearance: 'interaction-only',
      execution: 'execute',
      callback: (token) => tokensRef.current.resolve(token),
      'error-callback': () => tokensRef.current.reject('turnstile_error'),
      'expired-callback': () => tokensRef.current.reject('turnstile_expired'),
    })
  }, [siteKey])

  useEffect(() => {
    return () => {
      const widgetId = widgetIdRef.current
      if (widgetId) window.turnstile?.remove(widgetId)
      widgetIdRef.current = null
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      getToken: () => {
        const widgetId = widgetIdRef.current
        const turnstile = window.turnstile
        if (!widgetId || !turnstile) return Promise.reject(new Error('turnstile_not_ready'))
        return tokensRef.current.request(turnstile, widgetId)
      },
    }),
    [],
  )

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={render}
      />
      <div ref={containerRef} />
    </>
  )
}
