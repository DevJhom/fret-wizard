import { describe, expect, it } from 'vitest'
import { Pattern, Setup, Tonality } from '@data/constants'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'
import { cardMeta, filterCounts, fretboardLabel, matchesQuery, normalizeAccidentals, savedDate, visibleCards } from '@/lib/libraryView'

const fb = (setup: Setup, key: string, tonality: Tonality, pattern: Pattern): FretboardData =>
  ({ ...defaultDataFor(setup), currentKey: key, currentTonality: tonality, currentPattern: pattern })

let nextId = 0
const card = (name: string, setup: Setup, fretboards: FretboardData[], createdAt = 0): LibraryCard =>
  ({ id: `id-${nextId++}`, name, setup, fretboards, createdAt })

const bluesInA = card('Blues jam', Setup.Scale, [fb(Setup.Scale, 'A', Tonality.MINOR, Pattern.Blue)], 3)
const flatMinor = card('Dark stuff', Setup.Scale, [fb(Setup.Scale, 'B♭', Tonality.MINOR, Pattern.Pentatonic)], 1)
const sharpChords = card('Sevenths', Setup.Chord, [fb(Setup.Chord, 'F♯', Tonality.MAJOR, Pattern.Seventh)], 2)
const all = [bluesInA, flatMinor, sharpChords]

describe('fretboardLabel', () => {
  it('uses the stack chip symbol', () => {
    expect(fretboardLabel(fb(Setup.Scale, 'A', Tonality.MINOR, Pattern.Pentatonic), Setup.Scale)).toBe('Am Pentatonic')
    expect(fretboardLabel(fb(Setup.Chord, 'G', Tonality.MAJOR, Pattern.Seventh), Setup.Chord)).toBe('Gmaj7')
    expect(fretboardLabel(fb(Setup.Chord, 'E', Tonality.MAJOR, Pattern.Power), Setup.Chord)).toBe('E5')
  })
})

describe('normalizeAccidentals', () => {
  it('turns typed accidentals into the symbols the app uses', () => {
    expect(normalizeAccidentals('Bb')).toBe('B♭')
    expect(normalizeAccidentals('bbm')).toBe('b♭m')
    expect(normalizeAccidentals('F#')).toBe('F♯')
    expect(normalizeAccidentals('Eb major')).toBe('E♭ major')
  })

  it('leaves words alone', () => {
    expect(normalizeAccidentals('Blues')).toBe('Blues')
    expect(normalizeAccidentals('dub')).toBe('dub')
  })
})

describe('matchesQuery', () => {
  it('matches the name, key, quality and pattern, ignoring case', () => {
    expect(matchesQuery(bluesInA, 'blues JAM')).toBe(true)
    expect(matchesQuery(bluesInA, 'minor')).toBe(true)
    expect(matchesQuery(bluesInA, 'blues scale')).toBe(true)
    expect(matchesQuery(bluesInA, 'major')).toBe(false)
  })

  it('matches typed accidentals', () => {
    expect(matchesQuery(flatMinor, 'Bb')).toBe(true)
    expect(matchesQuery(flatMinor, 'bbm')).toBe(true)
    expect(matchesQuery(sharpChords, 'F#')).toBe(true)
    expect(matchesQuery(sharpChords, 'Bb')).toBe(false)
  })

  it('matches everything for a blank query', () => {
    expect(matchesQuery(bluesInA, '   ')).toBe(true)
  })
})

describe('visibleCards', () => {
  it('filters by type', () => {
    expect(visibleCards(all, Setup.Chord, '', 'newest')).toEqual([sharpChords])
    expect(visibleCards(all, 'all', '', 'newest')).toHaveLength(3)
  })

  it('sorts newest, oldest, and by name', () => {
    expect(visibleCards(all, 'all', '', 'newest')).toEqual([bluesInA, sharpChords, flatMinor])
    expect(visibleCards(all, 'all', '', 'oldest')).toEqual([flatMinor, sharpChords, bluesInA])
    expect(visibleCards(all, 'all', '', 'name')).toEqual([bluesInA, flatMinor, sharpChords])
  })

  it('sorts names naturally and ignores case', () => {
    const named = ['Card 10', 'card 3', 'Card 2'].map(name => card(name, Setup.Scale, []))
    expect(visibleCards(named, 'all', '', 'name').map(c => c.name)).toEqual(['Card 2', 'card 3', 'Card 10'])
  })

  it('does not reorder the array it was given', () => {
    const input = [...all]
    visibleCards(input, 'all', '', 'name')
    expect(input).toEqual(all)
  })
})

describe('filterCounts', () => {
  it('counts each type', () => {
    expect(filterCounts(all)).toEqual({ all: 3, [Setup.Scale]: 2, [Setup.Chord]: 1 })
  })
})

describe('savedDate and cardMeta', () => {
  const now = new Date(2026, 9, 4).getTime()

  it('drops the year for this year and keeps it otherwise', () => {
    expect(savedDate(new Date(2026, 9, 2).getTime(), now)).toBe('Oct 2')
    expect(savedDate(new Date(2025, 2, 3).getTime(), now)).toBe('Mar 3, 2025')
  })

  it('counts fretboards, including a card with none', () => {
    const at = new Date(2026, 8, 28).getTime()
    expect(cardMeta(card('One', Setup.Scale, [fb(Setup.Scale, 'C', Tonality.MAJOR, Pattern.Pentatonic)], at), now)).toBe('1 fretboard · Saved Sep 28')
    expect(cardMeta(card('Two', Setup.Scale, [bluesInA.fretboards[0], flatMinor.fretboards[0]], at), now)).toBe('2 fretboards · Saved Sep 28')
    expect(cardMeta(card('None', Setup.Scale, [], at), now)).toBe('0 fretboards · Saved Sep 28')
  })
})
