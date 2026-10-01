import { Setup, Theme } from '@data/constants'
import { FretboardData } from '@/lib/fretboardData'
import * as local from '@services/adapters/localStorageAdapter'
import * as api from '@services/adapters/apiAdapter'
import { useAuthStore } from '@stores/useAuthStore'
import type { ChordProgression, LibraryCard, LibraryCardInput, LibraryCardPatch } from '@services/adapters/localStorageAdapter'

// Signed-in users read and write through the API; guests use localStorage.
// The theme always stays on this device.
const useApi = (): boolean => useAuthStore().isAuthenticated

export const fetchCurrentTheme = (): Theme | null => local.fetchCurrentTheme()

export const saveCurrentTheme = (theme: Theme): void => local.saveCurrentTheme(theme)

export const fetchCurrentFretboard = (setup: Setup): FretboardData | undefined => {
  return useApi() ? api.fetchCurrentFretboard(setup) : local.fetchCurrentFretboard(setup)
}

export const saveCurrentFretboard = (setup: Setup, fretboard: FretboardData): void => {
  if (useApi()) api.saveCurrentFretboard(setup, fretboard)
  else local.saveCurrentFretboard(setup, fretboard)
}

export const fetchFretboards = (setup: Setup): Promise<FretboardData[] | undefined> | FretboardData[] | undefined => {
  return useApi() ? api.fetchFretboards(setup) : local.fetchFretboards(setup)
}

export const saveFretboards = (setup: Setup, fretboards: FretboardData[]): void => {
  if (useApi()) api.saveFretboards(setup, fretboards)
  else local.saveFretboards(setup, fretboards)
}

export const fetchLibraryCards = (): Promise<LibraryCard[] | undefined> | LibraryCard[] | undefined => {
  return useApi() ? api.fetchLibraryCards() : local.fetchLibraryCards()
}

export const createLibraryCard = (input: LibraryCardInput): Promise<LibraryCard> | LibraryCard => {
  return useApi() ? api.createLibraryCard(input) : local.createLibraryCard(input)
}

export const updateLibraryCard = (id: string, patch: LibraryCardPatch): Promise<LibraryCard> | LibraryCard | undefined => {
  return useApi() ? api.updateLibraryCard(id, patch) : local.updateLibraryCard(id, patch)
}

export const deleteLibraryCard = (id: string): Promise<void> | void => {
  return useApi() ? api.deleteLibraryCard(id) : local.deleteLibraryCard(id)
}

export const fetchChordProgression = (): Promise<ChordProgression> | ChordProgression => {
  return useApi() ? api.fetchChordProgression() : local.fetchChordProgression()
}

export const saveChordProgression = (progression: ChordProgression): void => {
  if (useApi()) api.saveChordProgression(progression)
  else local.saveChordProgression(progression)
}

// Sends debounced API saves now. Call before reading back what was just saved.
export const flushPendingSaves = (): Promise<void> => api.flushPendingSaves()
