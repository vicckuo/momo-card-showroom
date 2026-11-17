import { readonly, ref } from 'vue'
import type { CardInstance } from '../cards/schema'
import { seedCards } from '../data/seed'
import { clearCards, loadCards, saveCards, subscribeToExternalChanges } from './storage'

/**
 * showroom 的唯一狀態來源。所有寫入都經過這裡 → storage.ts，
 * 外部分頁的改動透過 storage event 重新載入，避免兩份狀態分岔。
 *
 * 延遲到第一次 useCards() 才讀 storage：若在 import 時就讀，
 * 會早於 main.ts 的 registerBuiltinVariants()（ES module 的 import 先執行），
 * 所有存檔都被當成未知 variant 而回退成 seed，下一次編輯再把 seed 寫回去覆蓋使用者資料。
 */
const cards = ref<CardInstance[]>([])
const saveFailed = ref(false)
let loaded = false

function ensureLoaded(): void {
  if (loaded) return
  loaded = true
  cards.value = loadCards(window.localStorage, seedCards)
  subscribeToExternalChanges(() => {
    cards.value = loadCards(window.localStorage, seedCards)
  })
}

function persist(next: CardInstance[]): void {
  cards.value = next
  saveFailed.value = !saveCards(window.localStorage, next)
}

export function useCards() {
  ensureLoaded()

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
