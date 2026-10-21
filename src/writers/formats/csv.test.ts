import { describe, expect, it } from 'vitest'

import { csvField, csvFile } from './csv'

describe('csv plumbing', () => {
  it('escapes commas, quotes and newlines', () => {
    expect(csvField('plain')).toBe('plain')
    expect(csvField('a,b')).toBe('"a,b"')
    expect(csvField('say "hi"')).toBe('"say ""hi"""')
  })

  it('joins a header and rows with a trailing newline', () => {
    expect(csvFile(['a', 'b'], [['1', '2']])).toBe('a,b\n1,2\n')
  })
})
