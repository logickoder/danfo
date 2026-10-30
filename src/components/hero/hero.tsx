'use client'

import { memo, useCallback, useReducer, useRef } from 'react'

import { Danfo } from '@/components/scene/danfo'
import { Street } from '@/components/scene/street'
import { parseStatement, rejectFile } from '@/lib/parse-client'
import { busLoad, initialRouteState, routeData, routeReducer } from '@/lib/route-state'
import { saveFile } from '@/lib/save-file'
import { heading as headingFor, type Heading } from '@/lib/site'
import { FEATURED_NAMES, findTarget } from '@/lib/targets'
import { downloadName } from '@/writers/target'

import { HeroCard } from './hero-card'
import { SkyToggle } from './sky-toggle'
import { Turnstile, type TurnstileHandle } from './turnstile'

interface HeroProps {
  heading?: Heading
  intro?: string
  /** A bank-and-app page names the app, so the card arrives with it picked after the parse. */
  targetId?: string
}

const HOME_HEADING = headingFor()
const HOME_INTRO = `Stop typing transactions by hand. Drop your bank statement PDF, get the exact file ${FEATURED_NAMES} imports.`

// Inlined at build (NEXT_PUBLIC_), so the client reads it directly.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

// The sky and the street never change with the converter's state: keep them out of every dispatch.
const Scene = memo(function Scene() {
  return (
    <>
      <SkyToggle />
      <Street className="pointer-events-none absolute inset-x-0 bottom-0 h-[300px] w-full" />
    </>
  )
})

export function Hero({ heading = HOME_HEADING, intro = HOME_INTRO, targetId }: HeroProps) {
  const [state, dispatch] = useReducer(routeReducer, initialRouteState)
  const requestIdRef = useRef(0)
  const turnstileRef = useRef<TurnstileHandle>(null)

  const handleFile = async (file: File) => {
    dispatch({ type: 'FILE_CHOSEN', file })

    const rejectCode = rejectFile(file)
    if (rejectCode) {
      dispatch({ type: 'FILE_REJECTED', code: rejectCode })
      return
    }

    const requestId = ++requestIdRef.current
    dispatch({ type: 'PARSE_STARTED', requestId })

    let token: string
    try {
      const handle = turnstileRef.current
      if (!handle) throw new Error('turnstile_not_ready')
      token = await handle.getToken()
    } catch {
      dispatch({ type: 'PARSE_FAILED', requestId, code: 'turnstile_failed' })
      return
    }

    const result = await parseStatement(file, token)
    dispatch(
      result.ok
        ? { type: 'PARSE_OK', requestId, data: result.data, targetId }
        : { type: 'PARSE_FAILED', requestId, code: result.code },
    )
  }

  // Stable callbacks so the memoised app tiles skip re-renders. data keeps its identity from
  // the parse through every target change, so handleDownload only changes on a new statement.
  const data = routeData(state)

  const handleChoose = useCallback((targetId: string) => dispatch({ type: 'TARGET_CHOSEN', targetId }), [])

  const handleDownload = useCallback(
    (targetId: string) => {
      const target = findTarget(targetId)
      if (!data || !target) return
      dispatch({ type: 'TARGET_CHOSEN', targetId })
      let contents: string
      try {
        contents = target.write(data)
      } catch {
        dispatch({ type: 'WRITE_FAILED' })
        return
      }
      saveFile(contents, downloadName(target, data), target.fileExtension)
      dispatch({ type: 'DOWNLOADED' })
    },
    [data],
  )

  const handleRetry = () => {
    if ('file' in state) void handleFile(state.file)
  }

  const load = busLoad(state)

  return (
    <section aria-label="Danfo: statement to budget app" className="sky-scene relative overflow-hidden">
      <Scene />
      <div className="pointer-events-none absolute inset-x-0 bottom-[34px] h-[180px]">
        <div className="dn-drive absolute bottom-0 left-[6%] w-[220px] sm:w-[310px]" data-load={load}>
          <Danfo load={load} className="block w-full" />
        </div>
      </div>

      <div className="pointer-events-none relative mx-auto grid max-w-[1200px] items-start gap-10 px-5 pt-8 pb-[440px] lg:grid-cols-[minmax(0,1fr)_480px] lg:pt-14 lg:pb-[390px]">
        <div className="pointer-events-auto flex flex-col gap-5 lg:pt-6">
          <span className="self-start rounded-full border-2 border-ink bg-paper text-ink px-3.5 py-1.5 font-mono text-[11px] font-medium sm:text-[13px]">
            Free · No sign-up · Nothing stored
          </span>
          <h1 className="font-display text-[clamp(26px,8.2vw,32px)] leading-[1.15] lg:text-[62px] lg:leading-[1.1]">
            {heading.line}
            <br />
            <span className="mt-2 inline-block rounded-lg border-[3px] border-ink bg-yellow text-ink px-2.5 pt-0.5 pb-1.5 shadow-hard-4 lg:mt-2.5 lg:px-4 lg:pb-2.5 lg:shadow-hard-6">
              {heading.plate}
            </span>
          </h1>
          <p className="max-w-[540px] sky-text text-base leading-relaxed lg:text-xl">
            {intro}
          </p>
        </div>

        <HeroCard
          state={state}
          onFile={(file) => void handleFile(file)}
          onChoose={handleChoose}
          onDownload={handleDownload}
          onRetry={handleRetry}
          onReset={() => dispatch({ type: 'RESET' })}
        >
          <Turnstile ref={turnstileRef} siteKey={TURNSTILE_SITE_KEY} />
        </HeroCard>
      </div>
    </section>
  )
}
