import { majorKeyToNumber, Pattern } from "@data/constants";

export interface ChordPositions {
  E: number[];
  A: number[];
  D: number[];
  G: number[];
  B: number[];
  e: number[];
}

export const getChordPositions = (chord: Pattern, currentKey: string) => {
    const chordPositions = triad[0];
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

export const getBarPositions = (chord: Pattern, currentKey: string) => {
    const chordPositions = triadBar[0];
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

const triad: ChordPositions[] = [
    {
        e: [3],
        B: [5],
        G: [5],
        D: [5],
        A: [3],
        E: []
    }
]

const triadBar: ChordPositions[] = [
    {
        e: [3],
        B: [3],
        G: [3],
        D: [3],
        A: [],
        E: []
    }
]