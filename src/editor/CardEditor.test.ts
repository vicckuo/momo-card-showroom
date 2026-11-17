import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import '../cards'
import CardEditor from './CardEditor.vue'
import { seedCards } from '../data/seed'

const flashSale = seedCards.find((c) => c.variant === 'flash-sale')!

describe('CardEditor hidden-field hints', () => {
  it('flags rating / sales as not shown while the variant hides them, so edits do not look lost', () => {
    const wrapper = mount(CardEditor, { props: { card: { ...flashSale, options: { ...flashSale.options, showMeta: false } } } })
    expect(wrapper.findAll('.editor__hint')).toHaveLength(2)
  })

  it('removes the hints once the variant shows those fields', () => {
    const wrapper = mount(CardEditor, { props: { card: { ...flashSale, options: { ...flashSale.options, showMeta: true } } } })
    expect(wrapper.findAll('.editor__hint')).toHaveLength(0)
  })
})
