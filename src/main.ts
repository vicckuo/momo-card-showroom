import { createApp } from 'vue'
import App from './App.vue'
import { registerBuiltinVariants } from './cards'
import { router } from './router'
import './cards/cards.css'
import './style.css'

registerBuiltinVariants()
createApp(App).use(router).mount('#app')
