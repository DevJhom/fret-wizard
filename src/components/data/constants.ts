export enum Accidental {
    SHARP = "sharp",
    FLAT = "flat"
}

export enum Tonality {
    MAJOR = "major",
    MINOR = "minor"
}

export const majorSharpAllNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const majorFlatAllNotes = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

export const minorSharpAllNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
export const minorFlatAllNotes = ["A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭"];

export const MAJOR_KEY_TO_NUMBER: { [key: string]: number } = {
  "C": 0,
  "C#": 1, "D♭": 1,
  "D": 2,
  "D#": 3, "E♭": 3, 
  "E": 4,
  "F": 5,
  "F#": 6, "G♭": 6, 
  "G": 7,
  "G#": 8, "A♭": 8, 
  "A": 9,
  "A#": 10, "B♭": 10, 
  "B": 11,
};

export const MINOR_KEY_TO_NUMBER: { [key: string]: number } = {
  "A": 0,
  "A#": 1, "B♭": 1, 
  "B": 2,
  "C": 3,
  "C#": 4, "D♭": 4,
  "D": 5,
  "D#": 6, "E♭": 6, 
  "E": 7,
  "F": 8,
  "F#": 9, "G♭": 9, 
  "G": 10,
  "G#": 11, "A♭": 11, 
};
