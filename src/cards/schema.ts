import { z } from 'zod'

/**
 * 商品資料：所有卡片 variant 共用。
 * 這是單一事實來源，TypeScript 型別由 schema 推導，避免型別與驗證規則分岔。
 */
export const productSchema = z.object({
  title: z.string().min(1),
  brand: z.string(),
  imageUrl: z.string(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  promoText: z.string(),
  ratingCount: z.number().int().nonnegative(),
  salesLabel: z.string(),
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
