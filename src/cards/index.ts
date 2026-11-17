import { registerCardVariant, getVariant } from './registry'
import { standardVariant } from './variants/standard'

/**
 * 內建 variant 的唯一註冊處。app 與 web component 都從這裡初始化，
 * 確保兩邊認得的卡片種類一致。可重複呼叫。
 */
export function registerBuiltinVariants(): void {
  for (const variant of [standardVariant]) {
    if (!getVariant(variant.type)) registerCardVariant(variant)
  }
}
