import { Setup, Tonality, degreeInPattern } from '@data/constants';
import { diatonicChordPattern } from '@data/progressions';
import { defaultDataFor } from '@/lib/fretboardData';
import type { FretboardData } from '@/lib/fretboardData';
import type { ProgressionChord, ProgressionChordView } from '@services/adapters/localStorageAdapter';

// A progression chord on its neck: the chord comes from the key, the rest from its saved view
export const progressionFretboard = (key: string, tonality: Tonality, chord: ProgressionChord): FretboardData => {
  const { root, pattern, tonality: quality } = diatonicChordPattern(key, tonality, chord.degree, chord.type);
  const defaults = defaultDataFor(Setup.Chord);
  const view = chord.view;
  return {
    ...defaults,
    currentKey: root,
    currentPattern: pattern,
    currentTonality: quality,
    currentHighlightNotes: (degreeInPattern(pattern, quality) ?? []).filter(degree => !view?.hiddenTones?.includes(degree)),
    currentCAGED: view?.currentCAGED ?? defaults.currentCAGED,
    currentStrings: view?.currentStrings ?? defaults.currentStrings,
    fretAmount: view?.fretAmount ?? defaults.fretAmount,
  };
}

// What to save for an edited row: everything the chord itself doesn't decide
export const progressionChordView = (fretboard: FretboardData): ProgressionChordView => ({
  hiddenTones: (degreeInPattern(fretboard.currentPattern, fretboard.currentTonality) ?? []).filter(degree => !fretboard.currentHighlightNotes.includes(degree)),
  currentCAGED: { ...fretboard.currentCAGED },
  currentStrings: { ...fretboard.currentStrings },
  fretAmount: fretboard.fretAmount,
});
