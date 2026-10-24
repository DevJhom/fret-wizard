import { Degree, Pattern, Tonality } from "@data/constants";

const { roots, minorSeconds, seconds, minorThirds, thirds, fourths, tritones, fifths, minorSixths, sixths, minorSevenths, sevenths } = Degree;

// Add13 is shown as the sixth chord, so its 6th keeps its plain label
const addChords = [Pattern.Add9, Pattern.Add11];

// Chords with one quality whatever the Major/Minor choice
const lockedPatterns = [Pattern.Dominant, Pattern.Power, Pattern.Chromatic, Pattern.Sus2, Pattern.Sus4, Pattern.Diminished, Pattern.HalfDiminished];

const scaleShortNames: Partial<Record<Pattern, string>> = {
  [Pattern.Pentatonic]: "Pentatonic",
  [Pattern.Blue]: "Blues",
  [Pattern.Diatonic]: "Diatonic",
  [Pattern.Chromatic]: "Chromatic",
};

const scaleFullNames: Partial<Record<Pattern, string>> = {
  [Pattern.Pentatonic]: "Pentatonic Scale",
  [Pattern.Blue]: "Blues Scale",
  [Pattern.Diatonic]: "Diatonic Scale",
  [Pattern.Chromatic]: "Chromatic Scale",
};

const degreeLabels: Record<Degree, string> = {
  [roots]: "R",
  [minorSeconds]: "♭2",
  [seconds]: "2",
  [minorThirds]: "♭3",
  [thirds]: "3",
  [fourths]: "4",
  [tritones]: "♭5",
  [fifths]: "5",
  [minorSixths]: "♭6",
  [sixths]: "6",
  [minorSevenths]: "♭7",
  [sevenths]: "7",
};

const extensionLabels: Partial<Record<Degree, string>> = {
  [seconds]: "9",
  [fourths]: "11",
  [sixths]: "13",
};

export const isQualityLocked = (pattern: Pattern) => {
  return lockedPatterns.includes(pattern);
}

export const qualityLockedReason = (pattern: Pattern) => {
  switch (pattern) {
    case Pattern.Power: return "Power chords have no third";
    case Pattern.Chromatic: return "Chromatic has no major or minor";
    case Pattern.Sus2:
    case Pattern.Sus4: return "Suspended chords have no third";
    case Pattern.Diminished: return "Diminished is always ♭3 and ♭5";
    case Pattern.HalfDiminished: return "Half-diminished is always ♭3, ♭5 and ♭7";
    default: return "Dominant 7 is always major";
  }
}

const chordSymbol = (key: string, tonality: Tonality, pattern: Pattern) => {
  const minor = tonality == Tonality.MINOR;

  switch (pattern) {
    case Pattern.Seventh: return key + (minor ? "m7" : "maj7");
    case Pattern.Dominant: return key + "7";
    case Pattern.Add9: return key + (minor ? "m(add9)" : "add9");
    case Pattern.Add11: return key + (minor ? "m(add11)" : "add11");
    case Pattern.Add13: return key + (minor ? "m6" : "6");
    case Pattern.Power: return key + "5";
    case Pattern.Sus2: return key + "sus2";
    case Pattern.Sus4: return key + "sus4";
    // Written as the Chord Progression page writes it
    case Pattern.Diminished: return key + "°";
    case Pattern.HalfDiminished: return key + "m7♭5";
    default: return key + (minor ? "m" : "maj");
  }
}

const chordFullName = (key: string, tonality: Tonality, pattern: Pattern) => {
  const quality = tonality == Tonality.MINOR ? "minor" : "major";

  switch (pattern) {
    case Pattern.Seventh: return `${key} ${quality} seventh`;
    case Pattern.Dominant: return `${key} dominant seventh`;
    case Pattern.Add9: return `${key} ${quality} add 9`;
    case Pattern.Add11: return `${key} ${quality} add 11`;
    case Pattern.Add13: return `${key} ${quality} sixth`;
    case Pattern.Power: return `${key} power chord`;
    case Pattern.Sus2: return `${key} suspended second`;
    case Pattern.Sus4: return `${key} suspended fourth`;
    case Pattern.Diminished: return `${key} diminished`;
    case Pattern.HalfDiminished: return `${key} half-diminished`;
    default: return `${key} ${quality}`;
  }
}

export const patternSymbol = (key: string, tonality: Tonality, pattern: Pattern, isScale: boolean) => {
  if (!isScale) return chordSymbol(key, tonality, pattern);

  const name = scaleShortNames[pattern] ?? "Triad";
  if (pattern == Pattern.Chromatic) return `${key} ${name}`;
  return `${key}${tonality == Tonality.MINOR ? "m" : ""} ${name}`;
}

export const patternTitle = (key: string, tonality: Tonality, pattern: Pattern, isScale: boolean) => {
  if (!isScale) return chordSymbol(key, tonality, pattern);
  if (pattern == Pattern.Chromatic) return key;
  return `${key} ${tonality}`;
}

export const patternSubtitle = (key: string, tonality: Tonality, pattern: Pattern, isScale: boolean) => {
  if (!isScale) return chordFullName(key, tonality, pattern);
  return scaleFullNames[pattern] ?? "Triad";
}

export const degreeLabel = (degree: Degree, pattern: Pattern) => {
  if (addChords.includes(pattern) && extensionLabels[degree]) {
    return extensionLabels[degree]!;
  }
  return degreeLabels[degree];
}
