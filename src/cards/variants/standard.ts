import { z } from 'zod'
import type { CardVariant } from '../registry'
import StandardCard from './StandardCard.vue'

export const standardOptionsSchema = z.object({
  layout: z.enum(['vertical', 'horizontal']),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  showOriginalPrice: z.boolean(),
  showMeta: z.boolean(),
  tag: z.string(),
})

export type StandardOptions = z.infer<typeof standardOptionsSchema>

export const standardVariant: CardVariant<StandardOptions> = {
  type: 'standard',
  label: '一般商品卡',
  optionsSchema: standardOptionsSchema,
  defaults: {
    layout: 'vertical',
    accentColor: '#d6006f',
    showOriginalPrice: true,
    showMeta: true,
    tag: '',
  },
  fields: [
    { key: 'layout', label: '版型', kind: 'select', choices: ['vertical', 'horizontal'] },
    { key: 'accentColor', label: '主題色', kind: 'color' },
    { key: 'showOriginalPrice', label: '顯示原價', kind: 'boolean' },
    { key: 'showMeta', label: '顯示評價 / 銷量', kind: 'boolean' },
    { key: 'tag', label: '活動標籤（如：登記）', kind: 'text' },
  ],
  component: StandardCard,
}
