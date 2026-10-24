import { Tonality, Degree, Pattern, degreeToNumber } from "@data/constants";
import { majorSharpAllNotes, majorFlatAllNotes, minorSharpAllNotes, minorFlatAllNotes, majorKeyToNumber } from '@data/constants';
import { isQualityLocked } from '@data/patternNames';

export const findRelativeMajor = (currentKey: string) => {
  const indexInSharp = minorSharpAllNotes.indexOf(currentKey);
  if (indexInSharp > -1) {
    return majorSharpAllNotes[indexInSharp];
  }
  
  const indexInFlat = minorFlatAllNotes.indexOf(currentKey);
  if (indexInFlat > -1) {
    return majorFlatAllNotes[indexInFlat];
  }
}

export const findRelativeMinor = (currentKey: string) => {
  const indexInSharp = majorSharpAllNotes.indexOf(currentKey);
  if (indexInSharp > -1) {
    return minorSharpAllNotes[indexInSharp];
  }
  
  const indexInFlat = majorFlatAllNotes.indexOf(currentKey);
  if (indexInFlat > -1) {
    return minorFlatAllNotes[indexInFlat];
  }
}

// Major Key Formula - W – W – H – W – W – W – H
//                   - 2 – 4 – 5 – 7 – 9 – 11 – 12

// Minor Key Formula - W – H – W – W – H – W – W
//                   - 2 – 3 – 5 – 7 – 8 – 10 – 12

const letters = ["C", "D", "E", "F", "G", "A", "B"];
const letterPitches = [0, 2, 4, 5, 7, 9, 11];
const accidentals: { [offset: number]: string } = { [-2]: "𝄫", [-1]: "♭", 0: "", 1: "♯", 2: "𝄪" };

// The note some letters and semitones above the root: a third is always two letters up, so C's minor third is E♭, not D♯
export const spellInterval = (root: string, letterSteps: number, semitones: number) => {
  const letterIndex = (letters.indexOf(root[0]) + letterSteps) % 7;
  const targetPitch = (majorKeyToNumber[root] + semitones) % 12;
  const offset = ((targetPitch - letterPitches[letterIndex] + 18) % 12) - 6;
  return letters[letterIndex] + accidentals[offset];
}

// Letters above the root, as the degree labels count them (the tritone is the ♭5)
export const degreeLetterSteps: Record<Degree, number> = {
  [Degree.roots]: 0,
  [Degree.minorSeconds]: 1,
  [Degree.seconds]: 1,
  [Degree.minorThirds]: 2,
  [Degree.thirds]: 2,
  [Degree.fourths]: 3,
  [Degree.tritones]: 4,
  [Degree.fifths]: 4,
  [Degree.minorSixths]: 5,
  [Degree.sixths]: 5,
  [Degree.minorSevenths]: 6,
  [Degree.sevenths]: 6,
};

export const getNoteName = (degreeName: Degree, currentKey: string, pattern: Pattern) => {
  const degreeNo = degreeToNumber[degreeName];

  // The chromatic scale has no key to spell from: sharps from a natural or sharp root, flats from a flat one
  if (pattern == Pattern.Chromatic) {
    const allNoteNames = currentKey.includes("♭") ? majorFlatAllNotes : majorSharpAllNotes;
    return allNoteNames[(degreeNo + majorKeyToNumber[currentKey]) % 12];
  }

  const name = spellInterval(currentKey, degreeLetterSteps[degreeName], degreeNo);
  // The blue note is written as a ♯4 where a ♭5 would need a double flat (A, not B𝄫, in E♭ minor)
  if (pattern == Pattern.Blue && degreeName == Degree.tritones && name.includes("𝄫")) {
    return spellInterval(currentKey, degreeLetterSteps[Degree.fourths], degreeNo);
  }
  return name;
};

// Roots from C, as the Chord Progression page names its keys, so no key or chord needs a double sharp or flat
const majorRoots = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
const minorRoots = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
// E♭° would need B𝄫, D♯° is D♯ F♯ A
const diminishedRoots = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

export const keyRoots = (pattern: Pattern, tonality: Tonality) => {
  if (pattern == Pattern.Diminished || pattern == Pattern.HalfDiminished) return diminishedRoots;
  if (tonality == Tonality.MINOR && !isQualityLocked(pattern)) return minorRoots;
  return majorRoots;
}

// The name a root goes by for this pattern and quality, whichever spelling it was saved with
export const rootName = (key: string, pattern: Pattern, tonality: Tonality) => {
  const pitch = majorKeyToNumber[key];
  return pitch === undefined ? key : keyRoots(pattern, tonality)[pitch];
}
