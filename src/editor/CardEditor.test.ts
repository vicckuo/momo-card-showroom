import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import '../cards'
import CardEditor from './CardEditor.vue'
import { seedCards } from '../data/seed'
import { LIMITS } from '../cards/schema'

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

describe('CardEditor input limits', () => {
  const mountFlash = () => mount(CardEditor, { props: { card: flashSale } })
  const inputFor = (wrapper: ReturnType<typeof mountFlash>, label: string) =>
    wrapper.findAll('label').find((l) => l.text().startsWith(label))!.find('input')

  it('clamps a huge price to the limit instead of storing a value beyond safe integer precision', async () => {
    const wrapper = mountFlash()
    const price = inputFor(wrapper, '售價')
    await price.setValue('100000000000000000000') // 1e20 > Number.MAX_SAFE_INTEGER
    expect(wrapper.emitted('update')!.at(-1)).toEqual([{ product: { price: LIMITS.price } }])
    expect((price.element as HTMLInputElement).value).toBe(String(LIMITS.price))
  })

  it('clamps option numbers to the bounds the variant declares', async () => {
    const wrapper = mountFlash()
    await inputFor(wrapper, '剩餘組數').setValue('-5')
    expect(wrapper.emitted('update')!.at(-1)).toEqual([{ options: { remaining: 0 } }])
  })

  it('cuts text at the field max length', async () => {
    const wrapper = mountFlash()
    await inputFor(wrapper, '商品名稱').setValue('長'.repeat(LIMITS.titleLength + 50))
    const patch = wrapper.emitted('update')!.at(-1)![0] as { product: { title: string } }
    expect(patch.product.title).toHaveLength(LIMITS.titleLength)
  })
})
