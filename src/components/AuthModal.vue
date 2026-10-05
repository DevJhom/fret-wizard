<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@stores/useAuthStore'
import { googleClientId } from '@services/apiConfig'
import { renderGoogleButton } from '@services/googleIdentity'
import { describeAuthError } from '@services/authErrors'

type Mode = 'login' | 'signup'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const clientId = googleClientId()

const mode = ref<Mode>('login')
const username = ref('')
const email = ref('')
const password = ref('')
const formError = ref('')
const fieldErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const googleUnavailable = ref(false)
// The backend has no password reset yet, so the link only explains that
const showResetNote = ref(false)
// UI only for now: sessions are always remembered (refresh token in localStorage)
const rememberMe = ref(true)
const usernameInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)
const googleButton = ref<HTMLElement | null>(null)

const isSignup = computed(() => mode.value === 'signup')

const focusFirstField = () => {
  (isSignup.value ? usernameInput.value : emailInput.value)?.focus()
}

const resetErrors = () => {
  formError.value = ''
  fieldErrors.value = {}
  showResetNote.value = false
}

const showError = (error: unknown) => {
  const view = describeAuthError(error)
  formError.value = view.message
  fieldErrors.value = view.fields
}

const switchMode = async (next: Mode) => {
  mode.value = next
  resetErrors()
  await nextTick()
  focusFirstField()
}

const submit = async () => {
  resetErrors()
  isSubmitting.value = true
  try {
    if (isSignup.value) {
      await authStore.signup({ username: username.value, email: email.value, password: password.value })
    } else {
      await authStore.login({ email: email.value, password: password.value })
    }
    emit('close')
  } catch (error) {
    showError(error)
  } finally {
    isSubmitting.value = false
  }
}

const onGoogleCredential = async (credential: string) => {
  resetErrors()
  try {
    await authStore.loginWithGoogle(credential)
    emit('close')
  } catch (error) {
    showError(error)
  }
}

onMounted(async () => {
  focusFirstField()
  if (clientId && googleButton.value) {
    try {
      await renderGoogleButton(googleButton.value, clientId, onGoogleCredential)
    } catch (error) {
      console.log('renderGoogleButton: ', error)
      googleUnavailable.value = true
    }
  }
})
</script>

<template>
  <div class="modal-backdrop show"></div>
  <div
    class="modal d-block"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-title"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content auth-card">
        <button type="button" class="auth-close" aria-label="Close" @click="emit('close')">×</button>

        <div class="auth-brand">
          <span class="auth-logo">Fret<span class="auth-logo-accent">Wizard</span></span>
          <span class="auth-tagline">Your interactive fretboard</span>
        </div>

        <div class="auth-main">
          <h2 id="auth-title" class="auth-title">{{ isSignup ? 'Create an account' : 'Login' }}</h2>

          <form class="auth-form" novalidate @submit.prevent="submit">
            <label v-if="isSignup" class="auth-field">
              <span>Username</span>
              <input ref="usernameInput" v-model="username" class="auth-input" autocomplete="nickname" maxlength="100">
              <small v-if="fieldErrors.username" class="auth-field-error">{{ fieldErrors.username }}</small>
            </label>
            <label class="auth-field">
              <span>Email</span>
              <input ref="emailInput" v-model="email" class="auth-input" type="email" autocomplete="email">
              <small v-if="fieldErrors.email" class="auth-field-error">{{ fieldErrors.email }}</small>
            </label>
            <label class="auth-field">
              <span>Password</span>
              <input
                v-model="password"
                class="auth-input"
                type="password"
                :autocomplete="isSignup ? 'new-password' : 'current-password'"
              >
              <small v-if="fieldErrors.password" class="auth-field-error">{{ fieldErrors.password }}</small>
            </label>

            <div v-if="!isSignup" class="auth-options">
              <div class="auth-options-row">
                <label class="auth-remember">
                  <input v-model="rememberMe" type="checkbox">
                  <span>Remember me</span>
                </label>
                <button type="button" class="auth-link" @click="showResetNote = true">Forgot password?</button>
              </div>
              <small v-if="showResetNote" class="auth-note" role="status">
                Password reset isn't available yet.
              </small>
            </div>

            <p v-if="formError" class="auth-error" role="alert">{{ formError }}</p>

            <button type="submit" class="auth-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in' }}
            </button>

            <p class="auth-switch">
              <template v-if="isSignup">
                Already have an account?
                <button type="button" class="auth-link" @click="switchMode('login')">Log in</button>
              </template>
              <template v-else>
                Don't have an account?
                <button type="button" class="auth-link" @click="switchMode('signup')">Sign up</button>
              </template>
            </p>
          </form>

          <template v-if="clientId">
            <div class="auth-divider"><span>or</span></div>
            <div ref="googleButton" class="google-button"></div>
            <small v-if="googleUnavailable" class="auth-field-error">Google login is unavailable right now.</small>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-backdrop.show {
  opacity: 0.6;
}

