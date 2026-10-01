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
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content auth-card">
        <div class="auth-header">
          <h2 id="auth-title" class="auth-title">{{ isSignup ? 'Create an account' : 'Sign in' }}</h2>
          <button type="button" class="auth-close" aria-label="Close" @click="emit('close')">×</button>
        </div>

        <div class="auth-tabs switch-radio fw-bold">
          <label>
            <input type="radio" name="auth-mode" :checked="!isSignup" @change="switchMode('login')">
            <div class="label px-3">Log in</div>
          </label>
          <label>
            <input type="radio" name="auth-mode" :checked="isSignup" @change="switchMode('signup')">
            <div class="label px-3">Sign up</div>
          </label>
        </div>

        <form class="auth-form" novalidate @submit.prevent="submit">
          <label v-if="isSignup" class="auth-field">
            <span>Display name</span>
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

          <p v-if="formError" class="auth-error" role="alert">{{ formError }}</p>

          <button type="submit" class="auth-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in' }}
          </button>
        </form>

        <template v-if="clientId">
          <div class="auth-divider"><span>or</span></div>
          <div ref="googleButton" class="google-button"></div>
          <small v-if="googleUnavailable" class="auth-field-error">Google sign-in is unavailable right now.</small>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-backdrop.show {
  opacity: 0.6;
}

.auth-card {
  gap: 1rem;
  padding: 1.5rem;
  text-align: start;
  color: inherit;
  background-color: var(--card-background-color);
  border: 1px solid var(--card-border-color);
  border-radius: 14px;
  box-shadow: var(--card-shadow);
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--accent-text-color);
}

.auth-close {
  border: none;
  background: none;
  color: inherit;
  font-size: 1.5rem;
  line-height: 1;
}

.auth-tabs {
  display: flex;
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
</style>
