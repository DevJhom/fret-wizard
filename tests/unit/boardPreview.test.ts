import { describe, expect, it } from 'vitest'
import { Degree, Pattern, Setup, Tonality, degreeInPattern } from '@data/constants'
import { getRoots, getMinorSeconds, getSeconds, getMinorThirds, getThirds, getFourths, getTritones, getFifths, getMinorSixths, getSixths, getMinorSevenths, getSevenths } from '@data/intervals'
import { boardPreview } from '@data/boardPreview'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'

const board = (overrides: Partial<FretboardData>): FretboardData => ({ ...defaultDataFor(Setup.Scale), ...overrides })

const scaleBoard = (key: string, tonality: Tonality, pattern: Pattern) =>
  board({ currentKey: key, currentTonality: tonality, currentPattern: pattern, currentHighlightNotes: degreeInPattern(pattern, tonality)! })

const string = (preview: ReturnType<typeof boardPreview>, name: string) => preview.find(s => s.name === name)!

describe('boardPreview', () => {
  it('returns six strings, high e first, each with the open string plus 12 frets', () => {
    const preview = boardPreview(scaleBoard('A', Tonality.MINOR, Pattern.Pentatonic))
    expect(preview.map(s => s.name)).toEqual(['e', 'B', 'G', 'D', 'A', 'E'])
    preview.forEach(s => expect(s.notes).toHaveLength(13))
  })

  it('lights A minor pentatonic degrees on the low E string', () => {
    const low = string(boardPreview(scaleBoard('A', Tonality.MINOR, Pattern.Pentatonic)), 'E')
    expect(low.notes[0]).toBe(Degree.fifths) // open E
    expect(low.notes[1]).toBeNull() // F is not in the scale
    expect(low.notes[3]).toBe(Degree.minorSevenths) // G
    expect(low.notes[5]).toBe(Degree.roots) // A
    expect(low.notes[8]).toBe(Degree.minorThirds) // C
  })

  it('finds the root for sharp and flat keys', () => {
    const roots = (key: string) => board({ currentKey: key, currentHighlightNotes: [Degree.roots] })
    expect(string(boardPreview(roots('B♭')), 'A').notes[1]).toBe(Degree.roots)
    expect(string(boardPreview(roots('F♯')), 'E').notes[2]).toBe(Degree.roots)
    expect(string(boardPreview(roots('F♯')), 'e').notes[2]).toBe(Degree.roots)
  })

  it('shows only the tones the user left visible', () => {
    const preview = boardPreview(board({ currentKey: 'C', currentHighlightNotes: [Degree.roots] }))
    const lit = preview.flatMap(s => s.notes).filter(Boolean)
    expect(new Set(lit)).toEqual(new Set([Degree.roots]))
    expect(string(preview, 'B').notes[1]).toBe(Degree.roots) // C on the B string
  })

  it('leaves hidden strings empty', () => {
    const fb = scaleBoard('G', Tonality.MAJOR, Pattern.Diatonic)
    fb.currentStrings = { ...fb.currentStrings, G: false }
    expect(string(boardPreview(fb), 'G').notes.every(n => n === null)).toBe(true)
    expect(string(boardPreview(fb), 'D').notes.some(n => n !== null)).toBe(true)
  })

  // MyString lights fret n when the degree's interval list includes n; its open note is fret 12's
  const intervalsFor: Record<Degree, typeof getRoots> = {
    [Degree.roots]: getRoots, [Degree.minorSeconds]: getMinorSeconds, [Degree.seconds]: getSeconds,
    [Degree.minorThirds]: getMinorThirds, [Degree.thirds]: getThirds, [Degree.fourths]: getFourths,
    [Degree.tritones]: getTritones, [Degree.fifths]: getFifths, [Degree.minorSixths]: getMinorSixths,
    [Degree.sixths]: getSixths, [Degree.minorSevenths]: getMinorSevenths, [Degree.sevenths]: getSevenths,
  }

  it('agrees with the notes MyString lights on frets 0 to 12', () => {
    const cases: [string, Tonality, Pattern][] = [
      ['A', Tonality.MINOR, Pattern.Pentatonic],
      ['E♭', Tonality.MAJOR, Pattern.Diatonic],
      ['F♯', Tonality.MINOR, Pattern.Seventh],
      ['G', Tonality.MAJOR, Pattern.Triad],
    ]
    for (const [key, tonality, pattern] of cases) {
      const fb = scaleBoard(key, tonality, pattern)
      for (const s of boardPreview(fb)) {
        for (let fret = 0; fret <= 12; fret++) {
          const position = fret === 0 ? 12 : fret
          const expected = (fb.currentHighlightNotes as Degree[]).find(d => intervalsFor[d](tonality, key, s.name).includes(position)) ?? null
          expect(s.notes[fret], `${key} ${tonality} ${pattern}, ${s.name} string, fret ${fret}`).toBe(expected)
        }
      }
    }
  })
})
