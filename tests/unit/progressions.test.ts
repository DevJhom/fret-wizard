import { describe, it, expect } from 'vitest'
import { Tonality } from '@data/constants'
import { diatonicChords } from '@data/progressions'

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
