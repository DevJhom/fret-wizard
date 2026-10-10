<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@stores/useAuthStore'
import AuthModal from '@components/AuthModal.vue'

const authStore = useAuthStore()
const showAuth = ref(false)
</script>

<template>
  <div class="account-menu">
    <span v-if="authStore.importFailed" class="import-notice">
      We couldn't import the data saved in this browser.
      <button type="button" class="link-button" @click="authStore.importFailed = false">Dismiss</button>
    </span>
    <template v-if="authStore.isAuthenticated && authStore.user">
      <span class="account-name">{{ authStore.user.username }}</span>
      <button type="button" class="account-button" @click="authStore.logout()">Log Out</button>
    </template>
    <button v-else-if="authStore.status === 'guest'" type="button" class="account-button login-button" @click="showAuth = true">Login</button>
    <AuthModal v-if="showAuth" @close="showAuth = false"/>
  </div>
</template>

<style scoped lang="scss">
.account-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.account-name {
  font-weight: 600;
  color: var(--accent-text-color);
}

.account-button {
  padding: 0.35rem 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  color: inherit;
  background-color: var(--option-background-color);

  &:hover {
    color: $black;
    background-color: $yellow;
  }
}

// Login is the call to action for guests, so it is yellow from the start
.login-button {
  color: $black;
  background-color: $yellow;

  &:hover {
    filter: brightness(1.1);
  }
}

.import-notice {
  color: $gray-1;
}

.link-button {
  margin-left: 0.25rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--accent-text-color);
  text-decoration: underline;
}
</style>
