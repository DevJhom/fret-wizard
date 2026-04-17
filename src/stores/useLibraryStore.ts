import { defineStore } from 'pinia'
import { defaultData, FretboardData } from '@stores/usePatternStore'
import { fetchLibraryCards, saveLibraryCards } from '@services/customizerService'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'

export type { LibraryCard }

export const useLibraryStore = defineStore('library', {
  state: () => ({
    cards: [] as LibraryCard[],
  }),
  actions: {
    async loadCards() {
      const saved = await fetchLibraryCards()
      if (saved) this.cards = saved
    },
    async createCard(name: string) {
      const card: LibraryCard = {
        id: crypto.randomUUID(),
        name,
        data: structuredClone(defaultData),
        createdAt: Date.now(),
      }
      this.cards.push(card)
      await saveLibraryCards(this.cards)
    },
    async deleteCard(id: string) {
      this.cards = this.cards.filter(c => c.id !== id)
      await saveLibraryCards(this.cards)
    },
    async renameCard(id: string, newName: string) {
      const card = this.cards.find(c => c.id === id)
      if (card) {
        card.name = newName
        await saveLibraryCards(this.cards)
      }
    },
    async updateCardData(id: string, data: FretboardData) {
      const card = this.cards.find(c => c.id === id)
      if (card) {
        card.data = structuredClone(data)
        await saveLibraryCards(this.cards)
      }
    },
  },
})
