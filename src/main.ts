import { createApp } from 'vue'
import App from './App.vue'
import './cards'
import { router } from './router'
import './cards/cards.css'
import './style.css'

createApp(App).use(router).mount('#app')
