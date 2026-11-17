import { describe, expect, it } from 'vitest'
import { discountLabel } from './flashSale'

describe('discountLabel (台灣「折」的寫法)', () => {
  it('rounds up so the badge never claims a bigger discount than the real one', () => {
    // 2211 / 5800 = 0.3812。真站文案寫「38折」（向下取），這裡刻意進位成 3.9折：
    // 向下取會讓折扣看起來比實際更好，見 README 取捨說明
    expect(discountLabel(2211, 5800)).toBe('3.9折')
    expect(discountLabel(1999, 4399)).toBe('4.6折')
  })

  it('drops the trailing .0 (5折, not 5.0折)', () => {
    expect(discountLabel(500, 1000)).toBe('5折')
  })

  it('shows no badge when there is no real discount', () => {
    expect(discountLabel(100, undefined)).toBeNull()
    expect(discountLabel(100, 100)).toBeNull()
    expect(discountLabel(100, 80)).toBeNull()
  })
})
