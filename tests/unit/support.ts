import { vi } from 'vitest'

export const API = 'http://api.test'

export const enableAccounts = (): void => {
  vi.stubEnv('VITE_API_BASE_URL', API)
}

export const jsonResponse = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
  })

type Handler = (init: RequestInit) => Response | Promise<Response>

// Stubs fetch with handlers keyed by "METHOD /path"; unknown requests throw.
export const routeFetch = (routes: Record<string, Handler>) => {
  const mock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.toString())
    const key = `${init.method ?? 'GET'} ${url.pathname}`
    const handler = routes[key]
    if (!handler) throw new Error(`Unexpected request: ${key}`)
    return handler(init)
  })
  vi.stubGlobal('fetch', mock)
  return mock
}

export const requestBody = (init: RequestInit | undefined): unknown => JSON.parse(String(init?.body))
