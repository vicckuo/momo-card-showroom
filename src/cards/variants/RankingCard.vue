<script setup lang="ts">
import type { Product } from '../schema'
import BaseCard from '../parts/BaseCard.vue'
import type { RankingOptions } from './ranking'

defineProps<{ product: Product; options: RankingOptions }>()
</script>

<template>
  <BaseCard
    :product="product"
    layout="vertical"
    :accent-color="options.accentColor"
    :show-original-price="true"
    :show-meta="options.showMeta"
  >
    <template #media-overlay>
      <span class="mc-badge">TOP {{ options.rank }}</span>
    </template>
    <template #before-price>
      <span v-if="options.categoryLabel" class="mc-tag">{{ options.categoryLabel }}</span>
    </template>
  </BaseCard>
</template>
