import { describe, it, expect } from 'vitest'
import { pathForView, viewFromPath } from '@/lib/pageRoute'

describe('page route', () => {
  it('round-trips every view through its path', () => {
    for (const view of ['scale', 'chord', 'progression', 'library'] as const) {
      expect(viewFromPath(pathForView(view))).toBe(view)
    }
  })

  it('puts pages under the app base path', () => {
    expect(pathForView('scale')).toBe('/fret-wizard/scale')
    expect(pathForView('progression')).toBe('/fret-wizard/chord-progression')
  })

  it('accepts a trailing slash', () => {
    expect(viewFromPath('/fret-wizard/chord/')).toBe('chord')
  })

  it('falls back to the Scale page for the app root or an unknown path', () => {
    expect(viewFromPath('/fret-wizard/')).toBe('scale')
    expect(viewFromPath('/fret-wizard')).toBe('scale')
    expect(viewFromPath('/fret-wizard/nope')).toBe('scale')
  })
})
