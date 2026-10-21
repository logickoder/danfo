// Time of day in the hero (DESIGN.md, Time of day). The scene follows the clock in Lagos, not
// the visitor's, because the street is in Lagos. Pure helpers plus the pre-paint script that
// applies them, so the right scene shows on first paint with no flash and no hydration mismatch.

/** 06:30, roughly sunrise in Lagos, in minutes since midnight. */
export const SUNRISE = 6 * 60 + 30
/** 18:45, the sun sits on the right horizon. */
export const SUNSET = 18 * 60 + 45
/** 19:00, the night scene takes over until sunrise. */
export const NIGHTFALL = 19 * 60

/** The three moments skyFor works from. Passed in, not closed over: skyFor is inlined. */
export interface SkyTimes {
  sunrise: number
  sunset: number
  nightfall: number
}

export const SKY_TIMES: SkyTimes = { sunrise: SUNRISE, sunset: SUNSET, nightfall: NIGHTFALL }

export interface Sky {
  night: boolean
  /** Sun's horizontal position, percent of the sky band from the left. */
  x: number
  /** Sun's vertical position, percent of the sky band from the top (the arc never drops below 50 so the sun clears the roofline). */
  y: number
  /** Near sunrise or sunset: the sun warms to orange. */
  dusk: boolean
}

// skyFor, lagosMinutes and applySky are self-contained on purpose: SKY_SCRIPT inlines their
// source, so each may use nothing but its arguments and browser globals.

/** Where the sun is at `minutes` past midnight, Lagos time. */
export function skyFor(minutes: number, times: SkyTimes = SKY_TIMES): Sky {
  if (minutes < times.sunrise || minutes >= times.nightfall) return { night: true, x: 62, y: 25, dusk: false }
  const p = Math.min(1, Math.max(0, (minutes - times.sunrise) / (times.sunset - times.sunrise)))
  return {
    night: false,
    x: Math.round(8 + p * 84),
    y: Math.round(50 - Math.sin(Math.PI * p) * 35),
    dusk: p < 0.12 || p > 0.88,
  }
}

/** Minutes past midnight in Lagos for `date`. */
export function lagosMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return get('hour') * 60 + get('minute')
}

/** Writes a Sky onto <html>: the night flag for CSS, and the sun's position as variables. */
export function applySky(sky: Sky, root: HTMLElement = document.documentElement): void {
  root.dataset.sky = sky.night ? 'night' : 'day'
  root.dataset.dusk = sky.dusk ? 'true' : 'false'
  root.style.setProperty('--sun-x', `${sky.x}%`)
  root.style.setProperty('--sun-y', `${sky.y}%`)
}

/** Flips the scene on <html> by hand (the sun or moon button). The sun keeps its clock position. */
export function showSky(night: boolean, root: HTMLElement = document.documentElement): void {
  root.dataset.sky = night ? 'night' : 'day'
}

/** Inline <head> script: runs before first paint. Silent on failure; the day scene is the default. */
export const SKY_SCRIPT = `(function(){try{(${applySky.toString()})((${skyFor.toString()})((${lagosMinutes.toString()})(new Date()),${JSON.stringify(SKY_TIMES)}))}catch(e){}})();`
