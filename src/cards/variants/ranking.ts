import { z } from 'zod'
import type { CardVariant } from '../registry'
import { accentColorField, hexColorSchema, hiddenWhenMetaOff, showMetaField } from './shared'
import RankingCard from './RankingCard.vue'

/** 排行卡：真站特徵為 TOP N 名次徽章與商品類型標籤（如「電子票券★即買即用」）。 */
export const rankingOptionsSchema = z.object({
  accentColor: hexColorSchema,
  rank: z.number().int().min(1).max(99),
  categoryLabel: z.string(),
  showMeta: z.boolean(),
})

export type RankingOptions = z.infer<typeof rankingOptionsSchema>

export const rankingVariant: CardVariant<RankingOptions> = {
  type: 'ranking',
  label: '排行卡',
  optionsSchema: rankingOptionsSchema,
  defaults: { accentColor: '#d6006f', rank: 1, categoryLabel: '', showMeta: true },
  fields: [
    accentColorField,
    { key: 'rank', label: '名次', kind: 'number', min: 1, max: 99 },
    { key: 'categoryLabel', label: '類型標籤', kind: 'text' },
    showMetaField,
  ],
  component: RankingCard,
  hiddenProductFields: hiddenWhenMetaOff,
}
