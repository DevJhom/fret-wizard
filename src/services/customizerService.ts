import { Theme } from '@data/constants'
import { FretboardData } from '@/stores/usePatternStore'
import * as local from '@services/adapters/localStorageAdapter'
import * as api from '@services/adapters/apiAdapter'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'

// Set to true to use the Express API backend, false to use localStorage
const USE_API = false

export const fetchCurrentTheme = (): Promise<Theme | null> | Theme | null => {
  return USE_API ? api.fetchCurrentTheme() : local.fetchCurrentTheme()
}

export const saveCurrentTheme = (theme: Theme): Promise<void> | void => {
  return USE_API ? api.saveCurrentTheme(theme) : local.saveCurrentTheme(theme)
}

export const fetchCurrentFretboard = (): Promise<FretboardData | undefined> | FretboardData | undefined => {
  return USE_API ? api.fetchCurrentFretboard() : local.fetchCurrentFretboard()
}

export const saveCurrentFretboard = (fretboard: FretboardData): Promise<void> | void => {
  return USE_API ? api.saveCurrentFretboard(fretboard) : local.saveCurrentFretboard(fretboard)
}

export const fetchFretboards = (): Promise<FretboardData[] | undefined> | FretboardData[] | undefined => {
  return USE_API ? api.fetchFretboards() : local.fetchFretboards()
}

export const saveFretboards = (fretboards: FretboardData[]): Promise<void> | void => {
  return USE_API ? api.saveFretboards(fretboards) : local.saveFretboards(fretboards)
}

export const fetchLibraryCards = (): Promise<LibraryCard[] | undefined> | LibraryCard[] | undefined => {
  return USE_API ? api.fetchLibraryCards() : local.fetchLibraryCards()
}

export const saveLibraryCards = (cards: LibraryCard[]): Promise<void> | void => {
  return USE_API ? api.saveLibraryCards(cards) : local.saveLibraryCards(cards)
}
