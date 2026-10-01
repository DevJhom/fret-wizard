import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { Setup } from '@data/constants'
import { defaultDataFor } from '@/lib/fretboardData'
import { useAuthStore } from '@stores/useAuthStore'
import { useLibraryStore } from '@stores/useLibraryStore'
import { clearTokens } from '@services/session'
import { enableAccounts, jsonResponse, routeFetch } from './support'

const storedCards = () => JSON.parse(localStorage.getItem('libraryCards') ?? 'null')

describe('library store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    clearTokens()
    enableAccounts()
  })

  it('creates, renames, restacks and deletes cards in localStorage for guests', async () => {
    useAuthStore().status = 'guest'
    const library = useLibraryStore()

    const card = await library.createCard('Card 1', Setup.Scale)
    expect(library.cards).toHaveLength(1)

    await library.renameCard(card!.id, 'Shapes')
    await library.updateCardFretboards(card!.id, [{ ...defaultDataFor(Setup.Scale), currentKey: 'G' }])
    expect(library.cards[0]).toMatchObject({ name: 'Shapes', fretboards: [{ currentKey: 'G' }] })
    expect(storedCards()[0]).toMatchObject({ name: 'Shapes', fretboards: [{ currentKey: 'G' }] })

    await library.deleteCard(card!.id)
    expect(library.cards).toEqual([])
    expect(storedCards()).toEqual([])
  })

  it('keeps the card the API returns when signed in', async () => {
    useAuthStore().status = 'authenticated'
    const serverCard = { id: 'server-id', name: 'Card 1', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)], createdAt: 5 }
    routeFetch({
      'GET /library-cards': () => jsonResponse(200, []),
      'POST /library-cards': () => jsonResponse(201, serverCard),
    })
    const library = useLibraryStore()

    await expect(library.createCard('Card 1', Setup.Scale)).resolves.toEqual(serverCard)
    expect(library.cards).toEqual([serverCard])
    expect(localStorage.getItem('libraryCards')).toBeNull()
  })

  it('returns undefined and changes nothing when the API rejects a new card', async () => {
    useAuthStore().status = 'authenticated'
    routeFetch({
      'GET /library-cards': () => jsonResponse(200, []),
      'POST /library-cards': () => jsonResponse(409, { error: { code: 'LIMIT_EXCEEDED', message: 'A library can hold at most 200 cards' } }),
    })
    const library = useLibraryStore()

    await expect(library.createCard('Card 1', Setup.Scale)).resolves.toBeUndefined()
    expect(library.cards).toEqual([])
  })

  it('reset forgets the cards and the active card, and the next load reads again', async () => {
    useAuthStore().status = 'guest'
    const library = useLibraryStore()
    const card = await library.createCard('Card 1', Setup.Scale)
    library.activeCardId = card!.id

    library.reset()
    expect(library.cards).toEqual([])
    expect(library.activeCardId).toBeNull()
    expect(library.isLoaded).toBe(false)

    await library.ensureLoaded()
    expect(library.cards).toHaveLength(1)
  })
})
