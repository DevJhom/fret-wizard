import { defineStore } from 'pinia';
import { Tonality, Accidental, Pattern } from '@data/constants';
import { majorSharpAllNotes, majorFlatAllNotes, minorSharpAllNotes, minorFlatAllNotes } from '@/components/data/constants';

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

interface State {
  allPatterns: string[];
  currentKey: string;
  currentPattern: string;
  currentHighlightNotes: string[];
  currentStrings: CurrentStrings;
  currentCAGED: CurrentCAGED;
  currentAccidental: Accidental.SHARP | Accidental.FLAT;
  currentTonality: Tonality.MAJOR | Tonality.MINOR;
}

export const usePatternStore = defineStore('pattern', {
  state: (): State => ({
    allPatterns: [Pattern.Pentatonic, Pattern.Blue, Pattern.Diatonic, Pattern.Triad],
    currentKey: "C",
    currentAccidental: Accidental.SHARP,
    currentTonality: Tonality.MAJOR,
    currentPattern: Pattern.Pentatonic,
    currentHighlightNotes: ["roots"],
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
    }
  }),
  getters: {
    allKeys: (state: State) => {
      if (state.currentTonality == Tonality.MAJOR) {
        return (state.currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
      }
      if (state.currentTonality == Tonality.MINOR) {
        return (state.currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
      }
    },
    highlightNotes: (state: State) => {
      switch (state.currentPattern) {
        case Pattern.Pentatonic:
          if (state.currentTonality == Tonality.MAJOR)
            return ["roots", "seconds", "thirds", "fifths", "sixths"];
          if (state.currentTonality == Tonality.MINOR)
            return ["roots", "thirds", "fourths", "fifths", "sevenths"];
          break;
        case Pattern.Blue:
          if (state.currentTonality == Tonality.MAJOR)
            return ["roots", "seconds", "thirds", "fifths", "sixths", "blues"];
          if (state.currentTonality == Tonality.MINOR)
            return ["roots", "thirds", "fourths", "fifths", "sevenths", "blues"];
          break;
        case Pattern.Diatonic:
          return ["roots", "seconds", "thirds", "fourths", "fifths", "sixths", "sevenths"];
        case Pattern.Triad:
          return ["roots", "thirds", "fifths"];
        default:
          return ["roots", "thirds", "fifths"];
      }
    },
  },
  actions: {
    setCurrentPattern(pattern: string) {
      this.currentPattern = pattern;
    },
    updateCurrentHighlightNotes() {
      this.currentHighlightNotes = this.currentHighlightNotes.filter(note => this.highlightNotes.includes(note));
    },
    updateToEqualAccidental() {
      if (this.currentAccidental == Accidental.SHARP) {
        const index = majorFlatAllNotes.indexOf(this.currentKey);
        this.currentKey = majorSharpAllNotes[index];
      }
      if (this.currentAccidental == Accidental.FLAT) {
        const index = majorSharpAllNotes.indexOf(this.currentKey);
        this.currentKey = majorFlatAllNotes[index];
      }
    },
    updateTonality() {
      if (this.currentTonality == Tonality.MAJOR) {
        this.currentKey = "C";
      }
      if (this.currentTonality == Tonality.MINOR) {
        this.currentKey = "A";
      }
    }
  },
});