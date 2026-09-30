import { majorKeyToNumber, Pattern, Tonality } from "@data/constants";

export interface ChordPositions {
  E: number[];
  A: number[];
  D: number[];
  G: number[];
  B: number[];
  e: number[];
}

const openStringPitches: Record<keyof ChordPositions, number> = {
  E: 4,
  A: 9,
  D: 2,
  G: 7,
  B: 11,
  e: 4,
};

const majorThird = 4;

export const fingeringAvailable = (pattern: Pattern) => {
  return pattern == Pattern.Triad || pattern == Pattern.Power;
}

export const getChordPositionIndexes = (chord: Pattern, currentKey: string) => {
    return [0, 1, 2];
}

export const getChordPositions = (chord: Pattern, currentKey: string, currentChordPosition: number, tonality: Tonality = Tonality.MAJOR) => {
    const chordPositions = triad[currentChordPosition];
    const shift = majorKeyToNumber[currentKey];

    const shiftString = (stringName: keyof ChordPositions) => chordPositions[stringName]
        .flatMap(fret => [fret, fret - 12])
        .map(fret => {
            const isMajorThird = (openStringPitches[stringName] + fret + 120) % 12 == majorThird;
            return fret + shift - (tonality == Tonality.MINOR && isMajorThird ? 1 : 0);
        });

    const shiftedChordPositions: ChordPositions = {
        E: shiftString('E'),
        A: shiftString('A'),
        D: shiftString('D'),
        G: shiftString('G'),
        B: shiftString('B'),
        e: shiftString('e'),
    }

    return shiftedChordPositions;
}

export const getBarPositions = (chord: Pattern, currentKey: string, currentChordPosition: number) => {
    const chordPositions = triadBar[currentChordPosition];
    const shift = majorKeyToNumber[currentKey];

    const shiftedChordPositions: ChordPositions = {
        e: chordPositions.e.flatMap(fret => [fret, fret - 12]).map(fret => fret + shift),
        B: chordPositions.B.flatMap(fret => [fret, fret - 12]).map(fret => fret + shift),
        G: chordPositions.G.flatMap(fret => [fret, fret - 12]).map(fret => fret + shift),
        D: chordPositions.D.flatMap(fret => [fret, fret - 12]).map(fret => fret + shift),
        A: chordPositions.A.flatMap(fret => [fret, fret - 12]).map(fret => fret + shift),
        E: chordPositions.E.flatMap(fret => [fret, fret - 12]).map(fret => fret + shift),
    }

    return shiftedChordPositions;
}

const octave = (note: number) => {
    return note + 12;
}

const triad: ChordPositions[] = [
    {
        e: [12, octave(12)],
        B: [1, octave(1)],
        G: [12, octave(12)],
        D: [2, octave(2)],
        A: [3, octave(3)],
        E: []
    },
    {
        e: [3, octave(3)],
        B: [5, octave(5)],
        G: [5, octave(5)],
        D: [5, octave(5)],
        A: [3, octave(3)],
        E: []
    },
    {
        e: [8, octave(8)],
        B: [5, octave(5)],
        G: [5, octave(5)],
        D: [5, octave(5)],
        A: [],
        E: []
    }
]

const triadBar: ChordPositions[] = [
    {
        e: [],
        B: [],
        G: [],
        D: [],
        A: [],
        E: []
    },
    {
        e: [3, octave(3)],
        B: [3, octave(3)],
        G: [3, octave(3)],
        D: [3, octave(3)],
        A: [],
        E: []
    },
    {
        e: [],
        B: [5, octave(5)],
        G: [5, octave(5)],
        D: [],
        A: [],
        E: []
    }
]