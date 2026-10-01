import { ApiError } from '@services/http'

export interface AuthErrorView {
  message: string
  fields: Record<string, string>
}

const genericMessage = 'Something went wrong. Try again.'

export const describeAuthError = (error: unknown): AuthErrorView => {
  if (error instanceof ApiError) {
    if (error.status === 400 && error.details.length > 0) {
      return { message: '', fields: Object.fromEntries(error.details.map(detail => [detail.path, detail.message])) }
    }
    if (error.status === 409) return { message: 'An account with this email already exists', fields: {} }
    // The server says "Invalid email or password" for logins and "Google sign-in failed" for Google.
    if (error.status === 401) return { message: error.message, fields: {} }
    if (error.status === 429) return { message: 'Too many attempts. Try again in a minute.', fields: {} }
  }
  return { message: genericMessage, fields: {} }
}
