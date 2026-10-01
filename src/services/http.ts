import { apiBaseUrl } from '@services/apiConfig'
import { expireSession, getAccessToken, refreshSession } from '@services/session'
import type { ApiErrorBody, ApiErrorDetail } from '@services/apiTypes'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export class ApiError extends Error {
  status: number
  code: string
  details: ApiErrorDetail[]

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const send = (method: HttpMethod, path: string, body: unknown): Promise<Response> => {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${apiBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

const toApiError = async (res: Response): Promise<ApiError> => {
  try {
    const { error } = await res.json() as ApiErrorBody
    return new ApiError(res.status, error.code, error.message, error.details ?? [])
  } catch {
    return new ApiError(res.status, 'INTERNAL', 'Something went wrong')
  }
}

export const apiRequest = async <T>(method: HttpMethod, path: string, body?: unknown): Promise<T> => {
  let res = await send(method, path, body)
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const outcome = await refreshSession()
    if (outcome === 'refreshed') {
      res = await send(method, path, body)
    } else if (outcome === 'rejected') {
      expireSession()
    }
  }
  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return undefined as T
  return await res.json() as T
}
