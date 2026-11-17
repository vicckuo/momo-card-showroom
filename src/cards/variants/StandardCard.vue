<script setup lang="ts">
import type { Product } from '../schema'
import BaseCard from '../parts/BaseCard.vue'
import type { StandardOptions } from './standard'

defineProps<{ product: Product; options: StandardOptions }>()
</script>

<template>
  <BaseCard
    :product="product"
    :layout="options.layout"
    :accent-color="options.accentColor"
    :show-original-price="options.showOriginalPrice"
    :show-meta="options.showMeta"
  >
    <template #footer>
      <span v-if="options.tag" class="mc-tag">{{ options.tag }}</span>
    </template>
  </BaseCard>
</template>
