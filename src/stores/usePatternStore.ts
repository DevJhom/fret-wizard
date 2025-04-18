import { defineStore } from 'pinia';
import { allNoteNamesInSharp, allNoteNamesInFlat } from '@/components/data/noteNames';

interface State {
  allPatterns: string[];
  currentKey: string;
  currentPattern: string;
  currentHighlightNotes: string[];
  currentStrings: CurrentStrings;
  currentCAGED: CurrentCAGED;
  currentAccidental: "sharp" | "flat";
}

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

export const usePatternStore = defineStore('pattern', {
  state: (): State => ({
    allPatterns : ["Pentatonic Scale", "Blue Scale", "Diatonic Scale", "Triad", "Custom"],
    currentKey: "C",
    currentAccidental: "sharp",
    currentPattern: "Pentatonic Scale",
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
      return (state.currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
    },
    highlightNotes: (state: State) => {
      switch (state.currentPattern) {
        case "Pentatonic Scale":
          return ["roots", "seconds", "thirds", "fifths", "sixths"];
        case "Blue Scale":
          return ["roots", "seconds", "thirds", "fifths", "sixths", "blues"];
        case "Diatonic Scale":
          return ["roots", "seconds", "thirds", "fourths", "fifths", "sixths", "sevenths"];
        case "Triad":
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
      if (this.currentAccidental == "sharp") {
        const index = allNoteNamesInFlat.indexOf(this.currentKey);
        this.currentKey = allNoteNamesInSharp[index];
      }
      if (this.currentAccidental == "flat") {
        const index = allNoteNamesInSharp.indexOf(this.currentKey);
        this.currentKey = allNoteNamesInFlat[index];
      }
    }
  },
});