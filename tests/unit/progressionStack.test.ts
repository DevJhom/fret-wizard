import { describe, expect, it } from 'vitest'
import { Degree, Pattern, Tonality } from '@data/constants'
import { progressionChordView, progressionFretboard } from '@/lib/progressionStack'
import type { ProgressionChord } from '@services/adapters/localStorageAdapter'

const { MAJOR, MINOR } = Tonality

const chord = (degree: number, extra: Partial<ProgressionChord> = {}): ProgressionChord => ({ id: 'id', degree, type: 'triad', ...extra })

describe('progressionFretboard', () => {
  it('shows the chord the key gives, with every tone and the defaults', () => {
    const fretboard = progressionFretboard('C', MAJOR, chord(1))
    expect(fretboard).toMatchObject({ currentKey: 'D', currentPattern: Pattern.Triad, currentTonality: MINOR, fretAmount: 24 })
    expect(fretboard.currentHighlightNotes).toEqual([Degree.roots, Degree.minorThirds, Degree.fifths])
    expect(Object.values(fretboard.currentCAGED).every(Boolean)).toBe(true)
  })

  it('applies the saved view', () => {
    const view = {
      hiddenTones: [Degree.fifths],
      currentCAGED: { CShape: false, AShape: true, GShape: false, EShape: false, DShape: false },
      currentStrings: { E: false, A: true, D: true, G: true, B: true, e: true },
      fretAmount: 15,
    }
    const fretboard = progressionFretboard('C', MAJOR, chord(1, { view }))
    expect(fretboard.currentHighlightNotes).toEqual([Degree.roots, Degree.minorThirds])
    expect(fretboard.currentCAGED).toEqual(view.currentCAGED)
    expect(fretboard.currentStrings).toEqual(view.currentStrings)
    expect(fretboard.fretAmount).toBe(15)
  })

  it('keeps a hidden tone hidden, and shows tones the chord gains, when the key changes its quality', () => {
    const view = progressionChordView({ ...progressionFretboard('C', MAJOR, chord(1)), currentHighlightNotes: [Degree.roots, Degree.fifths] })
    // ii in A minor is diminished: the ♭3 stays hidden, the ♭5 is new
    const fretboard = progressionFretboard('A', MINOR, chord(1, { view }))
    expect(fretboard.currentPattern).toBe(Pattern.Diminished)
    expect(fretboard.currentHighlightNotes).toEqual([Degree.roots, Degree.tritones])
  })
})

describe('progressionChordView', () => {
  it('saves the tones it hides, not the ones it shows', () => {
    const fretboard = { ...progressionFretboard('C', MAJOR, chord(0)), currentHighlightNotes: [Degree.roots] }
    expect(progressionChordView(fretboard).hiddenTones).toEqual([Degree.thirds, Degree.fifths])
  })

  it('reads back as the fretboard it was made from', () => {
    const edited = { ...progressionFretboard('G', MAJOR, chord(4, { type: 'seventh' })), fretAmount: 18, currentHighlightNotes: [Degree.roots, Degree.minorSevenths] }
    expect(progressionFretboard('G', MAJOR, chord(4, { type: 'seventh', view: progressionChordView(edited) }))).toEqual(edited)
  })
})
