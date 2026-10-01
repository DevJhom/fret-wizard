export const apiBaseUrl = (): string | undefined => {
  const value = import.meta.env.VITE_API_BASE_URL
  return value ? value.replace(/\/+$/, '') : undefined
}

// Without an API URL the app is guest-only, exactly as before accounts existed.
export const accountsEnabled = (): boolean => apiBaseUrl() !== undefined

export const googleClientId = (): string | undefined => import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined
