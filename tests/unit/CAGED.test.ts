import { describe, expect, it } from 'vitest'
import { Pattern, Tonality, majorKeyToNumber, minorKeyToNumber } from '@data/constants'
import { GetCAGEDName, isCAGED, isCAGEDNameHere, isInCAGEDBlock } from '@data/CAGED'
import { findRelativeMajor } from '@data/noteNames'
import type { CurrentCAGED, CurrentStrings } from '@/lib/fretboardData'

type Shape = keyof CurrentCAGED
type StringName = keyof CurrentStrings

const shapes: Shape[] = ['CShape', 'AShape', 'GShape', 'EShape', 'DShape']
const strings: StringName[] = ['E', 'A', 'D', 'G', 'B', 'e']
const openPitches: Record<StringName, number> = { E: 40, A: 45, D: 50, G: 55, B: 59, e: 64 }
const cMajor = [0, 2, 4, 5, 7, 9, 11]
const mod12 = (value: number) => ((value % 12) + 12) % 12

// MyString asks about position fret - 1, and about fret 12 for the open string
const inShape = (shape: Shape, string: StringName, fret: number, key: string, tonality = Tonality.MAJOR) =>
  isCAGED(fret === 0 ? 11 : fret - 1, string, key, tonality, [shape])

// The five CAGED positions of the C major scale, as method books draw them
const majorScalePatterns: Record<Shape, Record<StringName, number[]>> = {
  CShape: { E: [0, 1, 3], A: [0, 2, 3], D: [0, 2, 3], G: [0, 2], B: [0, 1, 3], e: [0, 1, 3] },
  AShape: { E: [3, 5], A: [2, 3, 5], D: [2, 3, 5], G: [2, 4, 5], B: [3, 5, 6], e: [3, 5] },
  GShape: { E: [5, 7, 8], A: [5, 7, 8], D: [5, 7], G: [4, 5, 7], B: [5, 6, 8], e: [5, 7, 8] },
  EShape: { E: [7, 8, 10], A: [7, 8, 10], D: [7, 9, 10], G: [7, 9, 10], B: [8, 10], e: [7, 8, 10] },
  DShape: { E: [10, 12, 13], A: [10, 12], D: [9, 10, 12], G: [9, 10, 12], B: [10, 12, 13], e: [10, 12, 13] },
}

const notesOf = (pattern: Record<StringName, number[]>) => strings.flatMap(string => pattern[string].map(fret => ({ string, fret })))

const onNeck = (fret: number, key: string) => [-12, 0, 12, 24].map(octave => fret + majorKeyToNumber[key] + octave).filter(moved => moved >= 0 && moved <= 24)

describe('the reference scale patterns', () => {
  for (const shape of shapes) {
    it(`plays the ${shape} position of C major as one unbroken run of the scale`, () => {
      const pitches = notesOf(majorScalePatterns[shape]).map(({ string, fret }) => openPitches[string] + fret).sort((a, b) => a - b)
      expect(pitches.every(pitch => cMajor.includes(mod12(pitch)))).toBe(true)
      pitches.slice(1).forEach((pitch, i) => {
        const step = cMajor.indexOf(mod12(pitch)) - cMajor.indexOf(mod12(pitches[i]))
        expect((step + 7) % 7, `between ${pitches[i]} and ${pitch}`).toBe(1)
      })
    })
  }
})

describe('isCAGED', () => {
  for (const shape of shapes) {
    it(`contains the ${shape} scale position in every major key`, () => {
      for (const key of Object.keys(majorKeyToNumber)) {
        for (const { string, fret } of notesOf(majorScalePatterns[shape])) {
          for (const moved of onNeck(fret, key)) {
            expect(inShape(shape, string, moved, key), `${key} major, ${string} string, fret ${moved}`).toBe(true)
          }
        }
      }
    })
  }

  it('repeats every 12 frets, up to fret 24 and down to the nut', () => {
    for (const shape of shapes) {
      for (const key of Object.keys(majorKeyToNumber)) {
        for (const string of strings) {
          for (let fret = 1; fret <= 12; fret++) {
            expect(inShape(shape, string, fret + 12, key), `${shape} in ${key}, ${string} string, frets ${fret} and ${fret + 12}`).toBe(inShape(shape, string, fret, key))
          }
        }
      }
    }
  })

  it('places a minor key on its relative major, as the Scale page does', () => {
    for (const key of Object.keys(minorKeyToNumber)) {
      for (const shape of shapes) {
        for (const string of strings) {
          for (let fret = 0; fret <= 24; fret++) {
            expect(inShape(shape, string, fret, key, Tonality.MINOR)).toBe(inShape(shape, string, fret, findRelativeMajor(key)!))
          }
        }
      }
    }
  })

  it('is false outside every highlighted shape', () => {
    expect(isCAGED(4, 'E', 'C', Tonality.MAJOR, ['CShape'])).toBe(false)
    expect(isCAGED(0, 'E', 'C', Tonality.MAJOR, [])).toBe(false)
  })
})

