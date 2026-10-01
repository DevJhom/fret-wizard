import { apiRequest } from '@services/http'
import type { AuthResponse, ImportRequest, ImportResult, User } from '@services/apiTypes'

export interface SignupInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export const signupRequest = (input: SignupInput): Promise<AuthResponse> => apiRequest<AuthResponse>('POST', '/auth/signup', input)

export const loginRequest = (input: LoginInput): Promise<AuthResponse> => apiRequest<AuthResponse>('POST', '/auth/login', input)

export const googleRequest = (idToken: string): Promise<AuthResponse> => apiRequest<AuthResponse>('POST', '/auth/google', { idToken })

export const logoutRequest = (refreshToken: string): Promise<void> => apiRequest<void>('POST', '/auth/logout', { refreshToken })

export const fetchMe = (): Promise<User> => apiRequest<User>('GET', '/me')

export const importRequest = (data: ImportRequest): Promise<ImportResult> => apiRequest<ImportResult>('POST', '/me/import', data)
