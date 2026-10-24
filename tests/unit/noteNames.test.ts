import { describe, expect, it } from 'vitest'
import { Degree, Pattern, Tonality, degreeInPattern, degreeToNumber, majorKeyToNumber } from '@data/constants'
import { getNoteName, keyRoots, rootName, spellInterval } from '@data/noteNames'
import { progressionKeys } from '@data/progressions'

const { MAJOR, MINOR } = Tonality

const keys = Object.keys(majorKeyToNumber)
const degrees = Object.values(Degree)

// Pitch of a spelled name, read independently of the speller
const letterPitch: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const accidentalOffset: Record<string, number> = { '𝄫': -2, '♭': -1, '': 0, '♯': 1, '𝄪': 2 }
const pitchOf = (name: string) => (letterPitch[name[0]] + accidentalOffset[name.slice(1)] + 12) % 12

const names = (key: string, tonality: Tonality, pattern: Pattern) =>
  degreeInPattern(pattern, tonality)!.map(degree => getNoteName(degree, key, pattern))

const scalePatterns = [Pattern.Pentatonic, Pattern.Blue, Pattern.Diatonic, Pattern.Chromatic, Pattern.Triad]
const chordPatterns = [Pattern.Power, Pattern.Triad, Pattern.Add13, Pattern.Dominant, Pattern.Seventh, Pattern.Add9, Pattern.Add11, Pattern.Sus2, Pattern.Sus4, Pattern.Diminished, Pattern.HalfDiminished]

describe('spellInterval', () => {
  it('names the note with the letter the interval calls for', () => {
    expect(spellInterval('C', 2, 3)).toBe('E♭')
    expect(spellInterval('F', 3, 5)).toBe('B♭')
    expect(spellInterval('B♭', 2, 4)).toBe('D')
    expect(spellInterval('D♭', 4, 6)).toBe('A𝄫')
    expect(spellInterval('D♯', 2, 4)).toBe('F𝄪')
  })
})

describe('getNoteName', () => {
  it('always lands on the right pitch, from every spelling of every key', () => {
    for (const pattern of [Pattern.Diatonic, Pattern.Blue, Pattern.Chromatic]) {
      for (const key of keys) {
        for (const degree of degrees) {
          const name = getNoteName(degree, key, pattern)
          expect(pitchOf(name), `${key} ${pattern} + ${degree} = ${name}`).toBe((majorKeyToNumber[key] + degreeToNumber[degree]) % 12)
        }
      }
    }
  })

  it('spells keys by their own notes', () => {
    expect(names('C', MINOR, Pattern.Diatonic)).toEqual(['C', 'D', 'E♭', 'F', 'G', 'A♭', 'B♭'])
    expect(names('F', MAJOR, Pattern.Diatonic)).toEqual(['F', 'G', 'A', 'B♭', 'C', 'D', 'E'])
    expect(names('E', MAJOR, Pattern.Diatonic)).toEqual(['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'])
  })

  it('spells the blue notes as flats of their own letters', () => {
    expect(names('C', MINOR, Pattern.Blue)).toEqual(['C', 'E♭', 'F', 'G♭', 'G', 'B♭'])
    expect(names('C', MAJOR, Pattern.Blue)).toEqual(['C', 'D', 'E♭', 'E', 'G', 'A'])
  })

  it('writes the blue note as a ♯4 where a ♭5 would need a double flat', () => {
    expect(names('E♭', MINOR, Pattern.Blue)).toEqual(['E♭', 'G♭', 'A♭', 'A', 'B♭', 'D♭'])
    // Only in the blues scale: a diminished chord's ♭5 keeps its letter
    expect(getNoteName(Degree.tritones, 'E♭', Pattern.Diminished)).toBe('B𝄫')
  })

  it('uses each letter once in every diatonic scale', () => {
    for (const key of keys) {
      for (const tonality of [MAJOR, MINOR]) {
        const letters = names(key, tonality, Pattern.Diatonic).map(name => name[0])
        expect(new Set(letters).size, `${key} ${tonality}: ${letters.join(' ')}`).toBe(7)
      }
    }
  })

  it('spells the chromatic scale in sharps from a natural or sharp root, in flats from a flat root', () => {
    expect(names('C', MAJOR, Pattern.Chromatic).slice(0, 4)).toEqual(['C', 'C♯', 'D', 'D♯'])
    expect(names('F♯', MAJOR, Pattern.Chromatic).slice(0, 4)).toEqual(['F♯', 'G', 'G♯', 'A'])
    expect(names('E♭', MAJOR, Pattern.Chromatic).slice(0, 4)).toEqual(['E♭', 'E', 'F', 'G♭'])
  })
})

describe('keyRoots', () => {
  it('names the black keys by what spells the scale or chord cleanly', () => {
    expect(keyRoots(Pattern.Triad, MAJOR)).toEqual(['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'])
    expect(keyRoots(Pattern.Triad, MINOR)).toEqual(['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'])
    expect(keyRoots(Pattern.Diminished, MAJOR)).toEqual(['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'])
    expect(keyRoots(Pattern.HalfDiminished, MAJOR)).toEqual(keyRoots(Pattern.Diminished, MAJOR))
    expect(keyRoots(Pattern.Dominant, MINOR)).toEqual(keyRoots(Pattern.Dominant, MAJOR))
    expect(keyRoots(Pattern.Chromatic, MINOR)).toEqual(keyRoots(Pattern.Chromatic, MAJOR))
  })

  it('names keys as the Chord Progression page does', () => {
    for (const tonality of [MAJOR, MINOR]) {
      expect([...keyRoots(Pattern.Diatonic, tonality)].sort()).toEqual([...progressionKeys(tonality)].sort())
    }
  })

  it('spells every scale and chord at every root without double sharps or flats', () => {
    for (const pattern of [...scalePatterns, ...chordPatterns]) {
      for (const tonality of [MAJOR, MINOR]) {
        for (const root of keyRoots(pattern, tonality)) {
          expect(names(root, tonality, pattern).join(' '), `${root} ${tonality} ${pattern}`).not.toMatch(/𝄪|𝄫/)
        }
      }
    }
  })

  it('spells chords as they are written', () => {
    expect(names('E♭', MINOR, Pattern.Triad)).toEqual(['E♭', 'G♭', 'B♭'])
    expect(names('D♯', MAJOR, Pattern.Diminished)).toEqual(['D♯', 'F♯', 'A'])
    expect(names('C♯', MAJOR, Pattern.HalfDiminished)).toEqual(['C♯', 'E', 'G', 'B'])
    expect(names('A♭', MAJOR, Pattern.Add13)).toEqual(['A♭', 'C', 'E♭', 'F'])
  })
})

describe('rootName', () => {
  it('respells a root saved under its other name', () => {
    expect(rootName('A♯', Pattern.Triad, MAJOR)).toBe('B♭')
    expect(rootName('D♭', Pattern.Seventh, MINOR)).toBe('C♯')
    expect(rootName('E♭', Pattern.Diminished, MAJOR)).toBe('D♯')
    expect(rootName('C♯', Pattern.Diatonic, MAJOR)).toBe('D♭')
    expect(rootName('G', Pattern.Pentatonic, MINOR)).toBe('G')
  })

  it('leaves a name it does not know alone', () => {
    expect(rootName('H', Pattern.Triad, MAJOR)).toBe('H')
  })
})
