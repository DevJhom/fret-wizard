import _ from 'lodash'
import { Setup } from '@data/constants'
import { FretboardData, defaultDataFor } from '@/lib/fretboardData'
import { ApiError, apiRequest } from '@services/http'
import { defaultChordProgression } from '@services/adapters/localStorageAdapter'
import type { ChordProgression, LibraryCard, LibraryCardInput, LibraryCardPatch } from '@services/adapters/localStorageAdapter'

export const SAVE_DELAY_MS = 800

interface PendingSave {
  (save: () => Promise<void>): void
  flush: () => Promise<void> | undefined
}

const progressionKey = 'chordProgression'
const pendingSaves = new Map<string, PendingSave>()
// Anything whose last load failed for a reason other than "not saved yet". Saving it now
// would overwrite the account with the defaults the page fell back to, so saves are skipped
// until a load succeeds.
const failedLoads = new Set<string>()

const saveLater = (key: string, save: () => Promise<void>): void => {
  let pending = pendingSaves.get(key)
  if (!pending) {
    pending = _.debounce((run: () => Promise<void>) => run(), SAVE_DELAY_MS) as PendingSave
    pendingSaves.set(key, pending)
  }
  pending(save)
}

export const flushPendingSaves = async (): Promise<void> => {
  await Promise.all([...pendingSaves.values()].map(pending => pending.flush()))
}

const isNotFound = (error: unknown): boolean => error instanceof ApiError && error.status === 404

const load = async <T>(key: string, label: string, request: () => Promise<T>): Promise<T | undefined> => {
  try {
    const value = await request()
    failedLoads.delete(key)
    return value
  } catch (error) {
    if (isNotFound(error)) {
      failedLoads.delete(key)
    } else {
      failedLoads.add(key)
      console.log(`${label}: `, error)
    }
    return undefined
  }
}

const workspacePath = (setup: Setup): string => `/workspaces/${setup.toLowerCase()}`

// The selected fretboard is part of the stack; the API has no separate "current fretboard".
export const fetchCurrentFretboard = (setup: Setup): FretboardData => defaultDataFor(setup)

export const saveCurrentFretboard = (_setup: Setup, _fretboard: FretboardData): void => {}

export const fetchFretboards = async (setup: Setup): Promise<FretboardData[] | undefined> => {
  const workspace = await load(setup, 'fetchFretboards', () => apiRequest<{ fretboards: FretboardData[] }>('GET', workspacePath(setup)))
  return workspace?.fretboards
}

export const saveFretboards = (setup: Setup, fretboards: FretboardData[]): void => {
  if (failedLoads.has(setup)) return
  const snapshot = _.cloneDeep(fretboards)
  saveLater(setup, () => apiRequest<void>('PUT', workspacePath(setup), { fretboards: snapshot })
    .catch(error => console.log('saveFretboards: ', error)))
}

export const fetchLibraryCards = async (): Promise<LibraryCard[] | undefined> => {
  try {
    return await apiRequest<LibraryCard[]>('GET', '/library-cards')
  } catch (error) {
    console.log('fetchLibraryCards: ', error)
    return undefined
  }
}

export const createLibraryCard = (input: LibraryCardInput): Promise<LibraryCard> =>
  apiRequest<LibraryCard>('POST', '/library-cards', input)

export const updateLibraryCard = (id: string, patch: LibraryCardPatch): Promise<LibraryCard> =>
  apiRequest<LibraryCard>('PATCH', `/library-cards/${id}`, patch)

export const deleteLibraryCard = (id: string): Promise<void> =>
  apiRequest<void>('DELETE', `/library-cards/${id}`)

export const fetchChordProgression = async (): Promise<ChordProgression> => {
  const progression = await load(progressionKey, 'fetchChordProgression', () => apiRequest<ChordProgression>('GET', '/chord-progression'))
  return progression ?? structuredClone(defaultChordProgression)
}

export const saveChordProgression = (progression: ChordProgression): void => {
  if (failedLoads.has(progressionKey)) return
  const snapshot = _.cloneDeep(progression)
  saveLater(progressionKey, () => apiRequest<void>('PUT', '/chord-progression', snapshot)
    .catch(error => console.log('saveChordProgression: ', error)))
}
