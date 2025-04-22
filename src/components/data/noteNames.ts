import { Tonality, Accidental } from "@data/constants";
import { majorSharpAllNotes, majorFlatAllNotes, minorSharpAllNotes, minorFlatAllNotes, MAJOR_KEY_TO_NUMBER, MINOR_KEY_TO_NUMBER } from '@/components/data/constants';

export const findRelativeMajor = (currentKey: string, currentAccidental: Accidental) => {
  if (currentAccidental == Accidental.SHARP) {
    const index = minorSharpAllNotes.indexOf(currentKey);
    return majorSharpAllNotes[index];
  }
  if (currentAccidental == Accidental.FLAT) {
    const index = minorFlatAllNotes.indexOf(currentKey);
    return majorFlatAllNotes[index];
  }
}

// Major Key Formula - W – W – H – W – W – W – H
//                   - 2 – 4 – 5 – 7 – 9 – 11 – 12

// Minor Key Formula - W – H – W – W – H – W – W
//                   - 2 – 3 – 5 – 7 – 8 – 10 – 12

export const getRootNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(0 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(0 + shift) % 12];
  }
};

export const getSecondNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(2 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(3 + shift) % 12];
  }
};

export const getThirdNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(4 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(5 + shift) % 12];
  }
};

export const getFourthNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(5 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(8 + shift) % 12];
  }
};

export const getFifthNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(7 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(7 + shift) % 12];
  }
};

export const getSixthNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(9 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(10 + shift) % 12];
  }
};

export const getSeventhNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(11 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(2 + shift) % 12];
  }
};

export const getBlueNoteName = (tonality: Tonality, currentKey: string, currentAccidental: Accidental) => {
  if (tonality == Tonality.MAJOR) {
    const shift = MAJOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes);
    return allNoteNames[(3 + shift) % 12];
  }

  if (tonality == Tonality.MINOR) {
    const shift = MINOR_KEY_TO_NUMBER[currentKey];
    const allNoteNames = (currentAccidental == Accidental.SHARP ? minorSharpAllNotes : minorFlatAllNotes);
    return allNoteNames[(3 + shift) % 12];
  }
};