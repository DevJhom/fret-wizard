import { describe, expect, it } from 'vitest'
import { Pattern, Tonality, degreeInPattern } from '@data/constants'
import { getScale } from '@data/intervals'

// Pitch class of each open string, C = 0
const openStrings = { E: 4, A: 9, D: 2, G: 7, B: 11, e: 4 }
const keys = { C: 0, 'D♭': 1, D: 2, 'E♭': 3, E: 4, F: 5, 'F♯': 6, G: 7, 'A♭': 8, A: 9, 'B♭': 10, B: 11 }

const semitones: Record<string, number> = {
  roots: 0, 'minor seconds': 1, seconds: 2, 'minor thirds': 3, thirds: 4, fourths: 5,
  tritones: 6, fifths: 7, 'minor sixths': 8, sixths: 9, 'minor sevenths': 10, sevenths: 11,
}

// Pitch classes lit on the board; board[string][i] is fret i + 1
const litPitchClasses = (board: Record<string, boolean[]>) => {
  const lit = new Set<number>()
  Object.entries(openStrings).forEach(([string, open]) => {
    board[string].forEach((on, i) => { if (on) lit.add((open + i + 1) % 12) })
  })
  return lit
}

const expectedPitchClasses = (pattern: Pattern, tonality: Tonality, key: number) =>
  new Set(degreeInPattern(pattern, tonality)!.map(degree => (semitones[degree] + key) % 12))

describe('getScale', () => {
  const patterns = [Pattern.Pentatonic, Pattern.Diatonic, Pattern.Triad, Pattern.Seventh]

  for (const tonality of [Tonality.MAJOR, Tonality.MINOR]) {
    for (const pattern of patterns) {
      for (const [key, number] of Object.entries(keys)) {
        it(`lights ${key} ${tonality} ${pattern}`, () => {
          expect(litPitchClasses(getScale(tonality, pattern, key))).toEqual(expectedPitchClasses(pattern, tonality, number))
        })
      }
    }
  }
})
