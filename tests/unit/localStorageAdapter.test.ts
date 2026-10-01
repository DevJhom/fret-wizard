import { describe, it, expect, beforeEach } from 'vitest'
import { Setup } from '@data/constants'
import { defaultDataFor } from '@/lib/fretboardData'
import { createLibraryCard, deleteLibraryCard, fetchLibraryCards, updateLibraryCard } from '@services/adapters/localStorageAdapter'

describe('local library cards', () => {
  beforeEach(() => localStorage.clear())

  it('creates a card with an id and a timestamp and stores it', () => {
    const fretboards = [defaultDataFor(Setup.Chord)]
    const card = createLibraryCard({ name: 'Card 1', setup: Setup.Chord, fretboards })

    expect(card).toMatchObject({ name: 'Card 1', setup: Setup.Chord, fretboards })
    expect(card.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(typeof card.createdAt).toBe('number')
    expect(card.fretboards[0]).not.toBe(fretboards[0])
    expect(fetchLibraryCards()).toEqual([card])
  })

  it('renames a card and replaces its stack', () => {
    const card = createLibraryCard({ name: 'Card 1', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)] })
    const stack = [{ ...defaultDataFor(Setup.Scale), currentKey: 'G' }]

    expect(updateLibraryCard(card.id, { name: 'Shapes' })?.name).toBe('Shapes')
    expect(updateLibraryCard(card.id, { fretboards: stack })?.fretboards).toEqual(stack)
    expect(fetchLibraryCards()).toEqual([{ ...card, name: 'Shapes', fretboards: stack }])
  })

  it('returns undefined when updating a card that does not exist', () => {
    createLibraryCard({ name: 'Card 1', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)] })
    const before = localStorage.getItem('libraryCards')

    expect(updateLibraryCard('missing', { name: 'x' })).toBeUndefined()
    expect(localStorage.getItem('libraryCards')).toBe(before)
  })

  it('deletes a card', () => {
    const keep = createLibraryCard({ name: 'Keep', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)] })
    const drop = createLibraryCard({ name: 'Drop', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)] })

    deleteLibraryCard(drop.id)
    expect(fetchLibraryCards()).toEqual([keep])
  })
})
