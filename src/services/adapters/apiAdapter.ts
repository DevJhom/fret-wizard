import { Theme } from '@data/constants'
import { FretboardData, defaultData } from '@/stores/usePatternStore'

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

export const fetchCurrentFretboard = async (): Promise<FretboardData | undefined> => {
  try {
    const res = await fetch(`${BASE_URL}/fretboard`)
    if (!res.ok) return defaultData
    return await res.json() as FretboardData
  } catch (error) {
    console.log('fetchCurrentFretboard: ', error)
    return defaultData
  }
}

export const saveCurrentFretboard = async (fretboard: FretboardData): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/fretboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fretboard),
    })
  } catch (error) {
    console.log('saveCurrentFretboard: ', error)
  }
}

export const fetchFretboards = async (): Promise<FretboardData[] | undefined> => {
  try {
    const res = await fetch(`${BASE_URL}/fretboards`)
    if (!res.ok) return undefined
    return await res.json() as FretboardData[]
  } catch (error) {
    console.log('fetchFretboards: ', error)
  }
}

export const saveFretboards = async (fretboards: FretboardData[]): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/fretboards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fretboards),
    })
  } catch (error) {
    console.log('saveFretboards: ', error)
  }
}
