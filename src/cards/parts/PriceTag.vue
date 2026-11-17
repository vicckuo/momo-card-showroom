<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  price: number
  originalPrice?: number
  showOriginal: boolean
  prefix?: string
}>()

const format = (n: number) => n.toLocaleString('zh-TW')

/** 原價必須高於售價才顯示，避免後台資料錯誤時出現「原價比較便宜」的畫面。 */
const hasDiscount = computed(
  () => props.showOriginal && props.originalPrice !== undefined && props.originalPrice > props.price,
)
</script>

<template>
  <div class="mc-price">
    <span v-if="prefix" class="mc-price__prefix">{{ prefix }}</span>
    <span class="mc-price__now">${{ format(price) }}</span>
    <span v-if="hasDiscount" class="mc-price__orig">${{ format(originalPrice!) }}</span>
  </div>
</template>
