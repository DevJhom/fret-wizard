import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  clearTokens,
  expireSession,
  getAccessToken,
  getRefreshToken,
  onSessionExpired,
  refreshSession,
  refreshTokenStorageKey,
  setTokens,
} from '@services/session'
import { API, enableAccounts, jsonResponse, requestBody, routeFetch } from './support'

const rejected = { error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } }

describe('session', () => {
  beforeEach(() => {
    enableAccounts()
    localStorage.clear()
    clearTokens()
    onSessionExpired(() => {})
  })

  it('keeps the access token in memory and the refresh token in localStorage', () => {
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })
    expect(getAccessToken()).toBe('access-1')
    expect(localStorage.getItem(refreshTokenStorageKey)).toBe('refresh-1')

    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('refreshes with the stored refresh token and stores the new pair', async () => {
    setTokens({ accessToken: 'old', refreshToken: 'refresh-1' })
    const fetchMock = routeFetch({
      'POST /auth/refresh': () => jsonResponse(200, { accessToken: 'access-2', refreshToken: 'refresh-2' }),
    })

    await expect(refreshSession()).resolves.toBe('refreshed')
    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/auth/refresh`)
    expect(requestBody(fetchMock.mock.calls[0][1])).toEqual({ refreshToken: 'refresh-1' })
    expect(getAccessToken()).toBe('access-2')
    expect(getRefreshToken()).toBe('refresh-2')
  })

  it('shares one request between concurrent refreshes', async () => {
    setTokens({ accessToken: 'old', refreshToken: 'refresh-1' })
    const fetchMock = routeFetch({
      'POST /auth/refresh': () => jsonResponse(200, { accessToken: 'access-2', refreshToken: 'refresh-2' }),
    })

    const outcomes = await Promise.all([refreshSession(), refreshSession(), refreshSession()])
    expect(outcomes).toEqual(['refreshed', 'refreshed', 'refreshed'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reports a rejected refresh token and leaves clearing it to the caller', async () => {
    setTokens({ accessToken: 'old', refreshToken: 'refresh-1' })
    routeFetch({ 'POST /auth/refresh': () => jsonResponse(401, rejected) })

    await expect(refreshSession()).resolves.toBe('rejected')
    expect(getRefreshToken()).toBe('refresh-1')
  })

  it('treats rate limits, server errors and network failures as unreachable and keeps the token', async () => {
    setTokens({ accessToken: 'old', refreshToken: 'refresh-1' })
    const responses = [
      () => jsonResponse(429, { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again in a minute.' } }),
      () => jsonResponse(500, { error: { code: 'INTERNAL', message: 'Something went wrong' } }),
      () => {
        throw new TypeError('Failed to fetch')
      },
    ]
    for (const respond of responses) {
      routeFetch({ 'POST /auth/refresh': respond })
      await expect(refreshSession()).resolves.toBe('unreachable')
    }
    expect(getRefreshToken()).toBe('refresh-1')
  })

  it('does not call the API without a refresh token', async () => {
    const fetchMock = routeFetch({})
    await expect(refreshSession()).resolves.toBe('rejected')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reads the refresh token inside the cross-tab lock', async () => {
    setTokens({ accessToken: 'old', refreshToken: 'refresh-1' })
    const request = vi.fn(async (_name: string, task: () => Promise<unknown>) => {
      // Another tab rotated the token while this tab waited for the lock.
      localStorage.setItem(refreshTokenStorageKey, 'rotated-by-other-tab')
      return task()
    })
    vi.stubGlobal('navigator', { locks: { request } })
    const fetchMock = routeFetch({
      'POST /auth/refresh': () => jsonResponse(200, { accessToken: 'access-3', refreshToken: 'refresh-3' }),
    })

    await refreshSession()
    expect(request).toHaveBeenCalledWith('fw-refresh', expect.any(Function))
    expect(requestBody(fetchMock.mock.calls[0][1])).toEqual({ refreshToken: 'rotated-by-other-tab' })
  })

  it('expireSession clears the tokens and notifies the handler', () => {
    const expired = vi.fn()
    onSessionExpired(expired)
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })

    expireSession()
    expect(expired).toHaveBeenCalledOnce()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
