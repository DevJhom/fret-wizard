<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Setup } from '@data/constants'

const props = defineProps<{
  defaultSetup: Setup,
  isCreating?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'create', name: string, setup: Setup): void
}>()

const setup = ref<Setup>(props.defaultSetup)
const name = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

// What a new card of this type starts with; also its name when none is typed
const defaultName = computed(() => (setup.value === Setup.Scale ? 'C Pentatonic' : 'C Major'))

const submit = () => {
  if (!props.isCreating) emit('create', name.value.trim() || defaultName.value, setup.value)
}

onMounted(() => {
  nameInput.value?.focus()
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
        <h2 id="new-card-title" class="new-card-title">New card</h2>

        <form class="new-card-form" novalidate @submit.prevent="submit">
          <label class="new-card-field">
            <span>Name</span>
            <input ref="nameInput" v-model="name" class="new-card-input" maxlength="80" :placeholder="defaultName">
          </label>

          <div class="new-card-field">
            <span id="new-card-type">Type</span>
            <div class="setup-switch" role="radiogroup" aria-labelledby="new-card-type">
              <label>
                <input v-model="setup" type="radio" name="new-card-setup" :value="Setup.Scale">
                <div class="label">
                  <span class="tile-top">
                    <svg class="tile-icon" width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M2 5h36M2 12h36M2 19h36M2 5v14M14 5v14M26 5v14M38 5v14"/><g fill="currentColor" stroke="none"><circle cx="20" cy="5" r="2.6"/><circle cx="32" cy="5" r="2.6"/><circle cx="8" cy="12" r="2.6"/><circle cx="20" cy="12" r="2.6"/><circle cx="8" cy="19" r="2.6"/><circle cx="32" cy="19" r="2.6"/></g></svg>
                    <span class="tile-mark"></span>
                  </span>
                  <span class="tile-text">
                    <span class="tile-title">Scale</span>
                    <span class="tile-description">Notes of a scale across the neck</span>
                  </span>
                </div>
              </label>
              <label>
                <input v-model="setup" type="radio" name="new-card-setup" :value="Setup.Chord">
                <div class="label">
                  <span class="tile-top">
                    <svg class="tile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M5 3h14M5 9h14M5 15h14M5 21h14M5 3v18M12 3v18M19 3v18"/><g fill="currentColor" stroke="none"><circle cx="19" cy="6" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="5" cy="18" r="2.4"/></g></svg>
                    <span class="tile-mark"></span>
                  </span>
                  <span class="tile-text">
                    <span class="tile-title">Chord</span>
                    <span class="tile-description">Chord tones, shapes and fingerings</span>
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div class="new-card-actions">
            <button type="button" class="btn-cancel" @click="emit('close')">Cancel</button>
            <button type="submit" class="btn-create" :disabled="isCreating">
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

// Narrower than Bootstrap's 500px; keeps a side margin on small phones
.modal-dialog {
  max-width: min(440px, calc(100% - 1rem));
  margin-inline: auto;
}

.new-card {
  gap: 1.25rem;
  padding: 1.5rem;
  text-align: start;
  color: inherit;
  background-color: var(--card-background-color);
  border: 1px solid var(--card-border-color);
  border-radius: 14px;
  box-shadow: var(--card-shadow);
}

.new-card-title {
  margin: 0;
  color: var(--accent-text-color);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.2;
}

.new-card-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.new-card-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-weight: 600;

  > span {
    font-size: 0.8125rem;
  }
}

// Two tiles side by side: the selected one gets the accent outline and tint
.setup-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  label {
    position: relative;
    display: flex;
    cursor: pointer;
  }

  // Visually hidden but still reachable by keyboard
  input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }

  .label {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--card-border-color);
    border-radius: 10px;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .tile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tile-icon {
    color: var(--muted-text-color);
    transition: color 0.15s ease;
  }

  .tile-mark {
    width: 18px;
    height: 18px;
    border: 1.5px solid $gray-1;
    border-radius: 50%;
  }

  .tile-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tile-title {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .tile-description {
    color: var(--muted-text-color);
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.4;
  }

  label:hover .label {
    border-color: var(--accent-text-color);
  }

  input:checked + .label {
    border-color: var(--accent-text-color);
    background-color: var(--accent-soft-color);

    .tile-icon {
      color: var(--accent-text-color);
    }

    .tile-mark {
      border: 5px solid var(--accent-text-color);
    }
  }

  input:focus-visible + .label {
    outline: 2px solid $yellow;
    outline-offset: 2px;
  }
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

  &::placeholder {
    color: var(--muted-text-color);
    opacity: 0.7;
  }

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
  height: 44px;
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
