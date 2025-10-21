import { defineStore } from 'pinia';
import { Tonality, Accidental, Pattern, Degree } from '@data/constants';
import { majorSharpAllNotes, majorFlatAllNotes, minorSharpAllNotes, minorFlatAllNotes } from '@/components/data/constants';
import { findRelativeMajor, findRelativeMinor } from '@/components/data/noteNames';

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

export interface FretboardData {
  fretAmount: number;
  currentKey: string;
  currentPattern: Pattern;
  currentTonality: Tonality;
  currentAccidental: Accidental;
  currentHighlightNotes: string[];
  currentCAGED: CurrentCAGED;
  currentStrings: CurrentStrings;
}

interface State extends FretboardData {
  allPatterns: string[];
  hasSidebarUpdated: boolean;
  hasTonalityUpdated: boolean;
  hasReset: boolean;
}

const { roots, minorSeconds, seconds, minorThirds, thirds, fourths, tritones, fifths, minorSixths, sixths, minorSevenths, sevenths } = Degree;

export const defaultData: FretboardData = {
  fretAmount: 24,
  currentKey: "C",
  currentPattern: Pattern.Pentatonic,
  currentTonality: Tonality.MAJOR, 
  currentAccidental: Accidental.SHARP,
  currentHighlightNotes: [roots],
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
}  

export const usePatternStore = defineStore('pattern', {
  state: (): State => ({
    allPatterns: [Pattern.Pentatonic, Pattern.Blue, Pattern.Diatonic, Pattern.Chromatic, Pattern.Triad, Pattern.Seventh],
    hasSidebarUpdated: false,
    hasTonalityUpdated: false,
    hasReset: false,
    ...defaultData
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
            return [roots, seconds, thirds, fifths, sixths];
          if (state.currentTonality == Tonality.MINOR)
            return [roots, minorThirds, fourths, fifths, minorSevenths];
          break;

        case Pattern.Blue:
          if (state.currentTonality == Tonality.MAJOR)
            return [roots, seconds, minorThirds, thirds, fifths, sixths];
          if (state.currentTonality == Tonality.MINOR)
            return [roots, minorThirds, fourths, tritones, fifths, sevenths];
          break;

        case Pattern.Diatonic:
          if (state.currentTonality == Tonality.MAJOR)
            return [roots, seconds, thirds, fourths, fifths, sixths, sevenths];
          if (state.currentTonality == Tonality.MINOR)
            return [roots, seconds, minorThirds, fourths, fifths, minorSixths, minorSevenths];
          break;

        case Pattern.Chromatic:
          return [ roots, minorSeconds, seconds, minorThirds, thirds, fourths, tritones, fifths, minorSixths, sixths, minorSevenths, sevenths];

        case Pattern.Triad:
          if (state.currentTonality == Tonality.MAJOR)
            return [roots, thirds, fifths];
          if (state.currentTonality == Tonality.MINOR)
            return [roots, minorThirds, fifths];
        break;

        case Pattern.Seventh:
          if (state.currentTonality == Tonality.MAJOR)
            return [roots, thirds, fifths, sevenths];
          if (state.currentTonality == Tonality.MINOR)
            return [roots, minorThirds, fifths, minorSevenths];
        break;

        default:
          return [roots, seconds, thirds, fifths, sixths];
      }
    },
  },
  actions: {
    setCurrentPattern(pattern: string) {
      this.currentPattern = pattern;
    },
    updateCurrentHighlightNotes() {
      // This functions unhighlights some notes that are not present in the scale.
      // For example, when switching from a major scale to a minor scale, some notes that are present in the major scale but not in the minor scale will be unhighlighted.
      this.currentHighlightNotes = this.currentHighlightNotes.filter(note => this.highlightNotes.some(t => t === note));
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
      // This function updates currentKey to its relative Major/Minor.
      // For example, C -> Am.
      if (this.currentTonality == Tonality.MAJOR) {
        this.currentKey = findRelativeMajor(this.currentKey);
      }
      if (this.currentTonality == Tonality.MINOR) {
        this.currentKey = findRelativeMinor(this.currentKey);
      }
    },
    toggleSidebarStatus() {
      this.hasSidebarUpdated = !this.hasSidebarUpdated
    },
    toggleTonalityStatus() {
      this.hasTonalityUpdated = !this.hasTonalityUpdated
    },
    toggleResetStatus() {
      this.hasReset = !this.hasReset
    },
    resetToDefault() {
      this.fretAmount = defaultData.fretAmount;
      this.currentKey = defaultData.currentKey;
      this.currentPattern = defaultData.currentPattern;
      this.currentTonality = defaultData.currentTonality;
      this.currentAccidental = defaultData.currentAccidental;
      this.currentHighlightNotes = defaultData.currentHighlightNotes;
      this.currentCAGED = defaultData.currentCAGED;
      this.currentStrings = defaultData.currentStrings;

      this.toggleResetStatus();
    }
  },
});