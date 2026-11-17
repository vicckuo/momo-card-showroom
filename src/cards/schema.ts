import { z } from 'zod'

/**
 * 欄位上限：schema 與編輯器共用同一組數字。
 * 數字遠低於 Number.MAX_SAFE_INTEGER（2^53 - 1），避免超大輸入失去整數精度或撐破版面；
 * 存檔若超出上限，載入時會被 schema 擋下並回退，不會讓壞值留在畫面上。
 */
export const LIMITS = {
  price: 9_999_999,
  count: 99_999_999,
  stock: 99_999,
  titleLength: 100,
  shortTextLength: 40,
} as const

const money = z.number().int().nonnegative().max(LIMITS.price)
const shortText = z.string().max(LIMITS.shortTextLength)

/**
 * 商品資料：所有卡片 variant 共用。
 * 這是單一事實來源，TypeScript 型別由 schema 推導，避免型別與驗證規則分岔。
 */
export const productSchema = z.object({
  title: z.string().min(1).max(LIMITS.titleLength),
  brand: shortText,
  imageUrl: z.string(),
  price: money,
  originalPrice: money.optional(),
  promoText: shortText,
  ratingCount: z.number().int().nonnegative().max(LIMITS.count),
  salesLabel: shortText,
})

export type Product = z.infer<typeof productSchema>

/**
 * 卡片實例：哪個商品、用哪種 variant、variant 自己的選項。
 * options 在這層只確認是物件，細節交給各 variant 的 optionsSchema 驗證，
 * 這樣新增 variant 不需要改這個檔案。
 */
export const cardInstanceSchema = z.object({
  id: z.string().min(1),
  variant: z.string().min(1),
  product: productSchema,
  options: z.record(z.string(), z.unknown()),
})

export type CardInstance = z.infer<typeof cardInstanceSchema>

/** 一次編輯的內容：商品欄位與 variant 選項各自部分更新。 */
export interface CardPatch {
  product?: Partial<Product>
  options?: Record<string, unknown>
}
