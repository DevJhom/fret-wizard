import { Theme } from '@data/constants';
import { FretboardData, defaultData } from '@/stores/usePatternStore';

const themeStorageKey = "theme";
const fretboardStorageKey = "currentFretboard";
const fretboardListStorageKey = "fretboardList";

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
      return JSON.parse(fretboard) as FretboardData;
    }
    else {
      return defaultData;
    }
  }
  catch (error) {
    console.log("fetchCurrentFretboard: ", error);
  }
}

export const saveCurrentFretboard = (fretboard: FretboardData) => {
  try {
    localStorage.setItem(fretboardStorageKey, JSON.stringify(fretboard));
  }
  catch (error) {
    console.log("saveCurrentFretboard: ", error);
  }
}

export const fetchFretboards = () => {
  try {
    const fretboardList = localStorage.getItem(fretboardListStorageKey);

    if (fretboardList) {
      return JSON.parse(fretboardList) as FretboardData[];
    }
  }
  catch (error) {
    console.log("saveFretboards: ", error);
  }
}

export const saveFretboards = (fretboards: any) => {
  try {
    localStorage.setItem(fretboardListStorageKey, JSON.stringify(fretboards));
  }
  catch (error) {
    console.log("saveFretboards: ", error);
  }
}