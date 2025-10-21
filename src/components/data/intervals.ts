import { Tonality } from '@data/constants';
import { majorKeyToNumber, minorKeyToNumber } from "@data/constants";

interface Intervals {
    [key: string]: number[];
}

/*
Intervals for "C" Major Key
1. roots
2. major seconds
3. major thirds
4. perfect fourths
5. perfect fifths
6. major sixths
7. major sevenths
*/

const roots: Intervals = {
    e: [-4,8,20],
    B: [-11,1,13],
    G: [-7,5,17],
    D: [-2,10,22],
    A: [-9,3,15],
    E: [-4,8,20]
}

const minorSeconds: Intervals = {
    e: [-3, 9, 21], 
    B: [-10, 2, 14], 
    G: [-6, 6, 18], 
    D: [-1, 11, 23], 
    A: [-8, 4, 16],
    E: [-3, 9, 21]
}

const seconds: Intervals = {
    e: [-2,10,22],
    B: [-9,3,15],
    G: [-5,7,19],
    D: [0,12,24],
    A: [-7,5,17],
    E: [-2,10,22]
}

const thirds: Intervals = {
    e: [0,12,24],
    B: [-7,5,17],
    G: [-3,9,21],
    D: [-10,2,14],
    A: [-5,7,19],
    E: [0,12,24]
}

const fourths: Intervals = {
    e: [1,13,25],  
    B: [-18,-6,6,18],  
    G: [-2,10,22], 
    D: [-9,3,15,27],  
    A: [-4,8,20],  
    E: [1,13,25]  
}

const fifths: Intervals = {
    e: [-9,3,15],
    B: [-4,8,20],
    G: [0,12,24],
    D: [-7,5,17],
    A: [-2,10,22],
    E: [-9,3,15]
}

const sixths: Intervals = {
    e: [-7,5,17,29],  
    B: [-2,10,22], 
    G: [-10,2,14,26],  
    D: [-5,7,19],
    A: [0,12,24],  
    E: [-7,5,17,29]
}

const sevenths: Intervals = {
    e: [-5,7,19,31],  
    B: [0,12,24],  
    G: [-8,4,16,28],  
    D: [-3,9,21],
    A: [-10,2,14,26],  
    E: [-5,7,19,31] 
}

const blues: Intervals = {
    e: [-1,11,23],
    B: [-8,4,16],
    G: [-4,8,20],
    D: [-11,1,13],
    A: [-6,6,18],
    E: [-1,11,23]
}

/*
Intervals for "A" Minor Key
1. roots
2. major seconds
3. minor thirds 
4. perfect fourths
5. perfect fifths
6. minor sixths 
7. minor sevenths 
See "Relative Minor" concept
*/

const minorKeyRoots = sixths;
const minorKeySeconds = sevenths;
const minorKeyThirds = roots;
const minorKeyFourths = seconds;
const minorKeyFifths: Intervals = { 
  // minorKeyFifths = fourths - 1
    e: [0,12,24],  
    B: [-19,-7,5,17],  
    G: [-3,9,21], 
    D: [-10,2,14,26],  
    A: [-5,7,19],  
    E: [0,12,24],  
}
const minorKeySixths = fourths;
const minorKeySevenths = fifths;

export const getRoots = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return roots[stringName].map(note => (note + shift));
  }
  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return minorKeyRoots[stringName].map(note => (note + shift));
  }
};

export const getMinorSeconds = (tonality: Tonality, currentKey: string, stringName: string) => {
  const shift = majorKeyToNumber[currentKey];
  return minorSeconds[stringName].map(note => (note + shift));
};

export const getSeconds = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return seconds[stringName].map(note => (note + shift));
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return minorKeySeconds[stringName].map(note => (note + shift));
  }
};

export const getThirds = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return thirds[stringName].map(note => (note + shift));
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return minorKeyThirds[stringName].map(note => (note + shift));
  }
};

export const getFourths = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return fourths[stringName].map(note => (note + shift));
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return minorKeyFourths[stringName].map(note => (note + shift));
  }
};

export const getFifths = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return fifths[stringName].map(note => (note + shift));
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return minorKeyFifths[stringName].map(note => (note + shift));
  }
};

export const getSixths = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return sixths[stringName].map(note => (note + shift));
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return minorKeySixths[stringName].map(note => (note + shift));
  }
};

export const getSevenths = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return sevenths[stringName].map(note => (note + shift));
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return minorKeySevenths[stringName].map(note => (note + shift));
  }
};

export const getBlues = (tonality: Tonality, currentKey: string, stringName: string) => {
  if (tonality == Tonality.MAJOR) {
    const shift = majorKeyToNumber[currentKey];
    return blues[stringName].map(note => (note + shift));
  }

  if (tonality == Tonality.MINOR) {
    const shift = minorKeyToNumber[currentKey];
    return blues[stringName].map(note => (note + shift));
  }
};