'use client'

import { useEffect, useRef, useState } from 'react'

import { applySky, lagosMinutes, showSky, skyFor } from '@/lib/sky'

// The sun (or moon) is the time-of-day control. Default is the Lagos clock, set before first
// paint by the script in layout.tsx. A tap flips the scene for this visit only: nothing is
// stored, so a reload goes back to the clock.

const CLOCK_REFRESH_MS = 10 * 60 * 1000
const STARS = [
  [8, 14], [22, 6], [37, 22], [49, 9], [63, 18], [78, 7], [88, 24], [95, 12], [15, 30], [56, 32],
] as const

export function SkyToggle() {
  const [night, setNight] = useState(false)
  // The hint waits for mount (the scene comes from the pre-paint script) and goes on first tap.
  const [showHint, setShowHint] = useState(false)
  const overridden = useRef(false)

  useEffect(() => {
    const root = document.documentElement
    setNight(root.dataset.sky === 'night')
    setShowHint(true)
    const id = setInterval(() => {
      if (overridden.current) return
      const sky = skyFor(lagosMinutes(new Date()))
      applySky(sky)
      setNight(sky.night)
    }, CLOCK_REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const flip = () => {
    const next = !night
    overridden.current = true
    showSky(next)
    setNight(next)
    setShowHint(false)
  }

  return (
    <>
      <svg className="sky-night-only pointer-events-none absolute inset-x-0 top-0 bottom-[300px] h-[calc(100%-300px)] w-full" aria-hidden="true" focusable="false">
        {STARS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={`${x}%`} cy={`${y}%`} r="1.6" className="fill-paper" opacity="0.7" />
        ))}
      </svg>
      {/* The sun's own strip of sky, just above the rooftops. The hero keeps its content clear of it. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[150px] h-[220px]">
        <div className="sun-spot pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={flip}
            aria-label={night ? 'Show Lagos by day' : 'Show Lagos at night'}
            aria-pressed={night}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink lg:h-[96px] lg:w-[96px]"
          >
            <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true" focusable="false">
              <circle className="sun-disc sky-day-only" cx="50" cy="50" r="48" />
              <g className="sky-night-only">
                <circle cx="50" cy="50" r="38" className="fill-sky" />
                <circle cx="66" cy="38" r="34" className="fill-(--sky)" />
              </g>
            </svg>
          </button>
          {showHint && (
            <span className="sky-text-soft absolute bottom-full left-1/2 mb-1 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap">
              {night ? 'Tap the moon' : 'Tap the sun'}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
