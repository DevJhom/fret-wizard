import { defineStore } from 'pinia';

interface State {
  allKeys: string[];
  allPatterns: string[];
  currentKey: string;
  currentPattern: string;
  currentHighlightNotes: string[];
  currentStrings: {
    E: boolean;
    A: boolean;
    D: boolean;
    G: boolean;
    B: boolean;
    e: boolean;
  }
}

export const usePatternStore = defineStore('pattern', {
  state: (): State => ({
    allKeys : ["C","C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
    allPatterns : ["Pentatonic Scale", "Blue Scale", "Diatonic Scale", "Triad Arpeggio", "Custom"],
    currentKey: "C",
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
  }),
  getters: {
    highlightNotes: (state: State) => {
      switch (state.currentPattern) {
        case "Pentatonic Scale":
          return ["roots", "seconds", "thirds", "fifths", "sixths"];
        case "Blue Scale":
          return ["roots", "seconds", "thirds", "fifths", "sixths", "blues"];
        case "Diatonic Scale":
          return ["roots", "seconds", "thirds", "fourths", "fifths", "sixths", "sevenths"];
        case "Triad Arpeggio":
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
    }
  },
});