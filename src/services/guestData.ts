import { Setup, Tonality } from '@data/constants'
import { progressionKeys } from '@data/progressions'
import { FretboardData, defaultDataFor } from '@/lib/fretboardData'
import * as local from '@services/adapters/localStorageAdapter'
import type { ChordProgression } from '@services/adapters/localStorageAdapter'
import type { ImportRequest } from '@services/apiTypes'

// Older saves can lack fields added since; fill them so the server accepts the import.
const withDefaults = (fretboard: Partial<FretboardData>, setup: Setup): FretboardData => ({
  ...defaultDataFor(setup),
  ...fretboard,
  currentSetup: setup,
})

const cardName = (name: string | undefined): string => (name ?? '').trim().slice(0, 100) || 'Untitled card'

const normalizeProgression = (saved: ChordProgression): ChordProgression => {
  const tonality = saved.tonality === Tonality.MINOR ? Tonality.MINOR : Tonality.MAJOR
  const keys = progressionKeys(tonality)
  return {
    key: keys.includes(saved.key) ? saved.key : keys[0],
    tonality,
    progression: saved.progression ?? [],
  }
}

export const collectGuestData = (): ImportRequest | null => {
  // Reading the stacks first also migrates the legacy currentFretboard/fretboardList keys.
  const scale = local.fetchFretboards(Setup.Scale)
  const chord = local.fetchFretboards(Setup.Chord)
  const cards = local.fetchLibraryCards()
  const hasProgression = localStorage.getItem(local.chordProgressionStorageKey) !== null
  if (!scale && !chord && !cards && !hasProgression) return null

  const data: ImportRequest = {}
  if (cards?.length) {
    data.libraryCards = cards.map(card => ({
      name: cardName(card.name),
      setup: card.setup,
      fretboards: card.fretboards.map(fretboard => withDefaults(fretboard, card.setup)),
    }))
  }
  if (scale?.length || chord?.length) {
    data.workspaces = {}
    if (scale?.length) data.workspaces.scale = { fretboards: scale.map(fretboard => withDefaults(fretboard, Setup.Scale)) }
    if (chord?.length) data.workspaces.chord = { fretboards: chord.map(fretboard => withDefaults(fretboard, Setup.Chord)) }
  }
  if (hasProgression) data.chordProgression = normalizeProgression(local.fetchChordProgression())
  return data
}

export const clearGuestData = (): void => {
  local.syncedStorageKeys.forEach(key => localStorage.removeItem(key))
}
