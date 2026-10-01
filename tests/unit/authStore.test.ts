import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { Setup } from '@data/constants'
import { defaultDataFor } from '@/lib/fretboardData'
import { useAuthStore } from '@stores/useAuthStore'
import { ApiError } from '@services/http'
import { clearTokens, expireSession, getAccessToken, getRefreshToken } from '@services/session'
import { enableAccounts, jsonResponse, requestBody, routeFetch } from './support'

const user = { id: 'user-1', email: 'jo@example.com', username: 'Jo' }
const authResponse = { accessToken: 'access-1', refreshToken: 'refresh-1', user }
const credentials = { email: 'jo@example.com', password: 'correct-horse-battery' }
const unauthorized = { error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } }
const importResult = { importedCards: 1, appliedWorkspaces: [], appliedChordProgression: false }

const saveGuestCard = () => {
  localStorage.setItem('libraryCards', JSON.stringify([
    { id: 'card-1', name: 'Card 1', setup: Setup.Scale, fretboards: [defaultDataFor(Setup.Scale)], createdAt: 1 },
  ]))
}

const guestStore = () => {
  const auth = useAuthStore()
  auth.status = 'guest'
  return auth
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    clearTokens()
    enableAccounts()
  })

  it('starts as a guest when accounts are disabled', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    localStorage.setItem('refreshToken', 'refresh-1')
    const fetchMock = routeFetch({})
    const auth = useAuthStore()

    await auth.restoreSession()
    expect(auth.status).toBe('guest')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('starts as a guest without a refresh token', async () => {
    const fetchMock = routeFetch({})
    const auth = useAuthStore()

    await auth.restoreSession()
    expect(auth.status).toBe('guest')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('restores a saved session', async () => {
    localStorage.setItem('refreshToken', 'refresh-1')
    routeFetch({
      'POST /auth/refresh': () => jsonResponse(200, { accessToken: 'access-2', refreshToken: 'refresh-2' }),
      'GET /me': () => jsonResponse(200, user),
    })
    const auth = useAuthStore()

    await auth.restoreSession()
    expect(auth.status).toBe('authenticated')
    expect(auth.user).toEqual(user)
    expect(auth.sessionVersion).toBe(1)
    expect(getAccessToken()).toBe('access-2')
  })

  it('forgets a rejected refresh token', async () => {
    localStorage.setItem('refreshToken', 'refresh-1')
    routeFetch({ 'POST /auth/refresh': () => jsonResponse(401, unauthorized) })
    const auth = useAuthStore()

    await auth.restoreSession()
    expect(auth.status).toBe('guest')
    expect(getRefreshToken()).toBeNull()
  })

  it('keeps the refresh token when the API is unreachable', async () => {
    localStorage.setItem('refreshToken', 'refresh-1')
    routeFetch({ 'POST /auth/refresh': () => jsonResponse(503, { error: { code: 'INTERNAL', message: 'Something went wrong' } }) })
    const auth = useAuthStore()

    await auth.restoreSession()
    expect(auth.status).toBe('guest')
    expect(getRefreshToken()).toBe('refresh-1')
  })

  it('imports guest data before switching to the account', async () => {
    saveGuestCard()
    const auth = guestStore()
    let statusDuringImport = ''
    const fetchMock = routeFetch({
      'POST /auth/login': () => jsonResponse(200, authResponse),
      'POST /me/import': () => {
        statusDuringImport = auth.status
        return jsonResponse(200, importResult)
      },
    })

    await auth.login(credentials)
    expect(statusDuringImport).toBe('guest')
    expect(requestBody(fetchMock.mock.calls[1][1])).toMatchObject({ libraryCards: [{ name: 'Card 1', setup: Setup.Scale }] })
    expect(localStorage.getItem('libraryCards')).toBeNull()
    expect(auth.status).toBe('authenticated')
    expect(auth.user).toEqual(user)
    expect(auth.importFailed).toBe(false)
    expect(auth.sessionVersion).toBe(1)
  })

  it('keeps local data and flags the failure when the import fails', async () => {
    saveGuestCard()
    routeFetch({
      'POST /auth/login': () => jsonResponse(200, authResponse),
      'POST /me/import': () => jsonResponse(500, { error: { code: 'INTERNAL', message: 'Something went wrong' } }),
    })
    const auth = guestStore()

    await auth.login(credentials)
    expect(auth.status).toBe('authenticated')
    expect(auth.importFailed).toBe(true)
    expect(localStorage.getItem('libraryCards')).not.toBeNull()
  })

  it('skips the import when the browser has nothing saved', async () => {
    const fetchMock = routeFetch({ 'POST /auth/login': () => jsonResponse(200, authResponse) })
    const auth = guestStore()

    await auth.login(credentials)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(auth.status).toBe('authenticated')
  })

  it('stays a guest when login fails', async () => {
    routeFetch({ 'POST /auth/login': () => jsonResponse(401, unauthorized) })
    const auth = guestStore()

    const error = await auth.login(credentials).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(auth.status).toBe('guest')
    expect(auth.user).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('signs up and signs in with Google through the same flow', async () => {
    const fetchMock = routeFetch({
      'POST /auth/signup': () => jsonResponse(201, authResponse),
      'POST /auth/google': () => jsonResponse(200, { ...authResponse, isNewUser: true }),
      'POST /auth/logout': () => jsonResponse(204),
    })
    const auth = guestStore()

    await auth.signup({ username: 'Jo', ...credentials })
    expect(auth.status).toBe('authenticated')
    expect(requestBody(fetchMock.mock.calls[0][1])).toEqual({ username: 'Jo', ...credentials })

    await auth.logout()
    await auth.loginWithGoogle('google-credential')
    expect(auth.status).toBe('authenticated')
    expect(requestBody(fetchMock.mock.calls[2][1])).toEqual({ idToken: 'google-credential' })
  })

  it('logs out', async () => {
    const fetchMock = routeFetch({
      'POST /auth/login': () => jsonResponse(200, authResponse),
      'POST /auth/logout': () => jsonResponse(204),
    })
    const auth = guestStore()
    await auth.login(credentials)

    await auth.logout()
    expect(requestBody(fetchMock.mock.calls[1][1])).toEqual({ refreshToken: 'refresh-1' })
    expect(auth.status).toBe('guest')
    expect(auth.user).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(auth.sessionVersion).toBe(2)
  })

  it('becomes a guest when the session expires', async () => {
    routeFetch({ 'POST /auth/login': () => jsonResponse(200, authResponse) })
    const auth = guestStore()
    auth.startSessionListeners()
    await auth.login(credentials)

    expireSession()
    expect(auth.status).toBe('guest')
    expect(auth.user).toBeNull()
  })

  it('becomes a guest when another tab logs out', async () => {
    routeFetch({ 'POST /auth/login': () => jsonResponse(200, authResponse) })
    const auth = guestStore()
    auth.startSessionListeners()
    await auth.login(credentials)

    window.dispatchEvent(new StorageEvent('storage', { key: 'refreshToken', newValue: null }))
    expect(auth.status).toBe('guest')
  })
})
