import { describe, expect, it } from 'vitest'
import { Pattern, Tonality, degreeInPattern } from '@data/constants'
import { degreeLabel, isQualityLocked, patternSubtitle, patternSymbol, patternTitle, qualityLockedReason } from '@data/patternNames'

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
  [Pattern.Add13, MAJOR, 'R 3 5 6'],
  [Pattern.Add13, MINOR, 'R ♭3 5 6'],
  [Pattern.Sus2, MAJOR, 'R 2 5'],
  [Pattern.Sus2, MINOR, 'R 2 5'],
  [Pattern.Sus4, MAJOR, 'R 4 5'],
  [Pattern.Sus4, MINOR, 'R 4 5'],
  [Pattern.Diminished, MAJOR, 'R ♭3 ♭5'],
  [Pattern.Diminished, MINOR, 'R ♭3 ♭5'],
  [Pattern.HalfDiminished, MAJOR, 'R ♭3 ♭5 ♭7'],
  [Pattern.HalfDiminished, MINOR, 'R ♭3 ♭5 ♭7'],
]

describe('degreeLabel', () => {
  for (const [pattern, tonality, expected] of labels) {
    it(`labels ${tonality} ${pattern} ${expected}`, () => {
      expect(new Set(degreeInPattern(pattern, tonality)!.map(degree => degreeLabel(degree, pattern)))).toEqual(new Set(expected.split(' ')))
    })
  }
})

describe('suspended and diminished chord names', () => {
  const names: [Pattern, string, string][] = [
    [Pattern.Sus2, 'Dsus2', 'D suspended second'],
    [Pattern.Sus4, 'Dsus4', 'D suspended fourth'],
    [Pattern.Diminished, 'D°', 'D diminished'],
    [Pattern.HalfDiminished, 'Dm7♭5', 'D half-diminished'],
  ]

  for (const [pattern, symbol, fullName] of names) {
    it(`names ${pattern} ${symbol}, whatever the quality, and locks the quality`, () => {
      for (const tonality of [MAJOR, MINOR]) {
        expect(patternTitle('D', tonality, pattern, false)).toBe(symbol)
        expect(patternSymbol('D', tonality, pattern, false)).toBe(symbol)
        expect(patternSubtitle('D', tonality, pattern, false)).toBe(fullName)
      }
      expect(isQualityLocked(pattern)).toBe(true)
    })
  }

  it('says why the quality is locked', () => {
    expect(qualityLockedReason(Pattern.Sus2)).toBe('Suspended chords have no third')
    expect(qualityLockedReason(Pattern.Sus4)).toBe('Suspended chords have no third')
    expect(qualityLockedReason(Pattern.Diminished)).toBe('Diminished is always ♭3 and ♭5')
    expect(qualityLockedReason(Pattern.HalfDiminished)).toBe('Half-diminished is always ♭3, ♭5 and ♭7')
  })
})

describe('sixth chord names', () => {
  it('names the Add13 pattern as the sixth chord it spells', () => {
    expect(patternTitle('D', MAJOR, Pattern.Add13, false)).toBe('D6')
    expect(patternSymbol('D', MINOR, Pattern.Add13, false)).toBe('Dm6')
    expect(patternSubtitle('D', MAJOR, Pattern.Add13, false)).toBe('D major sixth')
    expect(patternSubtitle('D', MINOR, Pattern.Add13, false)).toBe('D minor sixth')
    expect(isQualityLocked(Pattern.Add13)).toBe(false)
  })
})
