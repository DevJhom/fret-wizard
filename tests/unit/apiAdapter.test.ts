import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Setup } from '@data/constants'
import { defaultDataFor } from '@/lib/fretboardData'
import { defaultChordProgression } from '@services/adapters/localStorageAdapter'
import { enableAccounts, jsonResponse, requestBody, routeFetch } from './support'

const notFound = { error: { code: 'NOT_FOUND', message: 'Workspace not saved yet' } }
const serverError = { error: { code: 'INTERNAL', message: 'Something went wrong' } }

// A fresh module per test: the adapter keeps pending saves and failed loads in module state.
const loadAdapter = async () => {
  vi.resetModules()
  return import('@services/adapters/apiAdapter')
}

const putCount = (fetchMock: ReturnType<typeof routeFetch>): number =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT').length

describe('API adapter', () => {
  beforeEach(() => {
    enableAccounts()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reads a saved workspace and never stores the current fretboard separately', async () => {
    const api = await loadAdapter()
    const stack = [defaultDataFor(Setup.Scale)]
    const fetchMock = routeFetch({ 'GET /workspaces/scale': () => jsonResponse(200, { fretboards: stack }) })

    await expect(api.fetchFretboards(Setup.Scale)).resolves.toEqual(stack)
    expect(api.fetchCurrentFretboard(Setup.Chord)).toEqual(defaultDataFor(Setup.Chord))
    api.saveCurrentFretboard(Setup.Scale, stack[0])
    await api.flushPendingSaves()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('treats a never-saved workspace as empty and saves the first stack', async () => {
    const api = await loadAdapter()
    const stack = [defaultDataFor(Setup.Scale)]
    const fetchMock = routeFetch({
      'GET /workspaces/scale': () => jsonResponse(404, notFound),
      'PUT /workspaces/scale': () => jsonResponse(204),
    })

    await expect(api.fetchFretboards(Setup.Scale)).resolves.toBeUndefined()
    api.saveFretboards(Setup.Scale, stack)
    await api.flushPendingSaves()
    expect(putCount(fetchMock)).toBe(1)
    expect(requestBody(fetchMock.mock.calls[1][1])).toEqual({ fretboards: stack })
  })

  it('coalesces rapid workspace saves into one request with the latest stack', async () => {
    const api = await loadAdapter()
    const fetchMock = routeFetch({ 'PUT /workspaces/chord': () => jsonResponse(204) })
    const latest = [defaultDataFor(Setup.Chord), { ...defaultDataFor(Setup.Chord), currentKey: 'E' }]

    api.saveFretboards(Setup.Chord, [defaultDataFor(Setup.Chord)])
    api.saveFretboards(Setup.Chord, latest)
    expect(fetchMock).not.toHaveBeenCalled()

    await api.flushPendingSaves()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(requestBody(fetchMock.mock.calls[0][1])).toEqual({ fretboards: latest })
  })

  it('saves on its own 800 ms after the last change', async () => {
    vi.useFakeTimers()
    const api = await loadAdapter()
    const fetchMock = routeFetch({ 'PUT /workspaces/scale': () => jsonResponse(204) })

    api.saveFretboards(Setup.Scale, [defaultDataFor(Setup.Scale)])
    await vi.advanceTimersByTimeAsync(api.SAVE_DELAY_MS - 1)
    expect(fetchMock).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('stops saving a workspace whose load failed, so defaults cannot overwrite the account', async () => {
    const api = await loadAdapter()
    let respond: () => Response = () => jsonResponse(500, serverError)
    const fetchMock = routeFetch({
      'GET /workspaces/scale': () => respond(),
      'PUT /workspaces/scale': () => jsonResponse(204),
    })
    const saveAndFlush = async () => {
      api.saveFretboards(Setup.Scale, [defaultDataFor(Setup.Scale)])
      await api.flushPendingSaves()
    }

    await expect(api.fetchFretboards(Setup.Scale)).resolves.toBeUndefined()
    await saveAndFlush()
    expect(putCount(fetchMock)).toBe(0)

    respond = () => {
      throw new TypeError('Failed to fetch')
    }
    await expect(api.fetchFretboards(Setup.Scale)).resolves.toBeUndefined()
    await saveAndFlush()
    expect(putCount(fetchMock)).toBe(0)

    respond = () => jsonResponse(200, { fretboards: [defaultDataFor(Setup.Scale)] })
    await api.fetchFretboards(Setup.Scale)
    await saveAndFlush()
    expect(putCount(fetchMock)).toBe(1)
  })

  it('falls back to the default progression and guards its saves the same way', async () => {
    const api = await loadAdapter()
    let status = 404
    const fetchMock = routeFetch({
      'GET /chord-progression': () => jsonResponse(status, status === 404 ? notFound : serverError),
      'PUT /chord-progression': () => jsonResponse(204),
    })

    await expect(api.fetchChordProgression()).resolves.toEqual(defaultChordProgression)
    api.saveChordProgression(defaultChordProgression)
    await api.flushPendingSaves()
    expect(putCount(fetchMock)).toBe(1)

    status = 500
    await expect(api.fetchChordProgression()).resolves.toEqual(defaultChordProgression)
    api.saveChordProgression(defaultChordProgression)
    await api.flushPendingSaves()
    expect(putCount(fetchMock)).toBe(1)
  })

  it('sends one request per library card change', async () => {
    const api = await loadAdapter()
    const card = { id: 'card-1', name: 'Card 1', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)], createdAt: 1 }
    const fetchMock = routeFetch({
      'GET /library-cards': () => jsonResponse(200, [card]),
      'POST /library-cards': () => jsonResponse(201, card),
      'PATCH /library-cards/card-1': () => jsonResponse(200, { ...card, name: 'Renamed' }),
      'DELETE /library-cards/card-1': () => jsonResponse(204),
    })

    await expect(api.fetchLibraryCards()).resolves.toEqual([card])
    await expect(api.createLibraryCard({ name: 'Card 1', setup: Setup.Scale, fretboards: card.fretboards })).resolves.toEqual(card)
    expect(requestBody(fetchMock.mock.calls[1][1])).toEqual({ name: 'Card 1', setup: Setup.Scale, fretboards: card.fretboards })
    await expect(api.updateLibraryCard('card-1', { name: 'Renamed' })).resolves.toMatchObject({ name: 'Renamed' })
    expect(requestBody(fetchMock.mock.calls[2][1])).toEqual({ name: 'Renamed' })
    await api.deleteLibraryCard('card-1')
    expect(fetchMock.mock.calls[3][1]?.method).toBe('DELETE')
  })
})
