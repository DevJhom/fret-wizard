<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLibraryStore } from '@stores/useLibraryStore'
import type { LibraryCard } from '@stores/useLibraryStore'
import Trash from '@/assets/icons/Trash.vue'
import Edit from '@/assets/icons/Edit.vue'
import Done from '@/assets/icons/Done.vue'

const emit = defineEmits<{
  (e: 'load-card', card: LibraryCard): void
}>()

const libraryStore = useLibraryStore()

const editingId = ref<string | null>(null)
const editingName = ref('')

const handleCreate = async () => {
  const defaultName = `Card ${libraryStore.cards.length + 1}`
  await libraryStore.createCard(defaultName)
  const newCard = libraryStore.cards[libraryStore.cards.length - 1]
  editingId.value = newCard.id
  editingName.value = newCard.name
}

const startRename = (card: LibraryCard) => {
  editingId.value = card.id
  editingName.value = card.name
}

const confirmRename = async (id: string) => {
  const name = editingName.value.trim()
  if (name) {
    await libraryStore.renameCard(id, name)
  }
  editingId.value = null
}

const cancelRename = () => {
  editingId.value = null
}

const handleDelete = async (id: string) => {
  await libraryStore.deleteCard(id)
}

onMounted(async () => {
  await libraryStore.loadCards()
})
</script>

<template>
  <div class="library-page">
    <div class="library-header">
      <h2>Library</h2>
    </div>

    <div class="card-grid">
      <div
        v-for="card in libraryStore.cards"
        :key="card.id"
        class="library-card"
        @click="emit('load-card', card)"
      >
        <div class="card-name">
          <span v-if="editingId !== card.id">{{ card.name }}</span>
          <input
            v-else
            v-model="editingName"
            class="input-rename"
            @keyup.enter="confirmRename(card.id)"
            @keyup.escape="cancelRename()"
            @click.stop
            autofocus
          />
        </div>
        <div class="card-summary" v-if="editingId !== card.id">
          {{ card.data.currentKey }} {{ card.data.currentTonality }} {{ card.data.currentPattern }}
        </div>
        <div v-if="editingId === card.id" class="action-icon finish-editing" @click.stop="confirmRename(card.id)">
          <Done />
        </div>
        <div class="card-actions" @click.stop>
          <div v-if="editingId !== card.id" class="action-icon" @click="startRename(card)">
            <Edit />
          </div>
          <div v-if="editingId !== card.id" class="action-icon" @click="handleDelete(card.id)">
            <Trash />
          </div>
        </div>
      </div>

      <div class="library-card card-new" @click="handleCreate">
        <h2 class="text-yellow"> + </h2>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.library-page {
  padding: 1rem 2rem;
  width: 100%;
}

.library-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  h2 {
    color: $yellow;
    margin: 0;
    font-size: 1.2rem;
  }
}

.card-new {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
}

.input-rename {
  background-color: var(--fretboard-background-color);
  color: inherit;
  border: 1px solid $gray-1;
  border-radius: 6px;
  padding: 0.4em 0.6em;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: $yellow;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.library-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  background-color: var(--fretboard-background-color);
  border: 1px solid $gray;
  border-radius: 8px;
  padding: 1rem 1rem 0.5rem 1rem;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: $yellow;
  }
}

.finish-editing {
  position: absolute;
  top: -14px;
  right: -14px;
}

.card-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: $yellow;
}

.card-summary {
  font-size: 0.8rem;
  color: $gray-1;
  margin-bottom: 0.75rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: auto;
}

.action-icon {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.empty-state {
  color: $gray-1;
  font-size: 0.9rem;
  margin-top: 2rem;
}
</style>