// Brand panel on the left, form on the right
.auth-card {
  flex-direction: row;
  overflow: hidden;
  min-height: 480px;
  text-align: start;
  color: inherit;
  background-color: var(--card-background-color);
  border: 1px solid var(--card-border-color);
  border-radius: 14px;
  box-shadow: var(--card-shadow);
}

.auth-brand {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
  background: var(--auth-brand-background);
  border-right: 1px solid var(--card-border-color);
}

// Same wordmark as the top bar logo, larger
.auth-logo {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.auth-logo-accent {
  font-size: inherit;
  color: var(--accent-text-color);
}

.auth-tagline {
  color: var(--auth-tagline-color);
  font-size: 1rem;
}

.auth-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.auth-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--accent-text-color);
}

// Pinned to the card's top-right corner
.auth-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  z-index: 1;
  border: none;
  background: none;
  color: inherit;
  font-size: 1.5rem;
  line-height: 1;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.auth-input {
  padding: 0.5em 0.7em;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  color: inherit;
  background-color: var(--option-background-color);
  outline: none;

  &:focus {
    border-color: $yellow;
  }
}

.auth-options {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  margin-top: -0.25rem;
}

// Remember me on the left, Forgot password on the right
.auth-options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  gap: 1rem;
}

.auth-remember {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;

  input {
    width: 1rem;
    height: 1rem;
    margin: 0;
    accent-color: $yellow;
    cursor: pointer;
  }
}

.auth-switch {
  margin: 0;
  font-size: 0.85rem;
  text-align: center;
  color: var(--muted-text-color);
}

// Text-style button used by Forgot password and the Log in / Sign up switch
.auth-link {
  padding: 0;
  border: none;
  background: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-text-color);

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid $yellow;
    outline-offset: 2px;
  }
}

.auth-note {
  color: var(--muted-text-color);
}

.auth-field-error,
.auth-error {
  color: $red-1;
  font-weight: 600;
}

.auth-error {
  margin: 0;
  font-size: 0.85rem;
}

.auth-submit {
  padding: 0.6em;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  color: $black;
  background-color: $yellow;

  &:disabled {
    opacity: 0.6;
  }
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: $gray-1;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-top: 1px solid var(--card-border-color);
  }
}

.google-button {
  display: flex;
  justify-content: center;
  min-height: 44px;
}

// Phones: brand panel stacks above the form as a compact header
@media (max-width: $phone) {
  .auth-card {
    flex-direction: column;
    min-height: 0;
  }

  .auth-brand {
    flex: none;
    gap: 0.25rem;
    padding: 1.25rem;
    border-right: none;
    border-bottom: 1px solid var(--card-border-color);
  }

  .auth-logo {
    font-size: 1.5rem;
  }

  .auth-tagline {
    font-size: 0.85rem;
  }

  .auth-main {
    padding: 1.5rem;
  }
}
</style>
