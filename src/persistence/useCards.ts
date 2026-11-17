import { readonly, ref } from 'vue'
import type { CardInstance, CardPatch } from '../cards/schema'
import { seedCards } from '../data/seed'
import { browserStore, clearCards, loadCards, saveCards, subscribeToExternalChanges } from './storage'

/**
 * showroom 的唯一狀態來源。所有寫入都經過這裡 → storage.ts，
 * 外部分頁的改動透過 storage event 重新載入，避免兩份狀態分岔。
 *
 * 註冊順序的問題已在根源處理（storage.ts import 即保證 variant 已註冊）。
 * 這裡仍延遲到第一次 useCards() 才讀 storage：只有用到卡片的頁面才付讀取成本，
 * 測試也能在呼叫前準備好 storage。
 */
const cards = ref<CardInstance[]>([])
const saveFailed = ref(false)
let loaded = false

function ensureLoaded(): void {
  if (loaded) return
  loaded = true
  cards.value = loadCards(browserStore(), seedCards)
  subscribeToExternalChanges(() => {
    cards.value = loadCards(browserStore(), seedCards)
  })
}

function persist(next: CardInstance[]): void {
  cards.value = next
  saveFailed.value = !saveCards(browserStore(), next)
}

export function useCards() {
  ensureLoaded()

  function updateCard(id: string, patch: CardPatch): void {
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
    clearCards(browserStore())
    cards.value = [...seedCards]
  }

  return { cards: readonly(cards), saveFailed: readonly(saveFailed), updateCard, resetCard, resetAll }
}
