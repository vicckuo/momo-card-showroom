import { beforeEach, describe, expect, it } from 'vitest'
import { clearVariantsForTest, normalizeCard, registerCardVariant } from './registry'
import { standardVariant } from './variants/standard'
import { seedCards } from '../data/seed'

describe('card registry', () => {
  beforeEach(() => {
    clearVariantsForTest()
    registerCardVariant(standardVariant)
  })

  it('rejects registering the same variant twice, so a plugin cannot silently replace a built-in card', () => {
    expect(() => registerCardVariant(standardVariant)).toThrow(/already registered/)
  })

  it('accepts a valid seed card unchanged', () => {
    expect(normalizeCard(seedCards[0])).toEqual(seedCards[0])
  })

  it('drops a card whose variant is not registered, instead of rendering an unknown component', () => {
    expect(normalizeCard({ ...seedCards[0], variant: 'removed-plugin' })).toBeNull()
  })

  it('repairs only the broken option and keeps the user’s other edits', () => {
    const tampered = { ...seedCards[0], options: { ...seedCards[0].options, accentColor: 'red', layout: 'horizontal' } }
    const card = normalizeCard(tampered)
    expect(card?.options.accentColor).toBe(standardVariant.defaults.accentColor)
    expect(card?.options.layout).toBe('horizontal')
  })

  it('fills options added in a newer version with defaults, so old saved data still loads', () => {
    const { tag: _removed, ...olderOptions } = seedCards[0].options as Record<string, unknown>
    const card = normalizeCard({ ...seedCards[0], options: olderOptions })
    expect(card?.options.tag).toBe('')
  })

  it('rejects a card with an invalid product (negative price)', () => {
    const bad = { ...seedCards[0], product: { ...seedCards[0].product, price: -1 } }
    expect(normalizeCard(bad)).toBeNull()
  })
})
