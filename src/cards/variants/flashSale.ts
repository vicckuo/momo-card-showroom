import { z } from 'zod'
import type { CardVariant } from '../registry'
import FlashSaleCard from './FlashSaleCard.vue'

/** 限時搶購卡：真站特徵為「限搶價」前綴、折數、「最後 N 組」稀缺提示。 */
export const flashSaleOptionsSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  priceLabel: z.string(),
  remaining: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  showDiscount: z.boolean(),
  showMeta: z.boolean(),
})

export type FlashSaleOptions = z.infer<typeof flashSaleOptionsSchema>

export const flashSaleVariant: CardVariant<FlashSaleOptions> = {
  type: 'flash-sale',
  label: '限時搶購卡',
  optionsSchema: flashSaleOptionsSchema,
  defaults: {
    accentColor: '#e60012',
    priceLabel: '限搶價',
    remaining: 100,
    lowStockThreshold: 50,
    showDiscount: true,
    showMeta: false,
  },
  fields: [
    { key: 'accentColor', label: '主題色', kind: 'color' },
    { key: 'priceLabel', label: '價格標示', kind: 'text' },
    { key: 'remaining', label: '剩餘組數', kind: 'number', min: 0 },
    { key: 'lowStockThreshold', label: '低庫存門檻', kind: 'number', min: 0 },
    { key: 'showDiscount', label: '顯示折數', kind: 'boolean' },
    { key: 'showMeta', label: '顯示評價 / 銷量', kind: 'boolean' },
  ],
  component: FlashSaleCard,
}

/**
 * 台灣電商的「折」：售價 / 原價 × 10，取一位小數後去掉 .0（如 3.9 折、5 折）。
 * 無條件進位：徽章上的折扣不能比實際更划算（向下取會誇大折扣，有不實廣告疑慮）。
 * 減一個極小值，避免浮點誤差把剛好整數的值（如 50.0000001）多進一位。
 */
export function discountLabel(price: number, originalPrice?: number): string | null {
  if (!originalPrice || originalPrice <= price || price <= 0) return null
  const fold = Math.ceil((price * 100) / originalPrice - 1e-9) / 10
  return `${Number.isInteger(fold) ? fold.toFixed(0) : fold.toFixed(1)}折`
}