describe('isInCAGEDBlock', () => {
  const blockFrets = (shape: Shape, key: string) =>
    Array.from({ length: 24 }, (_, index) => index + 1).filter(fret => isInCAGEDBlock(fret - 1, key, Tonality.MAJOR, [shape]))

  it('draws each shape in C as a block of four frets, repeating every 12', () => {
    expect(blockFrets('CShape', 'C')).toEqual([1, 2, 3, 12, 13, 14, 15, 24])
    expect(blockFrets('AShape', 'C')).toEqual([2, 3, 4, 5, 14, 15, 16, 17])
    expect(blockFrets('GShape', 'C')).toEqual([5, 6, 7, 8, 17, 18, 19, 20])
    expect(blockFrets('EShape', 'C')).toEqual([7, 8, 9, 10, 19, 20, 21, 22])
    expect(blockFrets('DShape', 'C')).toEqual([1, 10, 11, 12, 13, 22, 23, 24])
  })

  it('moves with the key, four frets wide unless the nut or fret 24 cuts it', () => {
    expect(blockFrets('AShape', 'B')).toEqual([1, 2, 3, 4, 13, 14, 15, 16])
    for (const shape of shapes) {
      for (const key of Object.keys(majorKeyToNumber)) {
        const runs: number[][] = []
        for (const fret of blockFrets(shape, key)) {
          const run = runs[runs.length - 1]
          if (run && run[run.length - 1] === fret - 1) run.push(fret)
          else runs.push([fret])
        }
        runs.filter(run => run[0] !== 1 && run[run.length - 1] !== 24)
          .forEach(run => expect(run.length, `${shape} in ${key}`).toBe(4))
      }
    }
  })

  it('keeps the notes just outside the block lit', () => {
    for (const [shape, string, fret] of [['AShape', 'B', 6], ['GShape', 'G', 4], ['GShape', 'B', 4], ['DShape', 'D', 9], ['DShape', 'G', 9]] as [Shape, StringName, number][]) {
      expect(isInCAGEDBlock(fret - 1, 'C', Tonality.MAJOR, [shape]), `${shape}, ${string} string, fret ${fret}`).toBe(false)
      expect(inShape(shape, string, fret, 'C'), `${shape}, ${string} string, fret ${fret}`).toBe(true)
    }
  })

  it('keeps the 9th of the add9 A and E shapes lit, for add9 only', () => {
    for (const [shape, string, fret] of [['AShape', 'G', 7], ['EShape', 'D', 12]] as [Shape, StringName, number][]) {
      expect(isCAGED(fret - 1, string, 'C', Tonality.MAJOR, [shape], Pattern.Add9), `${shape}, add9`).toBe(true)
      expect(isCAGED(fret - 1, string, 'C', Tonality.MAJOR, [shape], Pattern.Triad), `${shape}, triad`).toBe(false)
      expect(isCAGED(fret - 1, string, 'C', Tonality.MAJOR, [shape], Pattern.Diatonic), `${shape}, diatonic`).toBe(false)
    }
  })

  it('keeps the 2nd and 5th of the sus2 E shape lit, for sus2 only', () => {
    for (const string of ['D', 'G'] as StringName[]) {
      expect(isInCAGEDBlock(11, 'C', Tonality.MAJOR, ['EShape']), `${string} string, block`).toBe(false)
      expect(isCAGED(11, string, 'C', Tonality.MAJOR, ['EShape'], Pattern.Sus2), `${string} string, sus2`).toBe(true)
      expect(isCAGED(11, string, 'C', Tonality.MAJOR, ['EShape'], Pattern.Sus4), `${string} string, sus4`).toBe(false)
      expect(isCAGED(11, string, 'C', Tonality.MAJOR, ['EShape'], Pattern.Add9), `${string} string, add9`).toBe(string === 'D')
    }
  })
})

describe('CAGED shape names', () => {
  const all: CurrentCAGED = { CShape: true, AShape: true, GShape: true, EShape: true, DShape: true }
  const shapeNamed = (name: string) => shapes.find(shape => name === `${shape[0]} Shape`)!
  const cases: [string, Tonality][] = [
    ...Object.keys(majorKeyToNumber).map(key => [key, Tonality.MAJOR] as [string, Tonality]),
    ...Object.keys(minorKeyToNumber).map(key => [key, Tonality.MINOR] as [string, Tonality]),
  ]

  it('names each shape once every 12 frets, under its own box on the low E string', () => {
    for (const [key, tonality] of cases) {
      const named: Record<string, number[]> = {}
      for (let index = 0; index < 24; index++) {
        const name = GetCAGEDName(index, all, key, tonality)
        expect(Boolean(isCAGEDNameHere(index, all, key, tonality))).toBe(Boolean(name))
        if (!name) continue
        expect(isCAGED(index, 'E', key, tonality, [shapeNamed(name)]), `${name} at position ${index} in ${key} ${tonality}`).toBe(true)
        named[name] = [...(named[name] ?? []), index]
      }
      for (const [name, indexes] of Object.entries(named)) {
        indexes.slice(1).forEach((index, i) => expect(index - indexes[i], `${name} in ${key} ${tonality}`).toBe(12))
      }
    }
  })
})
