import { z } from 'zod'
import type { FieldDef } from '../registry'
import type { Product } from '../schema'

/** 各 variant 共用的選項定義，避免同一條規則複製三份。 */
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)

export const accentColorField: FieldDef = { key: 'accentColor', label: '主題色', kind: 'color' }
export const showMetaField: FieldDef = { key: 'showMeta', label: '顯示評價 / 銷量', kind: 'boolean' }

const META_FIELDS: readonly (keyof Product)[] = ['ratingCount', 'salesLabel']

/** showMeta 關閉時，評價數與銷量文字不會出現在卡片上。 */
export function hiddenWhenMetaOff(options: { showMeta: boolean }): readonly (keyof Product)[] {
  return options.showMeta ? [] : META_FIELDS
}
