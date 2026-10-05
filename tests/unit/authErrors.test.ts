import { describe, it, expect } from 'vitest'
import { ApiError } from '@services/http'
import { describeAuthError } from '@services/authErrors'

describe('describeAuthError', () => {
  it('explains an email that already has an account', () => {
    expect(describeAuthError(new ApiError(409, 'CONFLICT', 'An account with this email already exists')))
      .toEqual({ message: 'An account with this email already exists', fields: {} })
  })

  it('shows the server message for 401s', () => {
    expect(describeAuthError(new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password')))
      .toEqual({ message: 'Invalid email or password', fields: {} })
    expect(describeAuthError(new ApiError(401, 'UNAUTHORIZED', 'Google login failed')))
      .toEqual({ message: 'Google login failed', fields: {} })
  })

  it('puts validation messages beside their fields', () => {
    const error = new ApiError(400, 'VALIDATION_ERROR', 'Invalid request', [
      { path: 'email', message: 'Enter a valid email address' },
      { path: 'password', message: 'Password must be at least 8 characters' },
    ])
    expect(describeAuthError(error)).toEqual({
      message: '',
      fields: { email: 'Enter a valid email address', password: 'Password must be at least 8 characters' },
    })
  })

  it('explains rate limiting', () => {
    expect(describeAuthError(new ApiError(429, 'RATE_LIMITED', 'Too many requests. Try again in a minute.')))
      .toEqual({ message: 'Too many attempts. Try again in a minute.', fields: {} })
  })

  it('falls back to a generic message for everything else', () => {
    const generic = { message: 'Something went wrong. Try again.', fields: {} }
    expect(describeAuthError(new ApiError(500, 'INTERNAL', 'Something went wrong'))).toEqual(generic)
    expect(describeAuthError(new TypeError('Failed to fetch'))).toEqual(generic)
  })
})
