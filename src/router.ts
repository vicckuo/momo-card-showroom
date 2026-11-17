import { createRouter, createWebHashHistory } from 'vue-router'
import ShowroomView from './views/ShowroomView.vue'
import CardDetailView from './views/CardDetailView.vue'

// hash history：打包後放任何靜態主機都不需要設定 fallback
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: ShowroomView },
    { path: '/card/:id', component: CardDetailView, props: true },
  ],
})
