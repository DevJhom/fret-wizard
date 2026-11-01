import { beforeEach, describe, expect, it } from 'vitest'
import { Setup } from '@data/constants'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'
import { cardStatus, cardWithUnsavedDraft, clearWorkspaceCardId, detachNotice, getWorkspaceCardId, pageTitle, renamedTo, resolveCardRoute, sameStack, saveLabel, setWorkspaceCardId } from '@/lib/cardSession'

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

  it('treats two spellings of one key as the same key', () => {
    expect(sameStack([board('C♯')], [board('D♭')])).toBe(true)
    expect(sameStack([board('C♯')], [board('D')])).toBe(false)
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

describe('cardStatus', () => {
  it('is a draft with no card, whatever the stack', () => {
    expect(cardStatus(false, false)).toBe('draft')
    expect(cardStatus(false, true)).toBe('draft')
  })

  it('follows isDirty when a card is open', () => {
    expect(cardStatus(true, false)).toBe('saved')
    expect(cardStatus(true, true)).toBe('unsaved')
  })
})

describe('saveLabel', () => {
  it('names what Save will do', () => {
    expect(saveLabel('draft')).toBe('Save to Library')
    expect(saveLabel('saved')).toBe('Saved')
    expect(saveLabel('unsaved')).toBe('Save changes')
  })
})

describe('renamedTo', () => {
  it('trims the new name', () => {
    expect(renamedTo('  Blues  ', 'Card 5')).toBe('Blues')
  })

  it('ignores an empty or blank name', () => {
    expect(renamedTo('', 'Card 5')).toBeNull()
    expect(renamedTo('   ', 'Card 5')).toBeNull()
  })

  it('ignores an unchanged name', () => {
    expect(renamedTo(' Card 5 ', 'Card 5')).toBeNull()
  })
})

describe('detachNotice', () => {
  it('flags a card the Library no longer has, including the remembered workspace card', () => {
    expect(detachNotice(resolveCardRoute('gone', Setup.Scale, cards, 'gone'))).toBe(true)
    expect(detachNotice(resolveCardRoute('c1', Setup.Scale, cards, null))).toBe(true)
    expect(detachNotice(resolveCardRoute('s1', Setup.Scale, cards, 's1'))).toBe(false)
    expect(detachNotice(resolveCardRoute('s2', Setup.Scale, cards, 's1'))).toBe(false)
  })
})

describe('pageTitle', () => {
  it('names the page, and the card when one is open', () => {
    expect(pageTitle('Scale', undefined, 'draft')).toBe('Scale · FretWizard')
    expect(pageTitle('Scale', 'Blues', 'saved')).toBe('Blues · Scale · FretWizard')
    expect(pageTitle('Chord', 'Blues', 'unsaved')).toBe('• Blues · Chord · FretWizard')
  })
})
