interface Intervals {
    [key: string]: number[];
}

const roots: Intervals = {
    E: [-4,8,20],
    A: [-11,1,13],
    D: [-7,5,17],
    G: [-2,10,22],
    B: [-9,3,15],
    e: [-4,8,20]
}

const seconds: Intervals = {
    E: [-2,10,22],
    A: [-9,3,15],
    D: [-5,7,19],
    G: [0,12,24],
    B: [-7,5,17],
    e: [-2,10,22]
}

const thirds: Intervals = {
    E: [0,12,24],
    A: [-7,5,17],
    D: [-3,9,21],
    G: [-10,2,14],
    B: [-5,7,19],
    e: [0,12,24]
}

const fourths: Intervals = {
    E: [1,13,25],  
    A: [-6,6,18],  
    D: [-2,10,22], 
    G: [3,15,27],  
    B: [-4,8,20],  
    e: [1,13,25]  
}

const fifths: Intervals = {
    E: [-9,3,15],
    A: [-2,8,20],
    D: [0,12,24],
    G: [-7,5,17],
    B: [-2,10,22],
    e: [-9,3,15]
}

const sixths: Intervals = {
    E: [5,17,29],  
    A: [-2,10,22], 
    D: [2,14,26],  
    G: [-5,7,19],
    B: [0,12,24],  
    e: [5,17,29]
}

const sevenths: Intervals = {
    E: [7,19,31],  
    A: [0,12,24],  
    D: [4,16,28],  
    G: [-1,11,23], 
    B: [2,14,26],  
    e: [7,19,31] 
}

const blues: Intervals = {
    E: [11,23],
    A: [4,16],
    D: [8,20],
    G: [1,13],
    B: [6,18],
    e: [11,23]
}

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

export const getRoots = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return roots[stringName].map(note => (note + shift));
};

export const getSeconds = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return seconds[stringName].map(note => (note + shift));
};

export const getThirds = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return thirds[stringName].map(note => (note + shift));
};

export const getFourths = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return fourths[stringName].map(note => (note + shift));
};

export const getFifths = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return fifths[stringName].map(note => (note + shift));
};

export const getSixths = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return sixths[stringName].map(note => (note + shift));
};

export const getSevenths = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return sevenths[stringName].map(note => (note + shift));
};

export const getBlues = (currentKey: string, stringName: string) => {
  const shift = KEY_TO_NUMBER[currentKey];
  return blues[stringName].map(note => (note + shift));
};