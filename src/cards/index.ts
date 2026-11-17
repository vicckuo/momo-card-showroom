import { registerCardVariant, getVariant, type CardVariant } from './registry'
import { standardVariant } from './variants/standard'
import { flashSaleVariant } from './variants/flashSale'
import { rankingVariant } from './variants/ranking'

function registerOnce<O extends Record<string, unknown>>(variant: CardVariant<O>): void {
  if (!getVariant(variant.type)) registerCardVariant(variant)
}

/**
 * 內建 variant 的唯一註冊處。app 與 web component 都從這裡初始化，
 * 確保兩邊認得的卡片種類一致。可重複呼叫。
 */
export function registerBuiltinVariants(): void {
  registerOnce(standardVariant)
  registerOnce(flashSaleVariant)
  registerOnce(rankingVariant)
}
