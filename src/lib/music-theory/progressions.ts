import { Pattern, Tonality, majorKeyToNumber } from "@data/constants";
import { keyRoots, spellInterval } from "@data/noteNames";

export type ChordQuality = "major" | "minor" | "diminished";
export type ChordType = "triad" | "seventh" | "power";

export interface DiatonicChord {
  degree: number;
  numeral: string;
  name: string;
  quality: ChordQuality;
}

const majorProgressionKeys = ["C", "G", "D", "A", "E", "B", "F♯", "D♭", "A♭", "E♭", "B♭", "F"];
const minorProgressionKeys = ["A", "E", "B", "F♯", "C♯", "G♯", "E♭", "B♭", "F", "C", "G", "D"];

const qualitySuffixes: Record<ChordQuality, string> = { major: "", minor: "m", diminished: "°" };

const scaleSteps: Record<Tonality, { intervals: number[]; qualities: ChordQuality[]; numerals: string[]; seventhSuffixes: string[]; seventhNumerals: string[] }> = {
  [Tonality.MAJOR]: {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    qualities: ["major", "minor", "minor", "major", "major", "minor", "diminished"],
    numerals: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
    seventhSuffixes: ["maj7", "m7", "m7", "maj7", "7", "m7", "m7♭5"],
    seventhNumerals: ["Imaj7", "ii7", "iii7", "IVmaj7", "V7", "vi7", "viiø7"],
  },
  [Tonality.MINOR]: {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    qualities: ["minor", "diminished", "major", "minor", "minor", "major", "major"],
    numerals: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
    seventhSuffixes: ["m7", "m7♭5", "maj7", "m7", "m7", "maj7", "7"],
    seventhNumerals: ["i7", "iiø7", "IIImaj7", "iv7", "v7", "VImaj7", "VII7"],
  },
};

// Power chords (root + fifth) have no third, so no major/minor case on the numeral
const powerNumerals = ["I5", "II5", "III5", "IV5", "V5", "VI5", "VII5"];

export const progressionKeys = (tonality: Tonality) => {
  return tonality == Tonality.MAJOR ? majorProgressionKeys : minorProgressionKeys;
}

export const relativeProgressionKey = (key: string, from: Tonality, to: Tonality) => {
  const index = progressionKeys(from).indexOf(key);
  return progressionKeys(to)[index > -1 ? index : 0];
}

export const diatonicChords = (key: string, tonality: Tonality, type: ChordType = "triad"): DiatonicChord[] => {
  const { intervals, qualities, numerals, seventhSuffixes, seventhNumerals } = scaleSteps[tonality];

  return intervals.map((interval, degree) => {
    const root = spellInterval(key, degree, interval);
    const chord = { degree, quality: qualities[degree] };
    if (type == "seventh") return { ...chord, numeral: seventhNumerals[degree], name: root + seventhSuffixes[degree] };
    if (type == "power") return { ...chord, numeral: powerNumerals[degree], name: root + "5" };
    return { ...chord, numeral: numerals[degree], name: root + qualitySuffixes[qualities[degree]] };
  });
}

export interface ChordPattern {
  root: string;
  pattern: Pattern;
  tonality: Tonality;
}

// The Chord page's pattern and quality for each chord name the palette writes
const triadPatterns: Record<ChordQuality, Omit<ChordPattern, "root">> = {
  major: { pattern: Pattern.Triad, tonality: Tonality.MAJOR },
  minor: { pattern: Pattern.Triad, tonality: Tonality.MINOR },
  diminished: { pattern: Pattern.Diminished, tonality: Tonality.MAJOR },
};

const seventhPatterns: Record<string, Omit<ChordPattern, "root">> = {
  maj7: { pattern: Pattern.Seventh, tonality: Tonality.MAJOR },
  m7: { pattern: Pattern.Seventh, tonality: Tonality.MINOR },
  "7": { pattern: Pattern.Dominant, tonality: Tonality.MAJOR },
  "m7♭5": { pattern: Pattern.HalfDiminished, tonality: Tonality.MAJOR },
};

// A progression chord as a fretboard shows it. The neck only knows the twelve key names,
// so a root such as E♯ (F♯ major's vii°) or C♭ (E♭ minor's VI) takes its other name
export const diatonicChordPattern = (key: string, tonality: Tonality, degree: number, type: ChordType = "triad"): ChordPattern => {
  const { intervals, qualities, seventhSuffixes } = scaleSteps[tonality];
  const interval = intervals[degree];
  const chord = type == "power" ? { pattern: Pattern.Power, tonality: Tonality.MAJOR }
    : type == "seventh" ? seventhPatterns[seventhSuffixes[degree]]
    : triadPatterns[qualities[degree]];
  const spelled = spellInterval(key, degree, interval);
  const root = spelled in majorKeyToNumber ? spelled : keyRoots(chord.pattern, chord.tonality)[(majorKeyToNumber[key] + interval) % 12];
  return { root, ...chord };
}
