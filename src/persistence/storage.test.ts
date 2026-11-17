import { beforeEach, describe, expect, it } from 'vitest'
import { clearVariantsForTest } from '../cards/registry'
import { registerBuiltinVariants } from '../cards'
import { seedCards } from '../data/seed'
import { loadCards, saveCards, SCHEMA_VERSION, STORAGE_KEY, type KeyValueStore } from './storage'

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = v },
    removeItem: (k) => { delete data[k] },
  }
}

describe('card persistence', () => {
  beforeEach(() => {
    clearVariantsForTest()
    registerBuiltinVariants()
  })

  it('round-trips user edits, which is the whole point of browser-side persistence', () => {
    const store = memoryStore()
    const edited = seedCards.map((c) => ({ ...c, product: { ...c.product, price: 999 } }))
    saveCards(store, edited)
    expect(loadCards(store, seedCards)).toEqual(edited)
  })

  it('falls back to seed on corrupted JSON instead of crashing the showroom', () => {
    const store = memoryStore({ [STORAGE_KEY]: '{not json' })
    expect(loadCards(store, seedCards)).toEqual(seedCards)
  })

  it('does not guess at data written by a newer app version', () => {
    const store = memoryStore({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, cards: [] }) })
    expect(loadCards(store, seedCards)).toEqual(seedCards)
  })

  it('replaces one broken card with its seed and keeps the other edited cards', () => {
    const editedSecond = { ...seedCards[1], product: { ...seedCards[1].product, price: 1 } }
    const broken = { ...seedCards[0], product: { ...seedCards[0].product, title: '' } }
    const store = memoryStore({
      [STORAGE_KEY]: JSON.stringify({ schemaVersion: SCHEMA_VERSION, cards: [broken, editedSecond] }),
    })
    expect(loadCards(store, seedCards).slice(0, 2)).toEqual([seedCards[0], editedSecond])
  })

  it('still renders when storage access throws (private mode / blocked site data)', () => {
    const throwing: KeyValueStore = {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => { throw new Error('QuotaExceededError') },
      removeItem: () => {},
    }
    expect(loadCards(throwing, seedCards)).toEqual(seedCards)
    expect(saveCards(throwing, seedCards)).toBe(false)
  })

  it('shows cards added in a newer release to users who already have saved edits', () => {
    const editedFirst = { ...seedCards[0], product: { ...seedCards[0].product, price: 1 } }
    const store = memoryStore({
      [STORAGE_KEY]: JSON.stringify({ schemaVersion: SCHEMA_VERSION, cards: [editedFirst] }),
    })
    const loaded = loadCards(store, seedCards)
    expect(loaded[0]).toEqual(editedFirst)
    expect(loaded.map((c) => c.id)).toEqual(seedCards.map((c) => c.id))
  })
})
