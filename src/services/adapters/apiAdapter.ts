import { Setup, Theme } from '@data/constants'
import { FretboardData, defaultDataFor } from '@/stores/usePatternStore'
import { defaultChordProgression } from '@services/adapters/localStorageAdapter'
import type { LibraryCard, ChordProgression } from '@services/adapters/localStorageAdapter'

const BASE_URL = 'http://localhost:3000'

export const fetchCurrentTheme = async (): Promise<Theme | null> => {
  try {
    const res = await fetch(`${BASE_URL}/theme`)
    if (!res.ok) return null
    const data = await res.json()
    return data.value as Theme
  } catch (error) {
    console.log('fetchCurrentTheme: ', error)
    return null
  }
}

export const saveCurrentTheme = async (theme: Theme): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: theme }),
    })
  } catch (error) {
    console.log('saveCurrentTheme: ', error)
  }
}

export const fetchCurrentFretboard = async (setup: Setup): Promise<FretboardData | undefined> => {
  try {
    const res = await fetch(`${BASE_URL}/fretboard/${setup}`)
    if (!res.ok) return defaultDataFor(setup)
    return await res.json() as FretboardData
  } catch (error) {
    console.log('fetchCurrentFretboard: ', error)
    return defaultDataFor(setup)
  }
}

export const saveCurrentFretboard = async (setup: Setup, fretboard: FretboardData): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/fretboard/${setup}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fretboard),
    })
  } catch (error) {
    console.log('saveCurrentFretboard: ', error)
  }
}

export const fetchFretboards = async (setup: Setup): Promise<FretboardData[] | undefined> => {
  try {
    const res = await fetch(`${BASE_URL}/fretboards/${setup}`)
    if (!res.ok) return undefined
    return await res.json() as FretboardData[]
  } catch (error) {
    console.log('fetchFretboards: ', error)
  }
}

export const saveFretboards = async (setup: Setup, fretboards: FretboardData[]): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/fretboards/${setup}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fretboards),
    })
  } catch (error) {
    console.log('saveFretboards: ', error)
  }
}

export const fetchLibraryCards = async (): Promise<LibraryCard[] | undefined> => {
  try {
    const res = await fetch(`${BASE_URL}/library-cards`)
    if (!res.ok) return undefined
    return await res.json() as LibraryCard[]
  } catch (error) {
    console.log('fetchLibraryCards: ', error)
  }
}

export const saveLibraryCards = async (cards: LibraryCard[]): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/library-cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cards),
    })
  } catch (error) {
    console.log('saveLibraryCards: ', error)
  }
}

export const fetchChordProgression = async (): Promise<ChordProgression> => {
  try {
    const res = await fetch(`${BASE_URL}/chord-progression`)
    if (!res.ok) return structuredClone(defaultChordProgression)
    return await res.json() as ChordProgression
  } catch (error) {
    console.log('fetchChordProgression: ', error)
    return structuredClone(defaultChordProgression)
  }
}

export const saveChordProgression = async (progression: ChordProgression): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/chord-progression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progression),
    })
  } catch (error) {
    console.log('saveChordProgression: ', error)
  }
}
