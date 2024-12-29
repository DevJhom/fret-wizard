const allNoteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
// const allNoteNames = ["C", "Db", "D", "Eb", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

export const KEY_TO_NUMBER: { [key: string]: number } = {
  "C": 0,
  "C#": 1, //"Db": 1,
  "D": 2,
  "D#": 3, //"Eb": 3, 
  "E": 4,
  "F": 5,
  "F#": 6, //"Gb": 6, 
  "G": 7,
  "G#": 8, //"Ab": 8, 
  "A": 9,
  "A#": 10, //"Bb": 10, 
  "B": 11,
};

export const getRootNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(0 + shift) % 12];
};

export const getSecondNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(2 + shift) % 12];
};

export const getThirdNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(4 + shift) % 12];
};

export const getFourthNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(5 + shift) % 12];
};

export const getFifthNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(7 + shift) % 12];
};

export const getSixthNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(9 + shift) % 12];
};

export const getSeventhNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(11 + shift) % 12];
};

export const getBlueNoteName = (currentKey: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return allNoteNames[(3 + shift) % 12];
};