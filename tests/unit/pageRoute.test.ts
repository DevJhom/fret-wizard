import { describe, it, expect } from 'vitest'
import { pathForView, routeFromPath, viewFromPath } from '@/lib/pageRoute'

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

  it('carries a card id on the Scale and Chord pages', () => {
    expect(pathForView('scale', 'abc-123')).toBe('/fret-wizard/scale/abc-123')
    expect(routeFromPath('/fret-wizard/scale/abc-123')).toEqual({ view: 'scale', cardId: 'abc-123' })
    expect(routeFromPath('/fret-wizard/chord/abc-123/')).toEqual({ view: 'chord', cardId: 'abc-123' })
  })

  it('ignores a card id on other pages', () => {
    expect(pathForView('library', 'abc-123')).toBe('/fret-wizard/library')
    expect(routeFromPath('/fret-wizard/library/abc-123')).toEqual({ view: 'library', cardId: null })
  })

  it('has no card id for plain pages', () => {
    expect(pathForView('scale', null)).toBe('/fret-wizard/scale')
    expect(routeFromPath('/fret-wizard/scale')).toEqual({ view: 'scale', cardId: null })
  })

  it('survives odd paths', () => {
    expect(routeFromPath('/fret-wizard/scale/a/b')).toEqual({ view: 'scale', cardId: null })
    expect(routeFromPath('/fret-wizard/scale/%E0%A4%A')).toEqual({ view: 'scale', cardId: null })
    expect(routeFromPath('/fret-wizard/nope/abc')).toEqual({ view: 'scale', cardId: null })
  })
})
