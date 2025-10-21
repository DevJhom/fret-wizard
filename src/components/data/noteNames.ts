import { Tonality, Accidental, Degree, degreeToNumber } from "@data/constants";
import { majorSharpAllNotes, majorFlatAllNotes, minorSharpAllNotes, minorFlatAllNotes, majorKeyToNumber } from '@/components/data/constants';

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

export const getNoteName = (degreeName: Degree, currentKey: string, currentAccidental: Accidental) => {
  const degreeNo = degreeToNumber[degreeName];
  const shift = majorKeyToNumber[currentKey];
  const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
  return allNoteNames[(degreeNo + shift) % 12];
};