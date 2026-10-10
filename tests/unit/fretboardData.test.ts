import { describe, expect, it } from 'vitest'
import { Pattern, Setup } from '@data/constants'
import { defaultDataFor, FretboardData, isFingeringView } from '@/lib/fretboardData'

const chord = (patch: Partial<FretboardData>): FretboardData => ({ ...defaultDataFor(Setup.Chord), ...patch })

describe('isFingeringView', () => {
  it('is the Position view of a triad or power chord', () => {
    expect(isFingeringView(chord({ currentPattern: Pattern.Triad, chordView: 'fingering' }), Setup.Chord)).toBe(true)
    expect(isFingeringView(chord({ currentPattern: Pattern.Power, chordView: 'fingering' }), Setup.Chord)).toBe(true)
  })

  it('is off in the Shapes view, including saves from before the view existed', () => {
    expect(isFingeringView(chord({ chordView: 'shapes' }), Setup.Chord)).toBe(false)
    expect(isFingeringView(chord({}), Setup.Chord)).toBe(false)
  })

  it('is off for chords without fingerings', () => {
    expect(isFingeringView(chord({ currentPattern: Pattern.Seventh, chordView: 'fingering' }), Setup.Chord)).toBe(false)
  })

  it('is off on the Scale page', () => {
    expect(isFingeringView(chord({ currentPattern: Pattern.Triad, chordView: 'fingering' }), Setup.Scale)).toBe(false)
  })
})
