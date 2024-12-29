import { defineStore } from 'pinia';

interface State {
  currentPattern: string;
  currentHighlightNotes: string[];
}

export const usePatternStore = defineStore('pattern', {
  state: (): State => ({
    currentPattern: "Pentatonic Scale",
    currentHighlightNotes: ["roots"],
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