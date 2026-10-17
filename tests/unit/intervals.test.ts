import { describe, expect, it } from 'vitest'
import { Degree, Pattern, Tonality, degreeInPattern, majorKeyToNumber } from '@data/constants'
import { getScale, getRoots, getMinorSeconds, getSeconds, getMinorThirds, getThirds, getFourths, getTritones, getFifths, getMinorSixths, getSixths, getMinorSevenths, getSevenths } from '@data/intervals'

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

const mod12 = (value: number) => ((value % 12) + 12) % 12
const frets = Array.from({ length: 24 }, (_, i) => i + 1)

// Each formula in semitones, written out independently of degreeInPattern
const formulas: Record<Pattern, Record<Tonality, number[]>> = {
  [Pattern.Pentatonic]: { [Tonality.MAJOR]: [0, 2, 4, 7, 9], [Tonality.MINOR]: [0, 3, 5, 7, 10] },
  [Pattern.Blue]: { [Tonality.MAJOR]: [0, 2, 3, 4, 7, 9], [Tonality.MINOR]: [0, 3, 5, 6, 7, 10] },
  [Pattern.Diatonic]: { [Tonality.MAJOR]: [0, 2, 4, 5, 7, 9, 11], [Tonality.MINOR]: [0, 2, 3, 5, 7, 8, 10] },
  [Pattern.Chromatic]: { [Tonality.MAJOR]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [Tonality.MINOR]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  [Pattern.Power]: { [Tonality.MAJOR]: [0, 7], [Tonality.MINOR]: [0, 7] },
  [Pattern.Triad]: { [Tonality.MAJOR]: [0, 4, 7], [Tonality.MINOR]: [0, 3, 7] },
  [Pattern.Seventh]: { [Tonality.MAJOR]: [0, 4, 7, 11], [Tonality.MINOR]: [0, 3, 7, 10] },
  [Pattern.Add9]: { [Tonality.MAJOR]: [0, 2, 4, 7], [Tonality.MINOR]: [0, 2, 3, 7] },
  [Pattern.Add11]: { [Tonality.MAJOR]: [0, 4, 5, 7], [Tonality.MINOR]: [0, 3, 5, 7] },
  [Pattern.Add13]: { [Tonality.MAJOR]: [0, 4, 7, 9], [Tonality.MINOR]: [0, 3, 7, 9] },
  [Pattern.Dominant]: { [Tonality.MAJOR]: [0, 4, 7, 10], [Tonality.MINOR]: [0, 4, 7, 10] },
}

const tonalities = [Tonality.MAJOR, Tonality.MINOR]

describe('degreeInPattern', () => {
  for (const pattern of Object.values(Pattern)) {
    for (const tonality of tonalities) {
      it(`spells ${tonality} ${pattern}`, () => {
        expect(degreeInPattern(pattern, tonality)!.map(degree => semitones[degree]).sort((a, b) => a - b)).toEqual(formulas[pattern][tonality])
      })
    }
  }
})

describe('getScale', () => {
  for (const tonality of tonalities) {
    for (const pattern of Object.values(Pattern)) {
      for (const [key, number] of Object.entries(keys)) {
        it(`lights ${key} ${tonality} ${pattern}`, () => {
          expect(litPitchClasses(getScale(tonality, pattern, key))).toEqual(expectedPitchClasses(pattern, tonality, number))
        })
      }
    }
  }

  it('lights every fret of every pattern tone on every string, in every key spelling', () => {
    for (const tonality of tonalities) {
      for (const pattern of Object.values(Pattern)) {
        for (const key of Object.keys(majorKeyToNumber)) {
          const board = getScale(tonality, pattern, key)
          const tones = expectedPitchClasses(pattern, tonality, majorKeyToNumber[key])
          for (const [string, open] of Object.entries(openStrings)) {
            frets.forEach(fret => {
              expect(board[string as keyof typeof openStrings][fret - 1], `${key} ${tonality} ${pattern}, ${string} string, fret ${fret}`).toBe(tones.has(mod12(open + fret)))
            })
          }
        }
      }
    }
  })
})

describe('interval tables', () => {
  const getters: Record<Degree, typeof getRoots> = {
    [Degree.roots]: getRoots, [Degree.minorSeconds]: getMinorSeconds, [Degree.seconds]: getSeconds,
    [Degree.minorThirds]: getMinorThirds, [Degree.thirds]: getThirds, [Degree.fourths]: getFourths,
    [Degree.tritones]: getTritones, [Degree.fifths]: getFifths, [Degree.minorSixths]: getMinorSixths,
    [Degree.sixths]: getSixths, [Degree.minorSevenths]: getMinorSevenths, [Degree.sevenths]: getSevenths,
  }

  // MyString lights fret n (1 to 24, the open string through fret 12) when the list includes n
  it('lists exactly the frets 1 to 24 where each degree falls, on every string and in every key', () => {
    for (const [degree, getter] of Object.entries(getters)) {
      for (const key of Object.keys(majorKeyToNumber)) {
        for (const [string, open] of Object.entries(openStrings)) {
          const listed = getter(Tonality.MAJOR, key, string).filter(fret => fret >= 1 && fret <= 24).sort((a, b) => a - b)
          const expected = frets.filter(fret => mod12(open + fret - majorKeyToNumber[key]) === semitones[degree])
          expect(listed, `${degree} in ${key}, ${string} string`).toEqual(expected)
        }
      }
    }
  })
})
