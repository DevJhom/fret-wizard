import { Setup, Theme } from '@data/constants'
import { FretboardData } from '@/stores/usePatternStore'
import * as local from '@services/adapters/localStorageAdapter'
import * as api from '@services/adapters/apiAdapter'
import type { LibraryCard, ChordProgression } from '@services/adapters/localStorageAdapter'

// Set to true to use the Express API backend, false to use localStorage
const USE_API = false

export const fetchCurrentTheme = (): Promise<Theme | null> | Theme | null => {
  return USE_API ? api.fetchCurrentTheme() : local.fetchCurrentTheme()
}

export const saveCurrentTheme = (theme: Theme): Promise<void> | void => {
  return USE_API ? api.saveCurrentTheme(theme) : local.saveCurrentTheme(theme)
}

export const fetchCurrentFretboard = (setup: Setup): Promise<FretboardData | undefined> | FretboardData | undefined => {
  return USE_API ? api.fetchCurrentFretboard(setup) : local.fetchCurrentFretboard(setup)
}

export const saveCurrentFretboard = (setup: Setup, fretboard: FretboardData): Promise<void> | void => {
  return USE_API ? api.saveCurrentFretboard(setup, fretboard) : local.saveCurrentFretboard(setup, fretboard)
}

export const fetchFretboards = (setup: Setup): Promise<FretboardData[] | undefined> | FretboardData[] | undefined => {
  return USE_API ? api.fetchFretboards(setup) : local.fetchFretboards(setup)
}

export const saveFretboards = (setup: Setup, fretboards: FretboardData[]): Promise<void> | void => {
  return USE_API ? api.saveFretboards(setup, fretboards) : local.saveFretboards(setup, fretboards)
}

export const fetchLibraryCards = (): Promise<LibraryCard[] | undefined> | LibraryCard[] | undefined => {
  return USE_API ? api.fetchLibraryCards() : local.fetchLibraryCards()
}

export const saveLibraryCards = (cards: LibraryCard[]): Promise<void> | void => {
  return USE_API ? api.saveLibraryCards(cards) : local.saveLibraryCards(cards)
}

export const fetchChordProgression = (): Promise<ChordProgression> | ChordProgression => {
  return USE_API ? api.fetchChordProgression() : local.fetchChordProgression()
}

export const saveChordProgression = (progression: ChordProgression): Promise<void> | void => {
  return USE_API ? api.saveChordProgression(progression) : local.saveChordProgression(progression)
}
