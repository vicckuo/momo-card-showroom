import { z } from 'zod'
// 讀取前確保內建 variant 已註冊（import 即註冊），與呼叫端的載入順序無關
import '../cards'
import { normalizeCard } from '../cards/registry'
import type { CardInstance } from '../cards/schema'

export const STORAGE_KEY = 'momo-card-showroom'
/** 儲存格式版本。格式改變時 +1，並在 migrate() 補上轉換。 */
export const SCHEMA_VERSION = 1

const persistedSchema = z.object({ schemaVersion: z.number(), cards: z.array(z.unknown()) })
type Persisted = z.infer<typeof persistedSchema>
const cardIdSchema = z.object({ id: z.string() })

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * 讀取卡片。localStorage 視為不可信輸入：
 * - 沒資料 / 壞 JSON / 未知版本 → 回 seed
 * - 個別壞卡 → 用同 id 的 seed 取代；沒有對應 seed 就丟棄
 * - seed 有、存檔沒有的卡（新版本新增）→ 補在最後
 * - 讀取時拋錯（隱私模式、被封鎖）→ 回 seed，頁面照常顯示
 */
export function loadCards(store: KeyValueStore, seed: readonly CardInstance[]): CardInstance[] {
  return cardsFromRaw(safeRead(store), seed)
}

/**
 * 同一頁有很多 <momo-card> 時共用解析結果：storage 字串沒變就回傳同一個陣列，
 * 不必每張卡都重新 JSON.parse + 驗證全部卡片；回傳同一個物件也讓沒變的卡不會重新渲染。
 */
let sharedCache: { raw: string | null; seed: readonly CardInstance[]; cards: CardInstance[] } | null = null

export function loadCardsShared(store: KeyValueStore, seed: readonly CardInstance[]): CardInstance[] {
  const raw = safeRead(store)
  if (sharedCache && sharedCache.raw === raw && sharedCache.seed === seed) return sharedCache.cards
  const cards = cardsFromRaw(raw, seed)
  sharedCache = { raw, seed, cards }
  return cards
}

/** 瀏覽器的 localStorage；被封鎖（隱私模式、站台資料停用）時改用不保存的空 store。 */
export function browserStore(): KeyValueStore {
  try {
    return window.localStorage
  } catch {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }
}

function cardsFromRaw(raw: string | null, seed: readonly CardInstance[]): CardInstance[] {
  if (raw === null) return [...seed]

  const persisted = parse(raw)
  if (!persisted) return [...seed]

  const migrated = migrate(persisted)
  if (!migrated) return [...seed]

  const seedById = new Map(seed.map((card) => [card.id, card]))
  const stored = migrated.cards.flatMap((rawCard) => {
    const card = normalizeCard(rawCard)
    if (card) return [card]
    const fallback = seedById.get(idOf(rawCard))
    return fallback ? [fallback] : []
  })

  // 新版本加入的 seed 卡片要出現在舊使用者畫面上，不能被舊存檔「蓋掉」
  const storedIds = new Set(stored.map((card) => card.id))
  const added = seed.filter((card) => !storedIds.has(card.id))
  return [...stored, ...added]
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
    const result = persistedSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : null
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
  const result = cardIdSchema.safeParse(rawCard)
  return result.success ? result.data.id : ''
}
