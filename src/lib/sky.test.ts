import { describe, expect, it, vi } from 'vitest'

import { lagosMinutes, NIGHTFALL, SKY_SCRIPT, skyFor, SUNRISE, SUNSET } from './sky'

describe('skyFor', () => {
  it('is night from 19:00 until 06:30', () => {
    expect(skyFor(NIGHTFALL).night).toBe(true)
    expect(skyFor(23 * 60).night).toBe(true)
    expect(skyFor(2 * 60).night).toBe(true)
    expect(skyFor(SUNRISE - 1).night).toBe(true)
  })

  it('rises low on the left and sets low on the right', () => {
    const rise = skyFor(SUNRISE)
    const set = skyFor(SUNSET)
    expect(rise).toMatchObject({ night: false, x: 8, y: 50, dusk: true })
    expect(set).toMatchObject({ night: false, x: 92, y: 50, dusk: true })
  })

  it('sits highest and central around midday', () => {
    const noon = skyFor(Math.round((SUNRISE + SUNSET) / 2))
    expect(noon.x).toBe(50)
    expect(noon.y).toBe(15)
    expect(noon.dusk).toBe(false)
  })

  it('holds on the right horizon between sunset and nightfall', () => {
    expect(skyFor(SUNSET + 10)).toMatchObject({ night: false, x: 92 })
  })
})

describe('lagosMinutes', () => {
  it('reads the clock in Lagos (UTC+1, no daylight saving)', () => {
    expect(lagosMinutes(new Date(Date.UTC(2026, 9, 20, 11, 0)))).toBe(12 * 60)
    expect(lagosMinutes(new Date(Date.UTC(2026, 5, 1, 23, 30)))).toBe(30)
  })
})

describe('SKY_SCRIPT', () => {
  it('inlines its helpers so the pre-paint script needs no imports', () => {
    expect(SKY_SCRIPT).toContain('Africa/Lagos')
    expect(SKY_SCRIPT).toContain('Math.sin')
    expect(SKY_SCRIPT).not.toMatch(/\bimport\b|\brequire\(/)
  })

  it('writes the same sky onto <html> that applySky would', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 9, 20, 21, 0)))
    const props: Record<string, string> = {}
    const root = { dataset: {} as Record<string, string>, style: { setProperty: (k: string, v: string) => (props[k] = v) } }
    new Function('document', SKY_SCRIPT)({ documentElement: root })
    vi.useRealTimers()
    expect(root.dataset).toEqual({ sky: 'night', dusk: 'false' })
    expect(props).toEqual({ '--sun-x': '62%', '--sun-y': '25%' })
  })
})
