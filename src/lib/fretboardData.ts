import { Tonality, Accidental, Setup, Pattern, Degree, degreeInPattern } from '@data/constants';

export interface CurrentStrings {
  E: boolean;
  A: boolean;
  D: boolean;
  G: boolean;
  B: boolean;
  e: boolean;
}

export interface CurrentCAGED {
  CShape: boolean;
  AShape: boolean;
  GShape: boolean;
  EShape: boolean;
  DShape: boolean;
}

export type ChordView = 'shapes' | 'fingering';

export interface FretboardData {
  fretAmount: number;
  currentKey: string;
  currentSetup: Setup;
  currentPattern: Pattern;
  currentTonality: Tonality;
  currentAccidental: Accidental;
  currentHighlightNotes: string[];
  currentCAGED: CurrentCAGED;
  currentStrings: CurrentStrings;
  currentChordPosition: number;
  chordView?: ChordView;
}

export const defaultData: FretboardData = {
  fretAmount: 24,
  currentKey: "C",
  currentPattern: Pattern.Pentatonic,
  currentSetup: Setup.Scale,
  currentTonality: Tonality.MAJOR,
  currentAccidental: Accidental.SHARP,
  currentHighlightNotes: [Degree.roots],
  currentStrings: {
    E: true,
    A: true,
    D: true,
    G: true,
    B: true,
    e: true
  },
  currentCAGED: {
    CShape: true,
    AShape: true,
    GShape: true,
    EShape: true,
    DShape: true
  },
  currentChordPosition: 0
}

export const defaultPatternFor = (setup: Setup): Pattern => (setup == Setup.Scale ? Pattern.Pentatonic : Pattern.Triad);

export const defaultDataFor = (setup: Setup): FretboardData => ({
  ...structuredClone(defaultData),
  currentSetup: setup,
  currentPattern: defaultPatternFor(setup),
  currentHighlightNotes: degreeInPattern(defaultPatternFor(setup), Tonality.MAJOR)
});
