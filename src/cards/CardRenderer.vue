<script setup lang="ts">
import { computed } from 'vue'
import { getVariant } from './registry'
import type { CardInstance } from './schema'

/** 依 variant 動態選元件；未知 variant 顯示提示而不是整頁壞掉。 */
const props = defineProps<{ card: CardInstance }>()
const variant = computed(() => getVariant(props.card.variant))
</script>

<template>
  <component :is="variant.component" v-if="variant" :product="card.product" :options="card.options" />
  <div v-else class="mc-unknown">未知的卡片類型：{{ card.variant }}</div>
</template>
