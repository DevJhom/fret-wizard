import { Theme } from '@data/constants';
import { CurrentFretboard, defaultData } from '@/stores/usePatternStore';

const themeStorageKey = "theme";
const fretboardStorageKey = "currentFretboard";

export const fetchCurrentTheme = () => {
  const theme = localStorage.getItem(themeStorageKey) as Theme;
  return theme;
}

export const saveCurrentTheme = (theme: Theme) => {
  localStorage.setItem(themeStorageKey, theme);
}

export const fetchCurrentFretboard = () => {
  try {
    const fretboard = localStorage.getItem(fretboardStorageKey);

    if (fretboard) {
      return JSON.parse(fretboard) as CurrentFretboard;
    }
    else {
      return defaultData;
    }
  }
  catch (error) {
    console.log("fetchCurrentFretboard: ", error);
  }
}

export const saveCurrentFretboard = (fretboard: CurrentFretboard) => {
  try {
    localStorage.setItem(fretboardStorageKey, JSON.stringify(fretboard));
  }
  catch (error) {
    console.log("saveCurrentFretboard: ", error);
  }
}