import { z } from 'zod'
import type { CardVariant } from '../registry'
import { accentColorField, hexColorSchema, hiddenWhenMetaOff, showMetaField } from './shared'
import StandardCard from './StandardCard.vue'

export const standardOptionsSchema = z.object({
  layout: z.enum(['vertical', 'horizontal']),
  accentColor: hexColorSchema,
  showOriginalPrice: z.boolean(),
  showMeta: z.boolean(),
  tag: z.string().max(10),
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
    accentColorField,
    { key: 'showOriginalPrice', label: '顯示原價', kind: 'boolean' },
    showMetaField,
    { key: 'tag', label: '活動標籤（如：登記）', kind: 'text', maxLength: 10 },
  ],
  component: StandardCard,
  hiddenProductFields: hiddenWhenMetaOff,
  gridSpan: (options) => (options.layout === 'horizontal' ? 2 : 1),
}
