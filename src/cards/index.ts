import { registerCardVariant, getVariant, type CardVariant } from './registry'
import { standardVariant } from './variants/standard'
import { flashSaleVariant } from './variants/flashSale'
import { rankingVariant } from './variants/ranking'

function registerOnce<O extends Record<string, unknown>>(variant: CardVariant<O>): void {
  if (!getVariant(variant.type)) registerCardVariant(variant)
}

/** 內建 variant 的唯一註冊處。可重複呼叫（測試清空註冊表後會再呼叫）。 */
export function registerBuiltinVariants(): void {
  registerOnce(standardVariant)
  registerOnce(flashSaleVariant)
  registerOnce(rankingVariant)
}

// import 這個模組即完成註冊：任何讀資料的程式只要 import 它，就不會遇到「還沒註冊」的順序問題
registerBuiltinVariants()
