import { describe, expect, it } from 'vitest'
import { Pattern, Tonality, degreeInPattern } from '@data/constants'
import { degreeLabel } from '@data/patternNames'

const { MAJOR, MINOR } = Tonality

const labels: [Pattern, Tonality, string][] = [
  [Pattern.Pentatonic, MAJOR, 'R 2 3 5 6'],
  [Pattern.Pentatonic, MINOR, 'R ♭3 4 5 ♭7'],
  [Pattern.Blue, MAJOR, 'R 2 ♭3 3 5 6'],
  [Pattern.Blue, MINOR, 'R ♭3 4 ♭5 5 ♭7'],
  [Pattern.Diatonic, MAJOR, 'R 2 3 4 5 6 7'],
  [Pattern.Diatonic, MINOR, 'R 2 ♭3 4 5 ♭6 ♭7'],
  [Pattern.Chromatic, MAJOR, 'R ♭2 2 ♭3 3 4 ♭5 5 ♭6 6 ♭7 7'],
  [Pattern.Power, MAJOR, 'R 5'],
  [Pattern.Triad, MAJOR, 'R 3 5'],
  [Pattern.Triad, MINOR, 'R ♭3 5'],
  [Pattern.Seventh, MAJOR, 'R 3 5 7'],
  [Pattern.Seventh, MINOR, 'R ♭3 5 ♭7'],
  [Pattern.Dominant, MAJOR, 'R 3 5 ♭7'],
  [Pattern.Add9, MAJOR, 'R 3 5 9'],
  [Pattern.Add9, MINOR, 'R ♭3 5 9'],
  [Pattern.Add11, MAJOR, 'R 3 5 11'],
  [Pattern.Add11, MINOR, 'R ♭3 5 11'],
  [Pattern.Add13, MAJOR, 'R 3 5 13'],
  [Pattern.Add13, MINOR, 'R ♭3 5 13'],
]

describe('degreeLabel', () => {
  for (const [pattern, tonality, expected] of labels) {
    it(`labels ${tonality} ${pattern} ${expected}`, () => {
      expect(new Set(degreeInPattern(pattern, tonality)!.map(degree => degreeLabel(degree, pattern)))).toEqual(new Set(expected.split(' ')))
    })
  }
})
