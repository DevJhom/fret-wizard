export const allNoteNamesInSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const allNoteNamesInFlat = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

export const KEY_TO_NUMBER: { [key: string]: number } = {
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

export const getRootNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(0 + shift) % 12];
};

export const getSecondNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(2 + shift) % 12];
};

export const getThirdNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(4 + shift) % 12];
};

export const getFourthNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(5 + shift) % 12];
};

export const getFifthNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(7 + shift) % 12];
};

export const getSixthNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(9 + shift) % 12];
};

export const getSeventhNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(11 + shift) % 12];
};

export const getBlueNoteName = (currentKey: string, currentAccidental: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  const allNoteNames = (currentAccidental == "sharp" ? allNoteNamesInSharp : allNoteNamesInFlat);
  return allNoteNames[(3 + shift) % 12];
};