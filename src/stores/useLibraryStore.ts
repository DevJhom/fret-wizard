import { defineStore } from 'pinia'
import _ from 'lodash'
import { Setup } from '@data/constants'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'
import { createLibraryCard, deleteLibraryCard, fetchLibraryCards, updateLibraryCard } from '@services/customizerService'
import type { LibraryCard, LibraryCardPatch } from '@services/adapters/localStorageAdapter'

export type { LibraryCard }

export const useLibraryStore = defineStore('library', {
  state: () => ({
    cards: [] as LibraryCard[],
    isLoaded: false,
  }),
  actions: {
    async loadCards() {
      this.cards = (await fetchLibraryCards()) ?? []
      this.isLoaded = true
    },
    async ensureLoaded() {
      if (!this.isLoaded) await this.loadCards()
    },
    reset() {
      this.cards = []
      this.isLoaded = false
    },
    async createCard(name: string, setup: Setup = Setup.Scale, fretboards: FretboardData[] = [defaultDataFor(setup)]): Promise<LibraryCard | undefined> {
      await this.ensureLoaded()
      try {
        const card = await createLibraryCard({ name, setup, fretboards: _.cloneDeep(fretboards) })
        this.cards.push(card)
        return card
      } catch (error) {
        console.log('createCard: ', error)
        return undefined
      }
    },
    async deleteCard(id: string) {
      try {
        await deleteLibraryCard(id)
      } catch (error) {
        console.log('deleteCard: ', error)
        return
      }
      this.cards = this.cards.filter(c => c.id !== id)
    },
    async renameCard(id: string, newName: string) {
      await this.updateCard(id, { name: newName })
    },
    async updateCardFretboards(id: string, fretboards: FretboardData[]) {
      await this.ensureLoaded()
      await this.updateCard(id, { fretboards: _.cloneDeep(fretboards) })
    },
    async updateCard(id: string, patch: LibraryCardPatch) {
      if (!this.cards.some(c => c.id === id)) return
      try {
        const updated = await updateLibraryCard(id, patch)
        if (updated) this.cards = this.cards.map(c => (c.id === id ? updated : c))
      } catch (error) {
        console.log('updateCard: ', error)
      }
    },
  },
})
