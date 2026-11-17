import { describe, expect, it } from 'vitest'
// 靜態 import：模擬 main.ts 的情況——模組在註冊 variant 之前就被載入
import { useCards } from './useCards'
import { registerBuiltinVariants } from '../cards'
import { seedCards } from '../data/seed'
import { SCHEMA_VERSION, STORAGE_KEY } from './storage'

describe('useCards', () => {
  it('keeps saved edits across reloads even though the module is imported before variants are registered', () => {
    const edited = { ...seedCards[3], product: { ...seedCards[3].product, ratingCount: 321 } }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, cards: [edited] }))
    registerBuiltinVariants() // main.ts 的順序：import 完才註冊

    const { cards } = useCards()

    expect(cards.value.find((c) => c.id === edited.id)?.product.ratingCount).toBe(321)
  })
})
