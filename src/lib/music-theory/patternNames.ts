import { Degree, Pattern, Tonality } from "@data/constants";

const { roots, minorSeconds, seconds, minorThirds, thirds, fourths, tritones, fifths, minorSixths, sixths, minorSevenths, sevenths } = Degree;

const addChords = [Pattern.Add9, Pattern.Add11, Pattern.Add13];

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
  return pattern == Pattern.Dominant || pattern == Pattern.Power || pattern == Pattern.Chromatic;
}

export const qualityLockedReason = (pattern: Pattern) => {
  switch (pattern) {
    case Pattern.Power: return "Power chords have no third";
    case Pattern.Chromatic: return "Chromatic has no major or minor";
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
    case Pattern.Add13: return key + (minor ? "m(add13)" : "add13");
    case Pattern.Power: return key + "5";
    default: return key + (minor ? "m" : "");
  }
}

const chordFullName = (key: string, tonality: Tonality, pattern: Pattern) => {
  const quality = tonality == Tonality.MINOR ? "minor" : "major";

  switch (pattern) {
    case Pattern.Seventh: return `${key} ${quality} seventh`;
    case Pattern.Dominant: return `${key} dominant seventh`;
    case Pattern.Add9: return `${key} ${quality} add 9`;
    case Pattern.Add11: return `${key} ${quality} add 11`;
    case Pattern.Add13: return `${key} ${quality} add 13`;
    case Pattern.Power: return `${key} power chord`;
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
  return scaleFullNames[pattern] ?? "Triad arpeggio";
}

export const degreeLabel = (degree: Degree, pattern: Pattern) => {
  if (addChords.includes(pattern) && extensionLabels[degree]) {
    return extensionLabels[degree]!;
  }
  return degreeLabels[degree];
}
