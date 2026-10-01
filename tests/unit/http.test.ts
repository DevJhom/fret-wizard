import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiError, apiRequest } from '@services/http'
import { clearTokens, getRefreshToken, onSessionExpired, setTokens } from '@services/session'
import { API, enableAccounts, jsonResponse, requestBody, routeFetch } from './support'

const unauthorized = { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired access token' } }
const user = { id: 'user-1', email: 'jo@example.com', username: 'Jo' }

const authorization = (init: RequestInit | undefined): string | undefined =>
  (init?.headers as Record<string, string> | undefined)?.Authorization

describe('apiRequest', () => {
  beforeEach(() => {
    enableAccounts()
    localStorage.clear()
    clearTokens()
    onSessionExpired(() => {})
  })

  it('sends JSON with the bearer token', async () => {
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })
    const fetchMock = routeFetch({ 'PATCH /me': () => jsonResponse(200, user) })

    await expect(apiRequest('PATCH', '/me', { username: 'Jo' })).resolves.toEqual(user)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${API}/me`)
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer access-1' })
    expect(requestBody(init)).toEqual({ username: 'Jo' })
  })

  it('sends no body headers without a body and no Authorization without a token', async () => {
    const fetchMock = routeFetch({ 'GET /health': () => jsonResponse(200, { ok: true }) })
    await apiRequest('GET', '/health')
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({})
    expect(fetchMock.mock.calls[0][1]?.body).toBeUndefined()
  })

  it('removes trailing slashes from VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', `${API}//`)
    const fetchMock = routeFetch({ 'GET /health': () => jsonResponse(200, { ok: true }) })
    await apiRequest('GET', '/health')
    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/health`)
  })

  it('returns undefined for 204 responses', async () => {
    routeFetch({ 'DELETE /library-cards/card-1': () => jsonResponse(204) })
    await expect(apiRequest('DELETE', '/library-cards/card-1')).resolves.toBeUndefined()
  })

  it('turns error bodies into ApiError', async () => {
    const details = [{ path: 'email', message: 'Enter a valid email address' }]
    routeFetch({
      'POST /auth/signup': () => jsonResponse(400, { error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details } }),
    })
    const error = await apiRequest('POST', '/auth/signup', {}).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, code: 'VALIDATION_ERROR', message: 'Invalid request', details })
  })

  it('falls back to INTERNAL when the error body is not JSON', async () => {
    routeFetch({ 'GET /me': () => new Response('Bad gateway', { status: 502 }) })
    await expect(apiRequest('GET', '/me')).rejects.toMatchObject({ status: 502, code: 'INTERNAL', details: [] })
  })

  it('refreshes once and retries after a 401', async () => {
    setTokens({ accessToken: 'expired', refreshToken: 'refresh-1' })
    const fetchMock = routeFetch({
      'GET /library-cards': (init) => authorization(init) === 'Bearer fresh' ? jsonResponse(200, []) : jsonResponse(401, unauthorized),
      'POST /auth/refresh': () => jsonResponse(200, { accessToken: 'fresh', refreshToken: 'refresh-2' }),
    })

    await expect(apiRequest('GET', '/library-cards')).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('expires the session when the refresh token is rejected', async () => {
    setTokens({ accessToken: 'expired', refreshToken: 'refresh-1' })
    const expired = vi.fn()
    onSessionExpired(expired)
    routeFetch({
      'GET /me': () => jsonResponse(401, unauthorized),
      'POST /auth/refresh': () => jsonResponse(401, unauthorized),
    })

    await expect(apiRequest('GET', '/me')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
    expect(expired).toHaveBeenCalledOnce()
    expect(getRefreshToken()).toBeNull()
  })

  it('keeps the session when the refresh endpoint is unreachable', async () => {
    setTokens({ accessToken: 'expired', refreshToken: 'refresh-1' })
    const expired = vi.fn()
    onSessionExpired(expired)
    routeFetch({
      'GET /me': () => jsonResponse(401, unauthorized),
      'POST /auth/refresh': () => jsonResponse(503, { error: { code: 'INTERNAL', message: 'Something went wrong' } }),
    })

    await expect(apiRequest('GET', '/me')).rejects.toMatchObject({ status: 401 })
    expect(expired).not.toHaveBeenCalled()
    expect(getRefreshToken()).toBe('refresh-1')
  })

  it('never refreshes for /auth/ endpoints', async () => {
    const fetchMock = routeFetch({
      'POST /auth/login': () => jsonResponse(401, { error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } }),
    })
    await expect(apiRequest('POST', '/auth/login', {})).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
