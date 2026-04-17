import { Theme } from '@data/constants'
import { FretboardData, defaultData } from '@/stores/usePatternStore'

export interface LibraryCard {
  id: string
  name: string
  data: FretboardData
  createdAt: number
}

const themeStorageKey = 'theme'
const fretboardStorageKey = 'currentFretboard'
const fretboardListStorageKey = 'fretboardList'
const libraryCardsStorageKey = 'libraryCards'

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

export const fetchLibraryCards = (): LibraryCard[] | undefined => {
  try {
    const cards = localStorage.getItem(libraryCardsStorageKey)
    return cards ? JSON.parse(cards) as LibraryCard[] : undefined
  } catch (error) {
    console.log('fetchLibraryCards: ', error)
  }
}

export const saveLibraryCards = (cards: LibraryCard[]): void => {
  try {
    localStorage.setItem(libraryCardsStorageKey, JSON.stringify(cards))
  } catch (error) {
    console.log('saveLibraryCards: ', error)
  }
}
