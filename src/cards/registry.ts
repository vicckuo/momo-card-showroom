import type { Component } from 'vue'
import type { z } from 'zod'
import { cardInstanceSchema, type CardInstance, type Product } from './schema'

/** 編輯器欄位定義：編輯器依此自動產生控制項，新 variant 不用寫編輯器。 */
export type FieldDef =
  | { key: string; label: string; kind: 'text' }
  | { key: string; label: string; kind: 'number'; min?: number; max?: number; optional?: boolean }
  | { key: string; label: string; kind: 'boolean' }
  | { key: string; label: string; kind: 'select'; choices: readonly string[] }
  | { key: string; label: string; kind: 'color' }

export interface CardVariant<O extends Record<string, unknown> = Record<string, unknown>> {
  type: string
  label: string
  optionsSchema: z.ZodType<O>
  defaults: O
  fields: readonly FieldDef[]
  component: Component
  /** 依目前選項，這張卡不會顯示哪些商品欄位。編輯器據此提示，避免「改了沒反應」。 */
  hiddenProductFields?: (options: O) => readonly (keyof Product)[]
}

const variants = new Map<string, CardVariant>()

/** 擴充點：新增一種商品卡 = 呼叫一次 registerCardVariant，不改核心程式。 */
export function registerCardVariant<O extends Record<string, unknown>>(variant: CardVariant<O>): void {
  if (variants.has(variant.type)) {
    throw new Error(`Card variant "${variant.type}" is already registered`)
  }
  variants.set(variant.type, variant as unknown as CardVariant)
}

export function getVariant(type: string): CardVariant | undefined {
  return variants.get(type)
}

export function listVariants(): CardVariant[] {
  return [...variants.values()]
}

/** 測試用：清空註冊表。 */
export function clearVariantsForTest(): void {
  variants.clear()
}

/**
 * 把不可信的資料（localStorage、外部屬性）轉成合法卡片。
 * - 結構錯誤或未知 variant → null（由呼叫端決定丟棄或回預設）
 * - options 欄位錯誤 → 用 variant 預設值補，並保留其他合法欄位
 */
export function normalizeCard(raw: unknown): CardInstance | null {
  const parsed = cardInstanceSchema.safeParse(raw)
  if (!parsed.success) return null

  const variant = getVariant(parsed.data.variant)
  if (!variant) return null

  return { ...parsed.data, options: normalizeOptions(variant, parsed.data.options) }
}

function normalizeOptions(variant: CardVariant, options: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...variant.defaults, ...options }
  const whole = variant.optionsSchema.safeParse(merged)
  if (whole.success) return whole.data

  // 逐欄位回退：壞掉的欄位用預設值，不讓一個欄位毀掉整張卡的設定
  const repaired = Object.fromEntries(
    Object.keys(variant.defaults).map((key) => {
      const candidate = { ...variant.defaults, [key]: options[key] }
      const ok = variant.optionsSchema.safeParse(candidate).success
      return [key, ok ? options[key] : variant.defaults[key]]
    }),
  )
  return variant.optionsSchema.parse(repaired)
}
