import { Degree, degreeBySemitone, degreeInPattern, majorKeyToNumber, Pattern, Tonality } from "@data/constants";
import type { CurrentStrings, FretboardData } from '@/lib/fretboardData';

type StringName = keyof CurrentStrings;

const openStringPitches: Record<StringName, number> = {
  E: 4,
  A: 9,
  D: 2,
  G: 7,
  B: 11,
  e: 4,
};

export const diagramStrings: StringName[] = ['E', 'A', 'D', 'G', 'B', 'e'];

export const DIAGRAM_FRETS = 5;

export interface ChordNote {
    string: StringName;
    // 0 is the open string
    fret: number;
    degree: Degree;
}

export interface ChordVoicing {
    shape: string;
    // Low E first; a string without a note is muted
    notes: ChordNote[];
    barre?: { fret: number, from: StringName, to: StringName };
    // The fret on the diagram's top row; 1 means the nut is drawn
    firstFret: number;
}

interface ChordShape {
    shape: string;
    // The chord with C as its root; a string left out is not played
    frets: Partial<Record<StringName, number>>;
    barre?: number;
}

// Tab: frets from low E, x for a string not played
const chordShape = (shape: string, tab: string, barre?: number): ChordShape => {
    const frets: ChordShape['frets'] = {};
    tab.split(' ').forEach((fret, i) => { if (fret != 'x') frets[diagramStrings[i]] = Number(fret); });
    return { shape, frets, barre };
};

// Open chords moved to C, less the strings four fingers can't hold once moved; G shapes keep the top four strings
const triadShapes = [
    chordShape('C', 'x 3 2 0 1 0'),
    chordShape('A', 'x 3 5 5 5 3', 3),
    chordShape('G', 'x x 5 5 5 8', 5),
    chordShape('E', '8 10 10 9 8 8', 8),
    chordShape('D', 'x x 10 12 13 12'),
];

const minorTriadShapes = [
    // No high e: its minor 3rd would be fret -1 in C and a fifth finger elsewhere
    chordShape('C', 'x 3 1 0 1 x'),
    chordShape('A', 'x 3 5 5 4 3', 3),
    chordShape('G', 'x x 5 5 4 8'),
    chordShape('E', '8 10 10 8 8 8', 8),
    chordShape('D', 'x x 10 12 13 11'),
];

const powerShapes = [
    chordShape('A', 'x 3 5 5 x x'),
    chordShape('E', '8 10 10 x x x'),
    chordShape('D', 'x x 10 12 13 x'),
];

const dominantShapes = [
    // The open C7's high e would need a fifth finger once moved
    chordShape('C', 'x 3 2 3 1 x'),
    chordShape('A', 'x 3 5 3 5 3', 3),
    chordShape('G', 'x x 5 5 5 6', 5),
    chordShape('E', '8 10 8 9 8 8', 8),
    chordShape('D', 'x x 10 12 11 12'),
];

const sus2Shapes = [
    // No high e: its 2nd would be fret -2 in C; the open D and G strings become a barre once moved
    chordShape('C', 'x 3 0 0 1 x', 0),
    chordShape('A', 'x 3 5 5 3 3', 3),
    // The top four strings of the open Gsus2, 3 x 0 2 3 3
    chordShape('G', 'x x 5 7 8 8'),
    // The open Esus2, 0 2 4 4 0 0: the same reach as the add9's E shape
    chordShape('E', '8 10 12 12 8 8', 8),
    chordShape('D', 'x x 10 12 13 10', 10),
];

const sus4Shapes = [
    chordShape('C', 'x 3 3 0 1 1'),
    chordShape('A', 'x 3 5 5 6 3', 3),
    chordShape('G', 'x x 5 5 6 8', 5),
    chordShape('E', '8 10 10 10 8 8', 8),
    chordShape('D', 'x x 10 12 13 13'),
];

// No C or G shape: the C shape's ♭5 on the G string would be fret -1 in C, and the G shape's would stretch it over five frets
const diminishedShapes = [
    chordShape('A', 'x 3 4 5 4 x'),
    chordShape('E', '8 9 10 8 x x', 8),
    chordShape('D', 'x x 10 11 13 11'),
];

// The open Am7♭5 and Dm7♭5 moved, and the usual root-on-E grip; no C or G shape has a standard voicing
const halfDiminishedShapes = [
    chordShape('A', 'x 3 4 3 4 x'),
    chordShape('E', '8 x 8 8 7 x'),
    chordShape('D', 'x x 10 11 11 11'),
];

