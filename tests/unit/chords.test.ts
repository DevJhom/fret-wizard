import { describe, expect, it } from 'vitest'
import { Degree, Pattern, Setup, Tonality, degreeInPattern, majorKeyToNumber } from '@data/constants'
import { chordVoicings, diagramStrings, fingeringAvailable, ChordVoicing, DIAGRAM_FRETS } from '@data/chords'
import { isCAGED } from '@data/CAGED'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'

const chord = (key: string, tonality = Tonality.MAJOR, pattern = Pattern.Triad, overrides: Partial<FretboardData> = {}): FretboardData => ({
  ...defaultDataFor(Setup.Chord),
  currentKey: key,
  currentTonality: tonality,
  currentPattern: pattern,
  currentHighlightNotes: degreeInPattern(pattern, tonality)!,
  ...overrides,
})

const tab = (voicing: ChordVoicing) => diagramStrings.map(string => voicing.notes.find(note => note.string === string)?.fret ?? 'x').join(' ')

const shape = (fretboard: FretboardData, name: string) => chordVoicings(fretboard).find(voicing => voicing.shape === name)!

const named = (fretboard: FretboardData) => chordVoicings(fretboard).map(voicing => `${voicing.shape}: ${tab(voicing)}`)

const allStrings = { E: true, A: true, D: true, G: true, B: true, e: true }

const { MAJOR, MINOR } = Tonality
const chordPatterns = [Pattern.Triad, Pattern.Seventh, Pattern.Dominant, Pattern.Add9, Pattern.Add11, Pattern.Add13, Pattern.Power]
const scalePatterns = [Pattern.Pentatonic, Pattern.Blue, Pattern.Diatonic, Pattern.Chromatic]

describe('chordVoicings', () => {
  it('draws C major in all five CAGED shapes', () => {
    const voicings = chordVoicings(chord('C'))
    expect(voicings.map(voicing => voicing.shape)).toEqual(['C', 'A', 'G', 'E', 'D'])
    expect(voicings.map(tab)).toEqual(['x 3 2 0 1 0', 'x 3 5 5 5 3', 'x x 5 5 5 8', '8 10 10 9 8 8', 'x x 10 12 13 12'])
  })

  it('names the degree of every note', () => {
    expect(shape(chord('C'), 'C').notes.map(note => note.degree)).toEqual([Degree.roots, Degree.thirds, Degree.fifths, Degree.roots, Degree.thirds])
  })

  it('starts at the nut when the chord fits in the first frets, otherwise at its lowest fret', () => {
    expect(chordVoicings(chord('C')).map(voicing => voicing.firstFret)).toEqual([1, 1, 5, 8, 10])
  })

  it('barres the strings fretted at the barre fret', () => {
    expect(chordVoicings(chord('C')).map(voicing => voicing.barre)).toEqual([
      undefined,
      { fret: 3, from: 'A', to: 'e' },
      { fret: 5, from: 'D', to: 'B' },
      { fret: 8, from: 'E', to: 'e' },
      undefined,
    ])
  })

  it('moves the shapes to the key, onto the open strings where they land there', () => {
    const voicings = chordVoicings(chord('G'))
    expect(voicings.map(tab)).toEqual(['x 10 9 7 8 7', 'x 10 12 12 12 10', 'x x 0 0 0 3', '3 5 5 4 3 3', 'x x 5 7 8 7'])
    expect(voicings.map(voicing => voicing.firstFret)).toEqual([7, 10, 1, 1, 5])
    expect(voicings.map(voicing => voicing.barre)).toEqual([undefined, { fret: 10, from: 'A', to: 'e' }, undefined, { fret: 3, from: 'E', to: 'e' }, undefined])
    expect(tab(shape(chord('A'), 'A'))).toBe('x 0 2 2 2 0')
    expect(tab(shape(chord('E'), 'E'))).toBe('0 2 2 1 0 0')
    expect(tab(shape(chord('D'), 'D'))).toBe('x x 0 2 3 2')
  })

  it('plays sharp and flat spellings of a key the same', () => {
    expect(chordVoicings(chord('D♭')).map(tab)).toEqual(chordVoicings(chord('C♯')).map(tab))
  })

  it('plays minor chords in their own shapes', () => {
    expect(chordVoicings(chord('C', MINOR)).map(tab)).toEqual(['x 3 1 0 1 x', 'x 3 5 5 4 3', 'x x 5 5 4 8', '8 10 10 8 8 8', 'x x 10 12 13 11'])
    expect(shape(chord('C', MINOR), 'A').notes.find(note => note.string === 'B')!.degree).toBe(Degree.minorThirds)
    // A minor 3rd on the high e would be fret -1 in C and need a fifth finger in D
    expect(tab(shape(chord('D', MINOR), 'C'))).toBe('x 5 3 2 3 x')
  })

  it('moves a shape up an octave when it cannot be played at the nut', () => {
    // The C shape of B major would need fret -1 on the G and high e strings
    const b = shape(chord('B'), 'C')
    expect(tab(b)).toBe('x 14 13 11 12 11')
    expect(b.firstFret).toBe(11)
  })

  it('plays power chords as root, fifth and octave from the A, E and D strings', () => {
    expect(named(chord('C', MAJOR, Pattern.Power))).toEqual(['A: x 3 5 5 x x', 'E: 8 10 10 x x x', 'D: x x 10 12 13 x'])
    expect(chordVoicings(chord('E', MAJOR, Pattern.Power)).map(tab)).toEqual(['x 7 9 9 x x', '0 2 2 x x x', 'x x 2 4 5 x'])
    expect(chordVoicings(chord('C', MAJOR, Pattern.Power)).every(voicing => voicing.barre === undefined)).toBe(true)
  })

  it('mutes the tones and strings the fretboard hides, without moving the diagram', () => {
    expect(tab(shape(chord('C', MAJOR, Pattern.Triad, { currentHighlightNotes: [Degree.roots, Degree.fifths] }), 'C'))).toBe('x 3 x 0 1 x')

    const noHighE = chord('C', MAJOR, Pattern.Triad, { currentStrings: { ...allStrings, e: false } })
    expect(tab(shape(noHighE, 'C'))).toBe('x 3 2 0 1 x')
    expect(tab(shape(noHighE, 'G'))).toBe('x x 5 5 5 x')
    expect(shape(noHighE, 'G').firstFret).toBe(5)
  })

  it('has diagrams for every chord type and none for scales', () => {
    chordPatterns.forEach(pattern => expect(fingeringAvailable(pattern), pattern).toBe(true))
    scalePatterns.forEach(pattern => {
      expect(fingeringAvailable(pattern), pattern).toBe(false)
      expect(chordVoicings(chord('C', MAJOR, pattern))).toEqual([])
    })
  })
})

