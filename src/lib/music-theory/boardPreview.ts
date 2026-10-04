import { Degree, degreeToNumber, majorKeyToNumber } from '@data/constants';
import type { CurrentStrings, FretboardData } from '@/lib/fretboardData';

export type StringName = keyof CurrentStrings;

export interface PreviewString {
  name: StringName;
  // notes[0] is the open string, notes[n] is fret n
  notes: (Degree | null)[];
}

export const PREVIEW_FRETS = 12;

// Pitch class of each open string (C = 0), high e first like the fretboard
const openStrings: [StringName, number][] = [['e', 4], ['B', 11], ['G', 7], ['D', 2], ['A', 9], ['E', 4]];

const degreeBySemitone: Degree[] = [];
Object.values(Degree).forEach(degree => { degreeBySemitone[degreeToNumber[degree]] = degree; });

// Which degree lights up at each position, honoring the fretboard's visible tones and strings
export const boardPreview = (fretboard: FretboardData, frets = PREVIEW_FRETS): PreviewString[] => {
  const root = majorKeyToNumber[fretboard.currentKey];
  const visible = new Set(fretboard.currentHighlightNotes);

  return openStrings.map(([name, open]) => ({
    name,
    notes: Array.from({ length: frets + 1 }, (_, fret) => {
      if (!fretboard.currentStrings[name]) return null;
      const degree = degreeBySemitone[(((open + fret - root) % 12) + 12) % 12];
      return visible.has(degree) ? degree : null;
    }),
  }));
};
