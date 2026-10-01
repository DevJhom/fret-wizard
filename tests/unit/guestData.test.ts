import { describe, it, expect, beforeEach } from 'vitest'
import { Pattern, Setup, Theme, Tonality } from '@data/constants'
import { defaultDataFor } from '@/lib/fretboardData'
import { clearGuestData, collectGuestData } from '@services/guestData'

const save = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))

describe('guest data', () => {
  beforeEach(() => localStorage.clear())

  it('returns null when the browser has nothing to import', () => {
    localStorage.setItem('theme', Theme.light)
    expect(collectGuestData()).toBeNull()
  })

  it('collects cards, both stacks and the progression', () => {
    const scale = { ...defaultDataFor(Setup.Scale), currentKey: 'A' }
    const chord = { ...defaultDataFor(Setup.Chord), currentKey: 'E' }
    save('libraryCards', [{ id: 'card-1', name: 'Shapes', setup: Setup.Chord, fretboards: [chord], createdAt: 5 }])
    save('scaleFretboardList', [scale])
    save('chordFretboardList', [chord, chord])
    save('chordProgression', { key: 'G', tonality: Tonality.MAJOR, progression: [{ id: 'p-1', degree: 4 }] })

    expect(collectGuestData()).toEqual({
      libraryCards: [{ name: 'Shapes', setup: Setup.Chord, fretboards: [chord] }],
      workspaces: { scale: { fretboards: [scale] }, chord: { fretboards: [chord, chord] } },
      chordProgression: { key: 'G', tonality: Tonality.MAJOR, progression: [{ id: 'p-1', degree: 4 }] },
    })
  })

  it('converts legacy single-fretboard cards', () => {
    const data = { ...defaultDataFor(Setup.Scale), currentKey: 'D' }
    save('libraryCards', [{ id: 'old', name: 'Old card', data, createdAt: 1 }])
    expect(collectGuestData()?.libraryCards).toEqual([{ name: 'Old card', setup: Setup.Scale, fretboards: [data] }])
  })

  it('picks up the legacy currentFretboard/fretboardList keys', () => {
    const scale = { ...defaultDataFor(Setup.Scale), currentKey: 'F' }
    const chord = { ...defaultDataFor(Setup.Chord), currentKey: 'B' }
    save('currentFretboard', scale)
    save('fretboardList', [scale, chord])

    const data = collectGuestData()
    expect(data?.workspaces?.scale?.fretboards).toEqual([scale])
    expect(data?.workspaces?.chord?.fretboards).toEqual([chord])
  })

  it('fills fields that older fretboards are missing', () => {
    save('scaleFretboardList', [{
      fretAmount: 15,
      currentKey: 'D',
      currentPattern: Pattern.Diatonic,
      currentTonality: Tonality.MAJOR,
      currentAccidental: 'sharp',
      currentHighlightNotes: ['roots'],
    }])

    const [fretboard] = collectGuestData()?.workspaces?.scale?.fretboards ?? []
    expect(fretboard).toMatchObject({
      fretAmount: 15,
      currentKey: 'D',
      currentSetup: Setup.Scale,
      currentHighlightNotes: ['roots'],
      currentChordPosition: 0,
      currentStrings: { E: true, A: true, D: true, G: true, B: true, e: true },
      currentCAGED: { CShape: true, AShape: true, GShape: true, EShape: true, DShape: true },
    })
  })

  it('repairs values the server would reject', () => {
    save('libraryCards', [{ id: 'c', name: '   ', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)], createdAt: 1 }])
    save('chordProgression', { key: 'C♯', tonality: Tonality.MAJOR, progression: [{ id: 'p-1', degree: 2 }] })

    const data = collectGuestData()
    expect(data?.libraryCards?.[0].name).toBe('Untitled card')
    expect(data?.chordProgression).toEqual({ key: 'C', tonality: Tonality.MAJOR, progression: [{ id: 'p-1', degree: 2 }] })
  })

  it('clearGuestData removes every synced key and keeps the theme', () => {
    localStorage.setItem('theme', Theme.light)
    for (const key of ['libraryCards', 'scaleFretboardList', 'chordFretboardList', 'scaleCurrentFretboard', 'chordCurrentFretboard', 'chordProgression']) {
      localStorage.setItem(key, '[]')
    }

    clearGuestData()
    expect(localStorage.length).toBe(1)
    expect(localStorage.getItem('theme')).toBe(Theme.light)
  })
})
