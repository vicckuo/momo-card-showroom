import { defineCustomElement } from 'vue'
import cardsCss from '../cards/cards.css?inline'
import { registerBuiltinVariants } from '../cards'
import MomoCardElement from './MomoCardElement.vue'

registerBuiltinVariants()

// 卡片樣式注入 shadow DOM：與 app 用同一份 cards.css，外部頁面的 CSS 不會干擾卡片
const unknownCss = '.mc-unknown{padding:12px;border:1px dashed #e60012;color:#e60012;font-size:13px}:host{display:block}'
// SFC 型別不含 styles 欄位，但 defineCustomElement 執行時會讀它注入 shadow root
const withStyles = Object.assign({}, MomoCardElement, { styles: [cardsCss, unknownCss] }) as typeof MomoCardElement
const MomoCard = defineCustomElement(withStyles)

if (!customElements.get('momo-card')) {
  customElements.define('momo-card', MomoCard)
}
