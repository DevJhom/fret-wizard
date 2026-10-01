import { defineStore } from 'pinia'
import { accountsEnabled } from '@services/apiConfig'
import { fetchMe, googleRequest, importRequest, loginRequest, logoutRequest, signupRequest } from '@services/authApi'
import type { LoginInput, SignupInput } from '@services/authApi'
import { clearGuestData, collectGuestData } from '@services/guestData'
import { clearTokens, getRefreshToken, onSessionExpired, refreshSession, refreshTokenStorageKey, setTokens } from '@services/session'
import type { AuthResponse, User } from '@services/apiTypes'
import { flushPendingSaves } from '@services/adapters/apiAdapter'

export type AuthStatus = 'restoring' | 'guest' | 'authenticated'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    status: 'restoring' as AuthStatus,
    // Pages are keyed on this, so they remount and reload whenever the session changes.
    sessionVersion: 0,
    importFailed: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => state.status === 'authenticated',
  },
  actions: {
    startSessionListeners() {
      onSessionExpired(() => this.becomeGuest())
      window.addEventListener('storage', (event: StorageEvent) => {
        // Another tab logged out (storage events never fire in the tab that made the change).
        if (event.key === refreshTokenStorageKey && event.newValue === null && this.status === 'authenticated') {
          this.becomeGuest()
        }
      })
    },
    async restoreSession() {
      if (!accountsEnabled() || !getRefreshToken()) {
        this.status = 'guest'
        return
      }
      const outcome = await refreshSession()
      if (outcome !== 'refreshed') {
        // Unreachable keeps the token, so the next page load tries again.
        if (outcome === 'rejected') clearTokens()
        this.status = 'guest'
        return
      }
      try {
        this.user = await fetchMe()
      } catch (error) {
        console.log('restoreSession: ', error)
        this.status = 'guest'
        return
      }
      await this.enterAuthenticated()
    },
    async signup(input: SignupInput) {
      await this.completeLogin(await signupRequest(input))
    },
    async login(input: LoginInput) {
      await this.completeLogin(await loginRequest(input))
    },
    async loginWithGoogle(idToken: string) {
      await this.completeLogin(await googleRequest(idToken))
    },
    async completeLogin(response: AuthResponse) {
      setTokens(response)
      this.user = response.user
      await this.enterAuthenticated()
    },
    async enterAuthenticated() {
      // Import while still in guest mode, so no page saves defaults to the account first.
      await this.importGuestData()
      this.status = 'authenticated'
      this.sessionVersion++
    },
    async importGuestData() {
      const data = collectGuestData()
      if (!data) return
      try {
        await importRequest(data)
        clearGuestData()
        this.importFailed = false
      } catch (error) {
        console.log('importGuestData: ', error)
        this.importFailed = true
      }
    },
    async logout() {
      // Send the last debounced edits while the tokens are still valid.
      if (this.status === 'authenticated') await flushPendingSaves()
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          await logoutRequest(refreshToken)
        } catch (error) {
          console.log('logout: ', error)
        }
      }
      this.becomeGuest()
    },
    becomeGuest() {
      clearTokens()
      this.user = null
      this.status = 'guest'
      this.sessionVersion++
    },
  },
})
