import { Tonality, Accidental } from "@data/constants";
import { majorSharpAllNotes, majorFlatAllNotes, minorSharpAllNotes, minorFlatAllNotes, majorKeyToNumber, minorKeyToNumber } from '@/components/data/constants';

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

export const getRootNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(0 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(0 + shift) % 12];
  }
};

export const getSecondNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(2 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(2 + shift) % 12];
  }
};

export const getThirdNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(4 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(3 + shift) % 12];
  }
};

export const getFourthNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(5 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(5 + shift) % 12];
  }
};

export const getFifthNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(7 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(7 + shift) % 12];
  }
};

export const getSixthNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(9 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(8 + shift) % 12];
  }
};

export const getSeventhNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(11 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(10 + shift) % 12];
  }
};

export const getBlueNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(3 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(3 + shift) % 12];
  }
};