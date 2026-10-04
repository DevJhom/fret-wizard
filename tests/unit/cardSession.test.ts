import { beforeEach, describe, expect, it } from 'vitest'
import { Setup } from '@data/constants'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'
import { cardWithUnsavedDraft, clearWorkspaceCardId, getWorkspaceCardId, resolveCardRoute, sameStack, setWorkspaceCardId } from '@/lib/cardSession'

const board = (key: string): FretboardData => ({ ...defaultDataFor(Setup.Scale), currentKey: key })
const card = (id: string, setup: Setup, fretboards: FretboardData[]): LibraryCard => ({ id, name: `Card ${id}`, setup, fretboards, createdAt: 0 })

const scaleCard = card('s1', Setup.Scale, [board('A')])
const otherScaleCard = card('s2', Setup.Scale, [board('E')])
const chordCard = card('c1', Setup.Chord, [defaultDataFor(Setup.Chord)])
const cards = [scaleCard, otherScaleCard, chordCard]

describe('workspace card id', () => {
  beforeEach(() => localStorage.clear())

  it('is remembered per page', () => {
    setWorkspaceCardId(Setup.Scale, 's1')
    expect(getWorkspaceCardId(Setup.Scale)).toBe('s1')
    expect(getWorkspaceCardId(Setup.Chord)).toBeNull()
    clearWorkspaceCardId(Setup.Scale)
    expect(getWorkspaceCardId(Setup.Scale)).toBeNull()
  })
})

describe('sameStack', () => {
  it('ignores key order and undefined fields', () => {
    const a = board('A')
    const reordered = JSON.parse(JSON.stringify({ chordView: undefined, ...a })) as FretboardData
    expect(sameStack([a], [{ ...reordered }])).toBe(true)
    expect(sameStack([{ ...a, chordView: undefined }], [a])).toBe(true)
  })

  it('sees real changes', () => {
    expect(sameStack([board('A')], [board('E')])).toBe(false)
    expect(sameStack([board('A')], [board('A'), board('A')])).toBe(false)
  })
})

describe('resolveCardRoute', () => {
  it('keeps the draft when the page already holds that card', () => {
    expect(resolveCardRoute('s1', Setup.Scale, cards, 's1')).toBe('keep')
  })

  it('loads the card when the page holds something else', () => {
    expect(resolveCardRoute('s1', Setup.Scale, cards, null)).toBe('load')
    expect(resolveCardRoute('s1', Setup.Scale, cards, 's2')).toBe('load')
  })

  it('drops ids for missing cards or the other page type', () => {
    expect(resolveCardRoute('gone', Setup.Scale, cards, 'gone')).toBe('detach')
    expect(resolveCardRoute('c1', Setup.Scale, cards, null)).toBe('detach')
  })
})

describe('cardWithUnsavedDraft', () => {
  it('names the card whose edits would be lost', () => {
    expect(cardWithUnsavedDraft('s1', 's2', [board('G')], cards)).toBe(scaleCard)
  })

  it('is quiet when nothing would be lost', () => {
    expect(cardWithUnsavedDraft('s1', 's2', [board('A')], cards)).toBeUndefined() // draft matches saved card
    expect(cardWithUnsavedDraft(null, 's2', [board('G')], cards)).toBeUndefined() // no card open
    expect(cardWithUnsavedDraft('s1', 's1', [board('G')], cards)).toBeUndefined() // reopening the same card
    expect(cardWithUnsavedDraft('gone', 's2', [board('G')], cards)).toBeUndefined() // card was deleted
  })
})
