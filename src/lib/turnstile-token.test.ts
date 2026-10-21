import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTokenSource } from './turnstile-token'

function fakeWidget() {
  return { execute: vi.fn<(id: string) => void>(), reset: vi.fn<(id: string) => void>() }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createTokenSource', () => {
  it('executes the widget and resolves with the token it hands back', async () => {
    const source = createTokenSource()
    const widget = fakeWidget()
    const token = source.request(widget, 'w1')
    expect(widget.execute).toHaveBeenCalledWith('w1')
    expect(widget.reset).not.toHaveBeenCalled()
    source.resolve('tok-1')
    await expect(token).resolves.toBe('tok-1')
  })

  it('resets before every request after the first: a token is single-use', async () => {
    const source = createTokenSource()
    const widget = fakeWidget()
    const first = source.request(widget, 'w1')
    source.resolve('tok-1')
    await first

    const second = source.request(widget, 'w1')
    expect(widget.reset).toHaveBeenCalledTimes(1)
    expect(widget.reset.mock.invocationCallOrder[0]).toBeLessThan(widget.execute.mock.invocationCallOrder[1]!)
    source.resolve('tok-2')
    await expect(second).resolves.toBe('tok-2')
  })

  it('rejects when the widget errors or the token expires', async () => {
    const source = createTokenSource()
    const token = source.request(fakeWidget(), 'w1')
    source.reject('turnstile_error')
    await expect(token).rejects.toThrow('turnstile_error')
  })

  it('gives up after the timeout instead of hanging', async () => {
    const source = createTokenSource(1000)
    const token = source.request(fakeWidget(), 'w1')
    vi.advanceTimersByTime(1000)
    await expect(token).rejects.toThrow('turnstile_timeout')
  })

  it('rejects an earlier request that a newer one replaced', async () => {
    const source = createTokenSource()
    const widget = fakeWidget()
    const stale = source.request(widget, 'w1')
    const fresh = source.request(widget, 'w1')
    source.resolve('tok')
    await expect(stale).rejects.toThrow('turnstile_superseded')
    await expect(fresh).resolves.toBe('tok')
  })
})