describe('chord shapes', () => {
  const inC: [Pattern, Tonality, string[]][] = [
    [Pattern.Seventh, MAJOR, ['C: x 3 2 0 0 0', 'A: x 3 5 4 5 3', 'G: x x 5 5 5 7', 'E: 8 10 9 9 8 8', 'D: x x 10 12 12 12']],
    [Pattern.Seventh, MINOR, ['A: x 3 5 3 4 3', 'E: 8 10 8 8 8 8', 'D: x x 10 12 11 11']],
    [Pattern.Dominant, MAJOR, ['C: x 3 2 3 1 x', 'A: x 3 5 3 5 3', 'G: x x 5 5 5 6', 'E: 8 10 8 9 8 8', 'D: x x 10 12 11 12']],
    [Pattern.Add9, MAJOR, ['C: x 3 2 0 3 0', 'A: x 3 5 7 5 3', 'G: x x 5 7 5 8', 'E: 8 10 12 9 8 8']],
    [Pattern.Add9, MINOR, ['A: x 3 5 7 4 3', 'E: 8 10 12 8 8 8']],
    [Pattern.Add11, MAJOR, ['C: x 3 2 0 1 1', 'A: x 3 3 5 5 3', 'E: 8 8 10 9 8 8', 'D: x x 10 10 13 12']],
    [Pattern.Add11, MINOR, ['A: x 3 3 5 4 3', 'E: 8 8 10 8 8 8', 'D: x x 10 10 13 11']],
    [Pattern.Add13, MAJOR, ['C: x 3 2 2 1 0', 'A: x 3 5 5 5 5', 'G: x x 5 5 5 5', 'E: 8 10 10 9 10 8', 'D: x x 10 12 10 12']],
    [Pattern.Add13, MINOR, ['A: x 3 5 5 4 5', 'E: 8 10 10 8 10 8', 'D: x x 10 12 10 11']],
  ]

  for (const [pattern, tonality, tabs] of inC) {
    it(`plays C ${tonality} ${pattern} in the shapes that have a standard voicing`, () => {
      expect(named(chord('C', tonality, pattern))).toEqual(tabs)
    })
  }

  it('plays the same chords for both tonalities of a power or dominant chord', () => {
    expect(named(chord('C', MINOR, Pattern.Power))).toEqual(named(chord('C', MAJOR, Pattern.Power)))
    expect(named(chord('C', MINOR, Pattern.Dominant))).toEqual(named(chord('C', MAJOR, Pattern.Dominant)))
  })

  it('lands on the open chords each shape is named after', () => {
    expect(tab(shape(chord('A', MINOR, Pattern.Seventh), 'A'))).toBe('x 0 2 0 1 0')
    expect(tab(shape(chord('E', MAJOR, Pattern.Seventh), 'E'))).toBe('0 2 1 1 0 0')
    expect(tab(shape(chord('E', MAJOR, Pattern.Dominant), 'E'))).toBe('0 2 0 1 0 0')
    expect(tab(shape(chord('D', MAJOR, Pattern.Dominant), 'D'))).toBe('x x 0 2 1 2')
    expect(tab(shape(chord('A', MAJOR, Pattern.Add9), 'A'))).toBe('x 0 2 4 2 0')
    expect(tab(shape(chord('E', MINOR, Pattern.Add9), 'E'))).toBe('0 2 4 0 0 0')
    expect(tab(shape(chord('D', MAJOR, Pattern.Add11), 'D'))).toBe('x x 0 0 3 2')
    expect(tab(shape(chord('A', MAJOR, Pattern.Add13), 'A'))).toBe('x 0 2 2 2 2')
    expect(tab(shape(chord('D', MINOR, Pattern.Add13), 'D'))).toBe('x x 0 2 0 1')
  })

  it('barres the C shape of a major seventh once it leaves the nut', () => {
    expect(shape(chord('C', MAJOR, Pattern.Seventh), 'C').barre).toBeUndefined()
    expect(shape(chord('D', MAJOR, Pattern.Seventh), 'C').barre).toEqual({ fret: 2, from: 'G', to: 'e' })
  })

  const everyVoicing = () => Object.keys(majorKeyToNumber).flatMap(key => chordPatterns.flatMap(pattern => [MAJOR, MINOR].flatMap(tonality =>
    chordVoicings(chord(key, tonality, pattern)).map(voicing => ({ key, tonality, pattern, voicing, name: `${key} ${tonality} ${pattern}, ${voicing.shape} shape (${tab(voicing)})` })))))

  const openPitches = { E: 4, A: 9, D: 2, G: 7, B: 11, e: 4 }
  const semitones: Record<string, number> = {
    roots: 0, 'minor seconds': 1, seconds: 2, 'minor thirds': 3, thirds: 4, fourths: 5,
    tritones: 6, fifths: 7, 'minor sixths': 8, sixths: 9, 'minor sevenths': 10, sevenths: 11,
  }

  it('sounds only the chord tones it names, and all of them but the 5th, in every key', () => {
    for (const { key, tonality, pattern, voicing, name } of everyVoicing()) {
      const formula = degreeInPattern(pattern, tonality)!
      for (const note of voicing.notes) {
        expect((openPitches[note.string] + note.fret - majorKeyToNumber[key] + 120) % 12, `${name}, ${note.string} string`).toBe(semitones[note.degree])
        expect(formula, name).toContain(note.degree)
      }
      const required = pattern == Pattern.Power ? formula : formula.filter(degree => degree != Degree.fifths)
      required.forEach(degree => expect(voicing.notes.map(note => note.degree), name).toContain(degree))
    }
  })

  it('keeps the root in the bass, except the G shape that starts on its 5th', () => {
    for (const { voicing, name } of everyVoicing()) {
      expect(voicing.notes[0].degree, name).toBe(voicing.shape == 'G' ? Degree.fifths : Degree.roots)
    }
  })

  // Notes at one fret share a finger (a barre) when nothing open, muted or lower lies between them
  const fingers = (voicing: ChordVoicing) => {
    const frets = diagramStrings.map(string => voicing.notes.find(note => note.string === string)?.fret)
    return frets.filter((fret, i) => {
      if (!fret) return false
      for (let lower = i - 1; lower >= 0; lower--) {
        const between = frets[lower]
        if (between === fret) return false
        if (between === undefined || between < fret) return true
      }
      return true
    }).length
  }

  it('fits the diagram and four fingers, with nothing muted or open under the barre, in every key', () => {
    for (const { voicing, name } of everyVoicing()) {
      const fretted = voicing.notes.map(note => note.fret).filter(fret => fret > 0)
      expect(Math.max(...fretted) - voicing.firstFret, name).toBeLessThan(DIAGRAM_FRETS)
      expect(Math.min(...fretted), name).toBeGreaterThanOrEqual(voicing.firstFret)
      expect(fingers(voicing), name).toBeLessThanOrEqual(4)
      if (voicing.barre) {
        const under = diagramStrings.slice(diagramStrings.indexOf(voicing.barre.from), diagramStrings.indexOf(voicing.barre.to) + 1)
        under.forEach(string => expect(voicing.notes.find(note => note.string === string)?.fret, `${name}, ${string} string`).toBeGreaterThanOrEqual(voicing.barre!.fret))
      }
    }
  })

  it('lies inside its CAGED shape on the neck, but for the stretched 9th of the A and E shape add9 chords', () => {
    for (const { key, pattern, voicing, name } of everyVoicing()) {
      for (const note of voicing.notes) {
        if (pattern == Pattern.Add9 && note.degree == Degree.seconds && (voicing.shape == 'A' || voicing.shape == 'E')) continue
        expect(isCAGED(note.fret === 0 ? 11 : note.fret - 1, note.string, key, MAJOR, [`${voicing.shape}Shape`]), `${name}, ${note.string} string`).toBe(true)
      }
    }
  })
})
