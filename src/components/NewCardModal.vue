<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Setup } from '@data/constants'

const props = defineProps<{
  defaultName: string,
  defaultSetup: Setup,
  isCreating?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'create', name: string, setup: Setup): void
}>()

const setup = ref<Setup>(props.defaultSetup)
const name = ref(props.defaultName)
const nameInput = ref<HTMLInputElement | null>(null)

const canCreate = computed(() => !props.isCreating && name.value.trim() !== '')

const submit = () => {
  if (canCreate.value) emit('create', name.value.trim(), setup.value)
}

onMounted(() => {
  nameInput.value?.focus()
  nameInput.value?.select()
})
</script>

<template>
  <div class="modal-backdrop show"></div>
  <div
    class="modal d-block"
    role="dialog"
    aria-modal="true"
    aria-labelledby="new-card-title"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content new-card">
        <div class="new-card-header">
          <h2 id="new-card-title" class="new-card-title">New card</h2>
          <button type="button" class="new-card-close" aria-label="Close" @click="emit('close')">×</button>
        </div>

        <form class="new-card-form" novalidate @submit.prevent="submit">
          <div class="new-card-field">
            <span id="new-card-type">Type</span>
            <div class="tile-radio fw-bold" role="radiogroup" aria-labelledby="new-card-type">
              <label>
                <input v-model="setup" type="radio" name="new-card-setup" :value="Setup.Scale">
                <div class="label">Scale</div>
              </label>
              <label>
                <input v-model="setup" type="radio" name="new-card-setup" :value="Setup.Chord">
                <div class="label">Chord</div>
              </label>
            </div>
          </div>

          <label class="new-card-field">
            <span>Title</span>
            <input ref="nameInput" v-model="name" class="new-card-input" maxlength="80">
          </label>

          <div class="new-card-actions">
            <button type="button" class="btn-cancel" @click="emit('close')">Cancel</button>
            <button type="submit" class="btn-create" :disabled="!canCreate">
              {{ isCreating ? 'Creating…' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-backdrop.show {
  opacity: 0.6;
}

.new-card {
  gap: 1rem;
  padding: 1.5rem;
  text-align: start;
  color: inherit;
  background-color: var(--card-background-color);
  border: 1px solid var(--card-border-color);
  border-radius: 14px;
  box-shadow: var(--card-shadow);
}

.new-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.new-card-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--accent-text-color);
}

.new-card-close {
  border: none;
  background: none;
  color: inherit;
  font-size: 1.5rem;
  line-height: 1;
}

.new-card-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.new-card-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.tile-radio label {
  flex: 1;
}

.tile-radio .label {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  font-size: 0.95rem;
}

.new-card-input {
  height: 44px;
  padding: 0 0.7em;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  color: inherit;
  background-color: var(--option-background-color);
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: $yellow;
  }
}

.new-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel,
.btn-create {
  height: 40px;
  padding: 0 1.1em;
  border-radius: 8px;
  font-weight: 700;
}

.btn-cancel {
  border: 1px solid var(--card-border-color);
  color: inherit;
  background-color: transparent;
}

.btn-create {
  border: none;
  color: $black;
  background-color: $yellow;

  &:disabled {
    opacity: 0.6;
  }
}
</style>
