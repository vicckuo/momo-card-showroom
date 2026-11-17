import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FlashSaleCard from './FlashSaleCard.vue'
import { flashSaleVariant } from './flashSale'
import { seedCards } from '../../data/seed'

const product = { ...seedCards[3].product, ratingCount: 321, salesLabel: '總銷量>5千' }

describe('FlashSaleCard meta visibility', () => {
  it('hides rating / sales by default, matching the live flash-sale cards', () => {
    const wrapper = mount(FlashSaleCard, { props: { product, options: flashSaleVariant.defaults } })
    expect(wrapper.find('.mc-card__meta').exists()).toBe(false)
  })

  it('shows rating / sales once the option is on, so editor input is not silently swallowed', () => {
    const wrapper = mount(FlashSaleCard, {
      props: { product, options: { ...flashSaleVariant.defaults, showMeta: true } },
    })
    expect(wrapper.find('.mc-card__meta').text()).toContain('321')
    expect(wrapper.find('.mc-card__meta').text()).toContain('總銷量>5千')
  })
})
