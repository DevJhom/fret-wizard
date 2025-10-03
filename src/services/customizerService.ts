import { Theme } from '@data/constants';
import { Pattern, Tonality, Accidental } from '@data/constants';

export const fetchCurrentTheme = async () => {
  const theme = localStorage.getItem("theme") as Theme;
  return theme;
}

export const saveCurrentTheme = async (theme: Theme) => {
  localStorage.setItem("theme", theme);
}

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