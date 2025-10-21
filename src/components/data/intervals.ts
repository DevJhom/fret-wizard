import { Tonality } from '@data/constants';
import { majorKeyToNumber, minorKeyToNumber } from "@data/constants";

interface Intervals {
  [key: string]: number[];
}

const roots: Intervals = {
  e: [-4, 8, 20],
  B: [-11, 1, 13],
  G: [-7, 5, 17],
  D: [-2, 10, 22],
  A: [-9, 3, 15],
  E: [-4, 8, 20],
};

const minorSeconds: Intervals = {
  e: [-3, 9, 21], 
  B: [-10, 2, 14], 
  G: [-6, 6, 18], 
  D: [-1, 11, 23], 
  A: [-8, 4, 16],
  E: [-3, 9, 21]
}

const seconds: Intervals = {
  e: [-2, 10, 22],
  B: [-9, 3, 15],
  G: [-5, 7, 19],
  D: [0, 12, 24],
  A: [-7, 5, 17],
  E: [-2, 10, 22],
};

const minorThirds: Intervals = {
  e: [-1, 11, 23], 
  B: [-8, 4, 16], 
  G: [-4, 8, 20], 
  D: [1, 13, 25], 
  A: [-6, 6, 18],
  E: [-1, 11, 23]

}

const thirds: Intervals = {
  e: [0, 12, 24],
  B: [-19, -7, 5, 17],
  G: [-3, 9, 21],
  D: [-10, 2, 14, 26],
  A: [-5, 7, 19],
  E: [0, 12, 24]
};

const fourths: Intervals = {
  e: [1, 13, 25],
  B: [-18, -6, 6, 18],
  G: [-2, 10, 22],
  D: [-9, 3, 15, 27],
  A: [-4, 8, 20],
  E: [1, 13, 25],
};

const tritones: Intervals = {
  e: [2, 14, 26],
  B: [-17, -5, 7, 19],
  G: [-1, 11, 23],
  D: [-8, 4, 16, 28],
  A: [-3, 9, 21],
  E: [2, 14, 26],
};

const fifths: Intervals = {
  e: [-9, 3, 15],
  B: [-4, 8, 20],
  G: [0, 12, 24],
  D: [-7, 5, 17],
  A: [-2, 10, 22],
  E: [-9, 3, 15],
};

const minorSixths: Intervals = {
  e: [-8, 4, 16],
  B: [-3, 9, 21],
  G: [1, 13, 25],
  D: [-6, 6, 18],
  A: [-1, 11, 23],
  E: [-8, 4, 16],
};

const sixths: Intervals = {
  e: [-7, 5, 17, 29],
  B: [-2, 10, 22],
  G: [-10, 2, 14, 26],
  D: [-5, 7, 19],
  A: [0, 12, 24],
  E: [-7, 5, 17, 29],
};

const minorSevenths: Intervals = {
  e: [-6, 6, 18, 30],
  B: [-1, 11, 23],
  G: [-9, 3, 15, 27],
  D: [-4, 8, 20],
  A: [1, 13, 25],
  E: [-6, 6, 18, 30],
};

const sevenths: Intervals = {
  e: [-5, 7, 19, 31],
  B: [0, 12, 24],
  G: [-8, 4, 16, 28],
  D: [-3, 9, 21],
  A: [-10, 2, 14, 26],
  E: [-5, 7, 19, 31],
};

/*
Intervals for "A" Minor Key
1. roots
2. major seconds
3. minor thirds 
4. perfect fourths
5. perfect fifths
6. minor sixths 
7. minor sevenths 
- "Relative Minor" concept
*/

const minorKeyRoots = sixths;
const minorKeySeconds = sevenths;
const minorKeyThirds = roots;
const minorKeyFourths = seconds;
const minorKeyFifths = thirds; 
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

export const getMinorThirds = (tonality: Tonality, currentKey: string, stringName: string) => {
  const shift = majorKeyToNumber[currentKey];
  return minorThirds[stringName].map(note => (note + shift));
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

export const getTritones = (tonality: Tonality, currentKey: string, stringName: string) => {
  const shift = majorKeyToNumber[currentKey];
  return tritones[stringName].map(note => (note + shift));
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

export const getMinorSixths = (tonality: Tonality, currentKey: string, stringName: string) => {
  const shift = majorKeyToNumber[currentKey];
  return minorSixths[stringName].map(note => (note + shift));
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

export const getMinorSevenths = (tonality: Tonality, currentKey: string, stringName: string) => {
  const shift = majorKeyToNumber[currentKey];
  return minorSevenths[stringName].map(note => (note + shift));
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