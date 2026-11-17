import { readonly, ref } from 'vue'
import type { CardInstance } from '../cards/schema'
import { seedCards } from '../data/seed'
import { clearCards, loadCards, saveCards, subscribeToExternalChanges } from './storage'

/**
 * showroom 的唯一狀態來源。所有寫入都經過這裡 → storage.ts，
 * 外部分頁的改動透過 storage event 重新載入，避免兩份狀態分岔。
 */
const cards = ref<CardInstance[]>(loadCards(window.localStorage, seedCards))
const saveFailed = ref(false)

subscribeToExternalChanges(() => {
  cards.value = loadCards(window.localStorage, seedCards)
})

function persist(next: CardInstance[]): void {
  cards.value = next
  saveFailed.value = !saveCards(window.localStorage, next)
}

export function useCards() {
  function updateCard(id: string, patch: { product?: Partial<CardInstance['product']>; options?: Record<string, unknown> }): void {
    persist(
      cards.value.map((card) =>
        card.id === id
          ? {
              ...card,
              product: { ...card.product, ...patch.product },
              options: { ...card.options, ...patch.options },
            }
          : card,
      ),
    )
  }

  function resetCard(id: string): void {
    const original = seedCards.find((card) => card.id === id)
    if (original) persist(cards.value.map((card) => (card.id === id ? original : card)))
  }

  function resetAll(): void {
    clearCards(window.localStorage)
    cards.value = [...seedCards]
  }

  return { cards: readonly(cards), saveFailed: readonly(saveFailed), updateCard, resetCard, resetAll }
}
