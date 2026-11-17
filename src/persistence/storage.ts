import { normalizeCard } from '../cards/registry'
import type { CardInstance } from '../cards/schema'

export const STORAGE_KEY = 'momo-card-showroom'
/** 儲存格式版本。格式改變時 +1，並在 migrate() 補上轉換。 */
export const SCHEMA_VERSION = 1

interface Persisted {
  schemaVersion: number
  cards: unknown[]
}

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * 讀取卡片。localStorage 視為不可信輸入：
 * - 沒資料 / 壞 JSON / 未知版本 → 回 seed
 * - 個別壞卡 → 用同 id 的 seed 取代；沒有對應 seed 就丟棄
 * - 讀取時拋錯（隱私模式、被封鎖）→ 回 seed，頁面照常顯示
 */
export function loadCards(store: KeyValueStore, seed: readonly CardInstance[]): CardInstance[] {
  const raw = safeRead(store)
  if (raw === null) return [...seed]

  const persisted = parse(raw)
  if (!persisted) return [...seed]

  const migrated = migrate(persisted)
  if (!migrated) return [...seed]

  const seedById = new Map(seed.map((card) => [card.id, card]))
  return migrated.cards.flatMap((rawCard) => {
    const card = normalizeCard(rawCard)
    if (card) return [card]
    const fallback = seedById.get(idOf(rawCard))
    return fallback ? [fallback] : []
  })
}

export function saveCards(store: KeyValueStore, cards: readonly CardInstance[]): boolean {
  const payload: Persisted = { schemaVersion: SCHEMA_VERSION, cards: [...cards] }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch (error) {
    // 配額滿或被封鎖：不讓編輯器整頁壞掉，交給 UI 顯示「未儲存」
    console.warn('[momo-card] save failed', error)
    return false
  }
}

export function clearCards(store: KeyValueStore): void {
  try {
    store.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[momo-card] clear failed', error)
  }
}

/** 其他分頁（或 sample.html）改了資料時通知；回傳取消訂閱函式。 */
export function subscribeToExternalChanges(onChange: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

function safeRead(store: KeyValueStore): string | null {
  try {
    return store.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function parse(raw: string): Persisted | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (
      typeof value === 'object' && value !== null &&
      typeof (value as Persisted).schemaVersion === 'number' &&
      Array.isArray((value as Persisted).cards)
    ) {
      return value as Persisted
    }
    return null
  } catch {
    return null
  }
}

/** 版本遷移入口。目前只有 v1；比現在新的版本（使用者降版）不猜，直接回 seed。 */
function migrate(persisted: Persisted): Persisted | null {
  if (persisted.schemaVersion === SCHEMA_VERSION) return persisted
  return null
}

function idOf(rawCard: unknown): string {
  return typeof rawCard === 'object' && rawCard !== null && typeof (rawCard as { id?: unknown }).id === 'string'
    ? (rawCard as { id: string }).id
    : ''
}
