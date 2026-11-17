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
  {
    id: 'perfume-flash',
    variant: 'flash-sale',
    product: {
      title: '經典香水 100ml 多款任選',
      brand: '花漾',
      imageUrl: placeholderImage('香水', 330),
      price: 2211,
      originalPrice: 5800,
      promoText: '限時下殺★再贈原廠禮盒',
      ratingCount: 0,
      salesLabel: '',
    },
    options: { accentColor: '#e60012', priceLabel: '限搶價', remaining: 238, lowStockThreshold: 50, showDiscount: true },
  },
  {
    id: 'pan-flash',
    variant: 'flash-sale',
    product: {
      title: '鈦合金鍛造不沾鍋 28CM',
      brand: '廚藝坊',
      imageUrl: placeholderImage('不沾鍋', 30),
      price: 1999,
      originalPrice: 4399,
      promoText: '限時搶！多款爐具適用',
      ratingCount: 0,
      salesLabel: '',
    },
    options: { accentColor: '#e60012', priceLabel: '限搶價', remaining: 66, lowStockThreshold: 100, showDiscount: true },
  },
  {
    id: 'latte-ticket',
    variant: 'ranking',
    product: {
      title: '大冰經典拿鐵好禮即享券',
      brand: '巷口超商',
      imageUrl: placeholderImage('拿鐵券', 40),
      price: 55,
      promoText: '',
      ratingCount: 25,
      salesLabel: '總銷量>1萬',
    },
    options: { accentColor: '#d6006f', rank: 1, categoryLabel: '電子票券★即買即用', showMeta: true },
  },
]
