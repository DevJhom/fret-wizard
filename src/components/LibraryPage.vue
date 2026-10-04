<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Setup } from '@data/constants'
import { useLibraryStore } from '@stores/useLibraryStore'
import type { LibraryCard } from '@stores/useLibraryStore'
import LibraryCardItem from '@components/LibraryCardItem.vue'
import { filterCounts, visibleCards } from '@/lib/libraryView'
import type { LibraryFilter, LibrarySort } from '@/lib/libraryView'
import type { View } from '@/lib/pageRoute'

const emit = defineEmits<{
  (e: 'load-card', card: LibraryCard): void
  (e: 'navigate', view: View): void
}>()

const libraryStore = useLibraryStore()

const query = ref('')
const filter = ref<LibraryFilter>('all')
const sort = ref<LibrarySort>('newest')
// A card made with "New card" opens in rename mode
const newCardId = ref<string | null>(null)

const filters: { value: LibraryFilter, label: string }[] = [
  { value: 'all', label: 'All' },
  { value: Setup.Scale, label: 'Scales' },
  { value: Setup.Chord, label: 'Chords' },
]

const cards = computed(() => visibleCards(libraryStore.cards, filter.value, query.value, sort.value))
const counts = computed(() => filterCounts(libraryStore.cards))
const isEmpty = computed(() => libraryStore.isLoaded && libraryStore.cards.length === 0)
const hasNoResults = computed(() => !isEmpty.value && libraryStore.cards.length > 0 && cards.value.length === 0)

const summary = computed(() => {
  const count = libraryStore.cards.length
  return `${count} saved ${count === 1 ? 'card' : 'cards'}`
})

const noResultsText = computed(() =>
  query.value.trim() ? `No cards match "${query.value.trim()}"` : 'No cards of this type yet'
)

const clearFilters = () => {
  query.value = ''
  filter.value = 'all'
}

const handleCreate = async () => {
  const card = await libraryStore.createCard(`Card ${libraryStore.cards.length + 1}`)
  if (!card) return
  // Make sure the new card is on screen
  clearFilters()
  newCardId.value = card.id
}

const handleRename = async (id: string, name: string) => {
  await libraryStore.renameCard(id, name)
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
      <div>
        <h1 class="library-title">Library</h1>
        <p class="library-summary">{{ summary }}</p>
      </div>
      <button type="button" class="btn-new" @click="handleCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        New card
      </button>
    </div>

    <div v-if="!isEmpty" class="toolbar">
      <label class="search">
        <span class="visually-hidden">Search the library</span>
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input v-model="query" type="search" class="search-input" placeholder="Search by name, key or pattern"/>
      </label>
      <div class="filter-group" role="group" aria-label="Filter by type">
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          class="filter-button"
          :class="{ 'filter-selected': filter === option.value }"
          :aria-pressed="filter === option.value"
          @click="filter = option.value"
        >
          {{ option.label }}<span class="filter-count">{{ counts[option.value] }}</span>
        </button>
      </div>
      <label class="sort">
        Sort
        <select v-model="sort" class="sort-select">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
        </select>
      </label>
    </div>

    <div v-if="cards.length" class="card-grid">
      <LibraryCardItem
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :is-active="card.id === libraryStore.activeCardId"
        :start-renaming="card.id === newCardId"
        @open="emit('load-card', card)"
        @rename="name => handleRename(card.id, name)"
        @delete="handleDelete(card.id)"
      />
    </div>

    <div v-if="hasNoResults" class="no-results">
      <p class="no-results-text">{{ noResultsText }}</p>
      <button type="button" class="btn-secondary" @click="clearFilters">Clear search and filters</button>
    </div>

    <section v-if="isEmpty" class="empty-state">
      <div class="empty-neck" aria-hidden="true">
        <div v-for="fret in 6" :key="fret" class="empty-fret">
          <span v-if="fret === 2" class="empty-dot"></span>
        </div>
      </div>
      <div class="empty-copy">
        <h2 class="empty-title">Save a stack to see it here</h2>
        <p class="empty-text">Build fretboards on the Scale or Chord page, then use Save to Library. Each card keeps its whole stack, ready to reopen.</p>
      </div>
      <div class="empty-actions">
        <button type="button" class="btn-new" @click="emit('navigate', 'scale')">Go to Scale</button>
        <button type="button" class="btn-secondary" @click="emit('navigate', 'chord')">Go to Chord</button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.library-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: left;
}

.library-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.library-title {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.library-summary {
  margin: 6px 0 0;
  color: var(--muted-text-color);
}

%btn {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-new {
  @extend %btn;
  background-color: var(--accent-text-color);
  color: var(--accent-contrast-color);

  &:hover {
    border-color: transparent;
    filter: brightness(1.08);
  }
}

.btn-secondary {
  @extend %btn;
  background-color: var(--card-background-color);
  border-color: var(--card-border-color);
  color: inherit;

  &:hover {
    border-color: var(--accent-text-color);
  }
}

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search {
  position: relative;
  flex: 1 1 280px;
  max-width: 420px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--muted-text-color);
}

.search-input,
.sort-select {
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--card-border-color);
  background-color: var(--card-background-color);
  color: inherit;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 0 14px 0 40px;
  box-sizing: border-box;
}

.sort-select {
  padding: 0 12px;
}

.filter-group {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 12px;
  background-color: var(--option-background-color);
}

.filter-button {
  height: 40px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background-color: transparent;
  color: var(--muted-text-color);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: transparent;
    color: inherit;
  }
}

.filter-selected {
  background-color: var(--card-background-color);
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.filter-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-text-color);
}

.sort {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted-text-color);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 20px;
}

.no-results,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 16px;
  border: 1px dashed var(--card-border-color);
  border-radius: 14px;
  text-align: center;
}

.no-results-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.empty-state {
  background-color: var(--card-background-color);
}

.empty-neck {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  width: 200px;
  height: 72px;
  background-color: var(--neck-background-color);
  background-image: repeating-linear-gradient(to bottom, var(--string-color) 0, var(--string-color) 1px, transparent 1px, transparent 14px);
  background-position: 0 6px;
  border-left: 3px solid var(--nut-color);
}

.empty-fret {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--fret-wire-color);
}

.empty-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px dashed var(--accent-text-color);
}

.empty-copy {
  max-width: 440px;
}

.empty-title {
  margin: 0;
  font-size: 20px;
  font-weight: 650;
}

.empty-text {
  margin: 8px 0 0;
  color: var(--muted-text-color);
}

.empty-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.library-page button:focus-visible,
.search-input:focus-visible,
.sort-select:focus-visible {
  outline: 2px solid var(--accent-text-color);
  outline-offset: 2px;
}

@media (max-width: $phone) {
  .library-page {
    padding: 1.25rem 1rem;
  }

  .library-title {
    font-size: 26px;
  }

  .search {
    max-width: none;
    flex-basis: 100%;
  }

  .filter-group {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-button {
    justify-content: center;
  }

  .sort {
    margin-left: 0;
  }
}
</style>
