import { describe, it, expect } from 'vitest'
import { Pattern, Tonality, majorKeyToNumber } from '@data/constants'
import { diatonicChordPattern, diatonicChords, progressionKeys } from '@data/progressions'
import type { ChordType } from '@data/progressions'
import { patternSymbol } from '@data/patternNames'

const names = (key: string, tonality: Tonality, type?: Parameters<typeof diatonicChords>[2]) =>
  diatonicChords(key, tonality, type).map(chord => chord.name)
const numerals = (tonality: Tonality, type?: Parameters<typeof diatonicChords>[2]) =>
  diatonicChords('C', tonality, type).map(chord => chord.numeral)

describe('diatonic chords', () => {
  it('builds triads by default', () => {
    expect(names('C', Tonality.MAJOR)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'])
    expect(names('A', Tonality.MINOR)).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G'])
    expect(names('C', Tonality.MAJOR, 'triad')).toEqual(names('C', Tonality.MAJOR))
  })

  it('builds diatonic seventh chords', () => {
    expect(names('C', Tonality.MAJOR, 'seventh')).toEqual(['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5'])
    expect(names('A', Tonality.MINOR, 'seventh')).toEqual(['Am7', 'Bm7♭5', 'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7'])
    expect(numerals(Tonality.MAJOR, 'seventh')).toEqual(['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'])
    expect(numerals(Tonality.MINOR, 'seventh')).toEqual(['i7', 'iiø7', 'IIImaj7', 'iv7', 'v7', 'VImaj7', 'VII7'])
  })

  it('builds power chords from each scale root', () => {
    expect(names('E♭', Tonality.MAJOR, 'power')).toEqual(['E♭5', 'F5', 'G5', 'A♭5', 'B♭5', 'C5', 'D5'])
    expect(numerals(Tonality.MAJOR, 'power')).toEqual(['I5', 'II5', 'III5', 'IV5', 'V5', 'VI5', 'VII5'])
    expect(numerals(Tonality.MINOR, 'power')).toEqual(['I5', 'II5', 'III5', 'IV5', 'V5', 'VI5', 'VII5'])
  })

  it('keeps letter spelling in sharp keys', () => {
    expect(names('F♯', Tonality.MAJOR, 'seventh')).toEqual(['F♯maj7', 'G♯m7', 'A♯m7', 'Bmaj7', 'C♯7', 'D♯m7', 'E♯m7♭5'])
  })
})

describe('diatonicChordPattern', () => {
  const symbols = (key: string, tonality: Tonality, type: ChordType) => [0, 1, 2, 3, 4, 5, 6].map(degree => {
    const { root, pattern, tonality: quality } = diatonicChordPattern(key, tonality, degree, type)
    return patternSymbol(root, quality, pattern, false)
  })

  it('shows each chord as the Chord page names it', () => {
    expect(symbols('C', Tonality.MAJOR, 'triad')).toEqual(['Cmaj', 'Dm', 'Em', 'Fmaj', 'Gmaj', 'Am', 'B°'])
    expect(symbols('C', Tonality.MAJOR, 'seventh')).toEqual(['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5'])
    expect(symbols('A', Tonality.MINOR, 'seventh')).toEqual(['Am7', 'Bm7♭5', 'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7'])
    expect(symbols('E♭', Tonality.MAJOR, 'power')).toEqual(['E♭5', 'F5', 'G5', 'A♭5', 'B♭5', 'C5', 'D5'])
  })

  it('uses the Chord page patterns', () => {
    expect(diatonicChordPattern('C', Tonality.MAJOR, 6)).toEqual({ root: 'B', pattern: Pattern.Diminished, tonality: Tonality.MAJOR })
    expect(diatonicChordPattern('C', Tonality.MAJOR, 4, 'seventh')).toEqual({ root: 'G', pattern: Pattern.Dominant, tonality: Tonality.MAJOR })
    expect(diatonicChordPattern('A', Tonality.MINOR, 1, 'seventh')).toEqual({ root: 'B', pattern: Pattern.HalfDiminished, tonality: Tonality.MAJOR })
  })

  it('renames a root the neck has no name for', () => {
    expect(diatonicChordPattern('F♯', Tonality.MAJOR, 6).root).toBe('F')
    expect(diatonicChordPattern('E♭', Tonality.MINOR, 5).root).toBe('B')
  })

  it('gives every chord of every key a root the neck knows, at the pitch the palette names', () => {
    // Pitch of the palette's root, read from the chord name ("E♯m7♭5" → E♯ → 5)
    const letterPitch: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
    const namedPitch = (name: string) => (letterPitch[name[0]] + (name[1] == '♯' ? 1 : name[1] == '♭' ? -1 : 0) + 12) % 12

    for (const tonality of [Tonality.MAJOR, Tonality.MINOR]) {
      for (const key of progressionKeys(tonality)) {
        for (const type of ['triad', 'seventh', 'power'] as ChordType[]) {
          for (const chord of diatonicChords(key, tonality, type)) {
            const { root } = diatonicChordPattern(key, tonality, chord.degree, type)
            expect(majorKeyToNumber[root], `${key} ${tonality} ${chord.name}: ${root}`).toBe(namedPitch(chord.name))
          }
        }
      }
    }
  })
})
