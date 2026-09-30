import { defineStore } from 'pinia'
import _ from 'lodash'
import { Setup } from '@data/constants'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'
import { fetchLibraryCards, saveLibraryCards } from '@services/customizerService'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'

export type { LibraryCard }

export const useLibraryStore = defineStore('library', {
  state: () => ({
    cards: [] as LibraryCard[],
    activeCardId: null as string | null,
    isLoaded: false,
  }),
  getters: {
    activeCard: (state): LibraryCard | undefined => state.cards.find(c => c.id === state.activeCardId),
  },
  actions: {
    async loadCards() {
      const saved = await fetchLibraryCards()
      if (saved) this.cards = saved
      this.isLoaded = true
    },
    async ensureLoaded() {
      if (!this.isLoaded) await this.loadCards()
    },
    async createCard(name: string, setup: Setup = Setup.Scale, fretboards: FretboardData[] = [defaultDataFor(setup)]) {
      await this.ensureLoaded()
      const card: LibraryCard = {
        id: crypto.randomUUID(),
        name,
        setup,
        fretboards: _.cloneDeep(fretboards),
        createdAt: Date.now(),
      }
      this.cards.push(card)
      await saveLibraryCards(this.cards)
      return card
    },
    async deleteCard(id: string) {
      this.cards = this.cards.filter(c => c.id !== id)
      if (this.activeCardId === id) this.activeCardId = null
      await saveLibraryCards(this.cards)
    },
    async renameCard(id: string, newName: string) {
      const card = this.cards.find(c => c.id === id)
      if (card) {
        card.name = newName
        await saveLibraryCards(this.cards)
      }
    },
    async updateCardFretboards(id: string, fretboards: FretboardData[]) {
      await this.ensureLoaded()
      const card = this.cards.find(c => c.id === id)
      if (card) {
        card.fretboards = _.cloneDeep(fretboards)
        await saveLibraryCards(this.cards)
      }
    },
  },
})
