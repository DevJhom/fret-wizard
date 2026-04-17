import { Theme } from '@data/constants'
import { FretboardData, defaultData } from '@/stores/usePatternStore'

const themeStorageKey = 'theme'
const fretboardStorageKey = 'currentFretboard'
const fretboardListStorageKey = 'fretboardList'

export const fetchCurrentTheme = (): Theme | null => {
  return localStorage.getItem(themeStorageKey) as Theme
}

export const saveCurrentTheme = (theme: Theme): void => {
  localStorage.setItem(themeStorageKey, theme)
}

export const fetchCurrentFretboard = (): FretboardData | undefined => {
  try {
    const fretboard = localStorage.getItem(fretboardStorageKey)
    return fretboard ? JSON.parse(fretboard) as FretboardData : defaultData
  } catch (error) {
    console.log('fetchCurrentFretboard: ', error)
  }
}

export const saveCurrentFretboard = (fretboard: FretboardData): void => {
  try {
    localStorage.setItem(fretboardStorageKey, JSON.stringify(fretboard))
  } catch (error) {
    console.log('saveCurrentFretboard: ', error)
  }
}

export const fetchFretboards = (): FretboardData[] | undefined => {
  try {
    const fretboardList = localStorage.getItem(fretboardListStorageKey)
    return fretboardList ? JSON.parse(fretboardList) as FretboardData[] : undefined
  } catch (error) {
    console.log('fetchFretboards: ', error)
  }
}

export const saveFretboards = (fretboards: FretboardData[]): void => {
  try {
    localStorage.setItem(fretboardListStorageKey, JSON.stringify(fretboards))
  } catch (error) {
    console.log('saveFretboards: ', error)
  }
}
