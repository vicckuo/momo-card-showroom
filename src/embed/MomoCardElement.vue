<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import CardRenderer from '../cards/CardRenderer.vue'
import { normalizeCard } from '../cards/registry'
import type { CardInstance } from '../cards/schema'
import { seedCards } from '../data/seed'
import { loadCards, subscribeToExternalChanges } from '../persistence/storage'

/**
 * <momo-card card-id="..."> ：讀 showroom 存在 localStorage 的同一份資料（同網域）。
 * <momo-card config='{...}'> ：直接帶入完整卡片 JSON，不依賴 storage（跨網域嵌入用）。
 * 兩者都經過 normalizeCard，外部頁面給的資料同樣視為不可信。
 */
const props = defineProps<{ cardId?: string; config?: string }>()
const card = ref<CardInstance | null>(null)
const error = ref('')

function resolve(): void {
  error.value = ''
  if (props.config) {
    try {
      card.value = normalizeCard(JSON.parse(props.config))
    } catch {
      card.value = null
    }
    if (!card.value) error.value = 'config 格式錯誤'
    return
  }
  card.value = loadCards(safeStorage(), seedCards).find((c) => c.id === props.cardId) ?? null
  if (!card.value) error.value = `找不到卡片：${props.cardId ?? '(未指定 card-id)'}`
}

function safeStorage(): Storage | { getItem: () => null; setItem: () => void; removeItem: () => void } {
  try {
    return window.localStorage
  } catch {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }
}

let unsubscribe: (() => void) | undefined
onMounted(() => {
  resolve()
  // showroom 在另一個分頁修改時即時同步
  unsubscribe = subscribeToExternalChanges(resolve)
})
onUnmounted(() => unsubscribe?.())
watch(() => [props.cardId, props.config], resolve)
</script>

<template>
  <CardRenderer v-if="card" :card="card" />
  <div v-else class="mc-unknown">{{ error }}</div>
</template>
