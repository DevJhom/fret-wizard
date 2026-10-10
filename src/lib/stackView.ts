import { Setup } from '@data/constants';

// Whether each page was left in Stack View. Kept in this browser only, like the theme.
const storageKey = (setup: Setup) => `${setup.toLowerCase()}StackView`;

export const getStackView = (setup: Setup): boolean => {
  try {
    return localStorage.getItem(storageKey(setup)) === 'true';
  } catch {
    return false;
  }
};

export const setStackView = (setup: Setup, isStackView: boolean) => {
  try {
    localStorage.setItem(storageKey(setup), String(isStackView));
  } catch {
    // Storage unavailable: the view still switches for this visit
  }
};
