import { defineCustomElement } from 'vue'
import cardsCss from '../cards/cards.css?inline'
import '../cards'
import MomoCardElement from './MomoCardElement.vue'

// 卡片樣式注入 shadow DOM：與 app 用同一份 cards.css，外部頁面的 CSS 不會干擾卡片
const hostCss = ':host{display:block}'
// SFC 型別不含 styles 欄位，但 defineCustomElement 執行時會讀它注入 shadow root
const withStyles = Object.assign({}, MomoCardElement, { styles: [cardsCss, hostCss] }) as typeof MomoCardElement
const MomoCard = defineCustomElement(withStyles)

if (!customElements.get('momo-card')) {
  customElements.define('momo-card', MomoCard)
}
