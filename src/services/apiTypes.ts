import type { Setup } from '@data/constants'
import type { FretboardData } from '@/lib/fretboardData'
import type { ChordProgression } from '@services/adapters/localStorageAdapter'

export interface User {
  id: string
  email: string
  username: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends TokenPair {
  user: User
  isNewUser?: boolean
}

export interface ApiErrorDetail {
  path: string
  message: string
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}

export interface ImportRequest {
  libraryCards?: { name: string; setup: Setup; fretboards: FretboardData[] }[]
  workspaces?: {
    scale?: { fretboards: FretboardData[] }
    chord?: { fretboards: FretboardData[] }
  }
  chordProgression?: ChordProgression
}

export interface ImportResult {
  importedCards: number
  appliedWorkspaces: ('scale' | 'chord')[]
  appliedChordProgression: boolean
}