const chordShapes: Partial<Record<Pattern, Record<Tonality, ChordShape[]>>> = {
    [Pattern.Triad]: { [Tonality.MAJOR]: triadShapes, [Tonality.MINOR]: minorTriadShapes },
    [Pattern.Power]: { [Tonality.MAJOR]: powerShapes, [Tonality.MINOR]: powerShapes },
    [Pattern.Dominant]: { [Tonality.MAJOR]: dominantShapes, [Tonality.MINOR]: dominantShapes },
    [Pattern.Sus2]: { [Tonality.MAJOR]: sus2Shapes, [Tonality.MINOR]: sus2Shapes },
    [Pattern.Sus4]: { [Tonality.MAJOR]: sus4Shapes, [Tonality.MINOR]: sus4Shapes },
    [Pattern.Diminished]: { [Tonality.MAJOR]: diminishedShapes, [Tonality.MINOR]: diminishedShapes },
    [Pattern.HalfDiminished]: { [Tonality.MAJOR]: halfDiminishedShapes, [Tonality.MINOR]: halfDiminishedShapes },
    [Pattern.Seventh]: {
        [Tonality.MAJOR]: [
            chordShape('C', 'x 3 2 0 0 0', 0),
            chordShape('A', 'x 3 5 4 5 3', 3),
            chordShape('G', 'x x 5 5 5 7', 5),
            chordShape('E', '8 10 9 9 8 8', 8),
            chordShape('D', 'x x 10 12 12 12', 12),
        ],
        [Tonality.MINOR]: [
            chordShape('A', 'x 3 5 3 4 3', 3),
            chordShape('E', '8 10 8 8 8 8', 8),
            chordShape('D', 'x x 10 12 11 11', 11),
        ],
    },
    [Pattern.Add9]: {
        [Tonality.MAJOR]: [
            chordShape('C', 'x 3 2 0 3 0'),
            chordShape('A', 'x 3 5 7 5 3', 3),
            chordShape('G', 'x x 5 7 5 8', 5),
            chordShape('E', '8 10 12 9 8 8', 8),
        ],
        [Tonality.MINOR]: [
            chordShape('A', 'x 3 5 7 4 3', 3),
            chordShape('E', '8 10 12 8 8 8', 8),
        ],
    },
    [Pattern.Add11]: {
        [Tonality.MAJOR]: [
            chordShape('C', 'x 3 2 0 1 1'),
            chordShape('A', 'x 3 3 5 5 3', 3),
            chordShape('E', '8 8 10 9 8 8', 8),
            chordShape('D', 'x x 10 10 13 12', 10),
        ],
        [Tonality.MINOR]: [
            chordShape('A', 'x 3 3 5 4 3', 3),
            chordShape('E', '8 8 10 8 8 8', 8),
            chordShape('D', 'x x 10 10 13 11', 10),
        ],
    },
    [Pattern.Add13]: {
        [Tonality.MAJOR]: [
            chordShape('C', 'x 3 2 2 1 0'),
            chordShape('A', 'x 3 5 5 5 5', 5),
            chordShape('G', 'x x 5 5 5 5', 5),
            chordShape('E', '8 10 10 9 10 8', 8),
            chordShape('D', 'x x 10 12 10 12', 10),
        ],
        [Tonality.MINOR]: [
            chordShape('A', 'x 3 5 5 4 5'),
            chordShape('E', '8 10 10 8 10 8', 8),
            chordShape('D', 'x x 10 12 10 11', 10),
        ],
    },
};

export const fingeringAvailable = (pattern: Pattern) => {
    return chordShapes[pattern] !== undefined;
}

const mod12 = (value: number) => ((value % 12) + 12) % 12;

// The lowest fret that keeps the shape tightest once the frets below it move up an octave
const shapeStart = (frets: number[]) => {
    const span = (start: number) => Math.max(...frets.map(fret => fret < start ? fret + 12 : fret)) - start;
    return [...frets].sort((a, b) => a - b).reduce((best, start) => span(start) < span(best) ? start : best);
}

// Every position of the chord as one playable voicing, honoring the fretboard's visible tones and strings
export const chordVoicings = (fretboard: FretboardData): ChordVoicing[] => {
    const { currentPattern, currentKey, currentTonality } = fretboard;
    if (!fingeringAvailable(currentPattern)) return [];

    const root = majorKeyToNumber[currentKey];
    const tones = degreeInPattern(currentPattern, currentTonality) ?? [];
    const isShown = (note: ChordNote) =>
        fretboard.currentStrings[note.string] && tones.includes(note.degree) && fretboard.currentHighlightNotes.includes(note.degree);

    return (chordShapes[currentPattern]?.[currentTonality] ?? []).map(({ shape, frets, barre }) => {
        const moved = diagramStrings.filter(string => frets[string] !== undefined).map(string => ({ string, fret: mod12(frets[string]! + root) }));

        // Placed from the whole shape, so hiding a tone or a string never moves the diagram
        const start = shapeStart(moved.map(note => note.fret));
        const place = (fret: number) => fret < start ? fret + 12 : fret;
        const placed = moved.map(({ string, fret }) => ({
            string,
            fret: place(fret),
            degree: degreeBySemitone[mod12(openStringPitches[string] + fret - root)],
        }));

        const highest = Math.max(...placed.map(note => note.fret));
        const firstFret = highest <= DIAGRAM_FRETS ? 1 : Math.min(...placed.map(note => note.fret).filter(fret => fret > 0));
        const notes = placed.filter(isShown);

        return { shape, notes, barre: barre === undefined ? undefined : barreAt(place(mod12(barre + root)), notes), firstFret };
    });
}

// Spans the strings fretted at its fret; none if a string beneath it is muted or it lands on the open strings
const barreAt = (fret: number, notes: ChordNote[]): ChordVoicing['barre'] => {
    const sounding = diagramStrings.map(string => notes.find(note => note.string == string));
    const atFret = sounding.flatMap((note, index) => note?.fret == fret ? [index] : []);
    const from = atFret[0];
    const to = atFret[atFret.length - 1];
    if (fret == 0 || atFret.length < 2 || sounding.slice(from, to + 1).some(note => !note)) return undefined;
    return { fret, from: diagramStrings[from], to: diagramStrings[to] };
}
