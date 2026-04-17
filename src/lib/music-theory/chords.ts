import { majorKeyToNumber, Pattern } from "@data/constants";

export interface ChordPositions {
  E: number[];
  A: number[];
  D: number[];
  G: number[];
  B: number[];
  e: number[];
}

export const getChordPositionIndexes = (chord: Pattern, currentKey: string) => {
    return [0, 1, 2];
}

export const getChordPositions = (chord: Pattern, currentKey: string, currentChordPosition: number) => {
    const chordPositions = triad[currentChordPosition];
    const shift = majorKeyToNumber[currentKey];

    const shiftedChordPositions: ChordPositions = {
        E: chordPositions.E.map(fret => fret + shift),
        A: chordPositions.A.map(fret => fret + shift),
        D: chordPositions.D.map(fret => fret + shift),
        G: chordPositions.G.map(fret => fret + shift),
        B: chordPositions.B.map(fret => fret + shift),
        e: chordPositions.e.map(fret => fret + shift),
    }

    return shiftedChordPositions;
}

export const getBarPositions = (chord: Pattern, currentKey: string, currentChordPosition: number) => {
    const chordPositions = triadBar[currentChordPosition];
    const shift = majorKeyToNumber[currentKey];

    const shiftedChordPositions: ChordPositions = {
        e: chordPositions.e.map(fret => fret + shift),
        B: chordPositions.B.map(fret => fret + shift),
        G: chordPositions.G.map(fret => fret + shift),
        D: chordPositions.D.map(fret => fret + shift),
        A: chordPositions.A.map(fret => fret + shift),
        E: chordPositions.E.map(fret => fret + shift),
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