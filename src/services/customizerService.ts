import { Pattern, Tonality, Accidental } from '@data/constants';

export const fetchCurrentTheme = async () => {}

export const saveCurrentTheme = async () => {}

export const fetchCurrentFretboard = async () => {
  return {
    fretAmount: 24,
    currentKey: "C",
    currentPattern: Pattern.Pentatonic,
    currentTonality: Tonality.MAJOR, 
    currentAccidental: Accidental.SHARP
  }  

  // return {
  //   fretAmount: 20,
  //   currentKey: "A",
  //   currentPattern: Pattern.Diatonic,
  //   currentTonality: Tonality.MINOR, 
  //   currentAccidental: Accidental.FLAT
  // }  
}

export const saveCurrentFretboard = async () => {}