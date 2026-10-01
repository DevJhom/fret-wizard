import { Setup, Theme, Tonality } from '@data/constants'
import { FretboardData, defaultDataFor } from '@/lib/fretboardData'

export interface LibraryCard {
  id: string
  name: string
  setup: Setup
  fretboards: FretboardData[]
  createdAt: number
}

export interface ProgressionChord {
  id: string
  degree: number
}

export interface ChordProgression {
  key: string
  tonality: Tonality
  progression: ProgressionChord[]
}

export const defaultChordProgression: ChordProgression = {
  key: 'C',
  tonality: Tonality.MAJOR,
  progression: [],
}

interface LegacyLibraryCard {
  id: string
  name: string
  data: FretboardData
  createdAt: number
}

const themeStorageKey = 'theme'
const legacyFretboardStorageKey = 'currentFretboard'
const legacyFretboardListStorageKey = 'fretboardList'
const libraryCardsStorageKey = 'libraryCards'
export const chordProgressionStorageKey = 'chordProgression'

const fretboardStorageKeys: Record<Setup, string> = {
  [Setup.Scale]: 'scaleCurrentFretboard',
  [Setup.Chord]: 'chordCurrentFretboard',
}

const fretboardListStorageKeys: Record<Setup, string> = {
  [Setup.Scale]: 'scaleFretboardList',
  [Setup.Chord]: 'chordFretboardList',
}

// Everything that syncs to an account; cleared after a successful import.
export const syncedStorageKeys: string[] = [
  libraryCardsStorageKey,
  chordProgressionStorageKey,
  ...Object.values(fretboardStorageKeys),
  ...Object.values(fretboardListStorageKeys),
]

const migrateLegacyFretboards = (): void => {
  const legacyFretboard = localStorage.getItem(legacyFretboardStorageKey)
  const legacyFretboardList = localStorage.getItem(legacyFretboardListStorageKey)
  if (legacyFretboard === null && legacyFretboardList === null) return

  const hasNewKeys = [...Object.values(fretboardStorageKeys), ...Object.values(fretboardListStorageKeys)]
    .some(key => localStorage.getItem(key) !== null)

  if (!hasNewKeys) {
    if (legacyFretboard) {
      const fretboard = JSON.parse(legacyFretboard) as FretboardData
      localStorage.setItem(fretboardStorageKeys[fretboard.currentSetup ?? Setup.Scale], legacyFretboard)
    }
    if (legacyFretboardList) {
      const fretboards = JSON.parse(legacyFretboardList) as FretboardData[]
      for (const setup of [Setup.Scale, Setup.Chord]) {
        const matching = fretboards.filter(f => (f.currentSetup ?? Setup.Scale) === setup)
        if (matching.length) {
          localStorage.setItem(fretboardListStorageKeys[setup], JSON.stringify(matching))
          localStorage.setItem(fretboardStorageKeys[setup], JSON.stringify(matching[0]))
        }
      }
    }
  }

  localStorage.removeItem(legacyFretboardStorageKey)
  localStorage.removeItem(legacyFretboardListStorageKey)
}

export const fetchCurrentTheme = (): Theme | null => {
  return localStorage.getItem(themeStorageKey) as Theme
}

export const saveCurrentTheme = (theme: Theme): void => {
  localStorage.setItem(themeStorageKey, theme)
}

export const fetchCurrentFretboard = (setup: Setup): FretboardData | undefined => {
  try {
    migrateLegacyFretboards()
    const fretboard = localStorage.getItem(fretboardStorageKeys[setup])
    return fretboard ? JSON.parse(fretboard) as FretboardData : defaultDataFor(setup)
  } catch (error) {
    console.log('fetchCurrentFretboard: ', error)
  }
}

export const saveCurrentFretboard = (setup: Setup, fretboard: FretboardData): void => {
  try {
    localStorage.setItem(fretboardStorageKeys[setup], JSON.stringify(fretboard))
  } catch (error) {
    console.log('saveCurrentFretboard: ', error)
  }
}

export const fetchFretboards = (setup: Setup): FretboardData[] | undefined => {
  try {
    migrateLegacyFretboards()
    const fretboardList = localStorage.getItem(fretboardListStorageKeys[setup])
    return fretboardList ? JSON.parse(fretboardList) as FretboardData[] : undefined
  } catch (error) {
    console.log('fetchFretboards: ', error)
  }
}

export const saveFretboards = (setup: Setup, fretboards: FretboardData[]): void => {
  try {
    localStorage.setItem(fretboardListStorageKeys[setup], JSON.stringify(fretboards))
  } catch (error) {
    console.log('saveFretboards: ', error)
  }
}

const normalizeLibraryCard = (card: LibraryCard | LegacyLibraryCard): LibraryCard => {
  if ('fretboards' in card) return card
  const { data, ...rest } = card
  return { ...rest, setup: data.currentSetup ?? Setup.Scale, fretboards: [data] }
}

export const fetchLibraryCards = (): LibraryCard[] | undefined => {
  try {
    const cards = localStorage.getItem(libraryCardsStorageKey)
    return cards ? (JSON.parse(cards) as (LibraryCard | LegacyLibraryCard)[]).map(normalizeLibraryCard) : undefined
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

export const fetchChordProgression = (): ChordProgression => {
  try {
    const progression = localStorage.getItem(chordProgressionStorageKey)
    return progression ? JSON.parse(progression) as ChordProgression : structuredClone(defaultChordProgression)
  } catch (error) {
    console.log('fetchChordProgression: ', error)
    return structuredClone(defaultChordProgression)
  }
}

export const saveChordProgression = (progression: ChordProgression): void => {
  try {
    localStorage.setItem(chordProgressionStorageKey, JSON.stringify(progression))
  } catch (error) {
    console.log('saveChordProgression: ', error)
  }
}
