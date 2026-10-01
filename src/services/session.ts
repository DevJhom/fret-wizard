import { apiBaseUrl } from '@services/apiConfig'
import type { TokenPair } from '@services/apiTypes'

export type RefreshOutcome = 'refreshed' | 'rejected' | 'unreachable'

export const refreshTokenStorageKey = 'refreshToken'
const refreshLockName = 'fw-refresh'

// The access token lives in memory only; the refresh token survives reloads in localStorage.
let accessToken: string | null = null
let refreshInFlight: Promise<RefreshOutcome> | null = null
let sessionExpiredHandler: () => void = () => {}

export const getAccessToken = (): string | null => accessToken

export const getRefreshToken = (): string | null => localStorage.getItem(refreshTokenStorageKey)

export const setTokens = (tokens: TokenPair): void => {
  accessToken = tokens.accessToken
  localStorage.setItem(refreshTokenStorageKey, tokens.refreshToken)
}

export const clearTokens = (): void => {
  accessToken = null
  localStorage.removeItem(refreshTokenStorageKey)
}

export const onSessionExpired = (handler: () => void): void => {
  sessionExpiredHandler = handler
}

export const expireSession = (): void => {
  clearTokens()
  sessionExpiredHandler()
}

// Serialises refreshes across tabs, so two tabs never send the same refresh token
// (the server treats that as reuse and revokes the whole session).
const withRefreshLock = <T>(task: () => Promise<T>): Promise<T> => {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(refreshLockName, task) as Promise<T>
  }
  return task()
}

const requestRefresh = async (): Promise<RefreshOutcome> => {
  // Read inside the lock: another tab may have rotated the token while we waited.
  const refreshToken = getRefreshToken()
  if (!refreshToken) return 'rejected'
  try {
    const res = await fetch(`${apiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (res.status === 400 || res.status === 401) return 'rejected'
    if (!res.ok) return 'unreachable'
    setTokens(await res.json() as TokenPair)
    return 'refreshed'
  } catch {
    return 'unreachable'
  }
}

export const refreshSession = (): Promise<RefreshOutcome> => {
  if (!refreshInFlight) {
    refreshInFlight = withRefreshLock(requestRefresh).finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}
