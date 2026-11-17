import type { CardInstance } from '../cards/schema'
import { placeholderImage } from './placeholder'

/**
 * Mock 商品：結構依 momo 真站觀察（docs/DESIGN.md §1），品牌與商品為虛構。
 * 每個 variant 至少一張，作為 showroom 初始內容與「重設」的目標。
 */
export const seedCards: readonly CardInstance[] = [
  {
    id: 'detergent-capsule',
    variant: 'standard',
    product: {
      title: '4D 抗菌洗衣膠囊 240 顆（抗菌去漬 / 室內晾衣）',
      brand: '潔淨家',
      imageUrl: placeholderImage('洗衣膠囊', 200),
      price: 1299,
      originalPrice: 2316,
      promoText: '滿1件折480',
      ratingCount: 20379,
      salesLabel: '總銷量>20萬',
    },
    options: { layout: 'vertical', accentColor: '#d6006f', showOriginalPrice: true, showMeta: true, tag: '登記' },
  },
  {
    id: 'ear-thermometer',
    variant: 'standard',
    product: {
      title: '紅外線耳溫槍 附耳套 21 入 + 保護盒 二年保固',
      brand: '安康',
      imageUrl: placeholderImage('耳溫槍', 160),
      price: 2411,
      originalPrice: 4980,
      promoText: '+送日式牙刷4入組',
      ratingCount: 0,
      salesLabel: '',
    },
    options: { layout: 'horizontal', accentColor: '#d6006f', showOriginalPrice: true, showMeta: false, tag: '' },
  },
]
