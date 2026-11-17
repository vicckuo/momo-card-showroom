<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../schema'
import BaseCard from '../parts/BaseCard.vue'
import { discountLabel, type FlashSaleOptions } from './flashSale'

const props = defineProps<{ product: Product; options: FlashSaleOptions }>()

const discount = computed(() =>
  props.options.showDiscount ? discountLabel(props.product.price, props.product.originalPrice) : null,
)
const soldOut = computed(() => props.options.remaining === 0)
const lowStock = computed(() => !soldOut.value && props.options.remaining <= props.options.lowStockThreshold)
</script>

<template>
  <BaseCard
    :product="product"
    layout="vertical"
    :accent-color="options.accentColor"
    :show-original-price="true"
    :show-meta="options.showMeta"
    :price-prefix="options.priceLabel"
  >
    <template #media-overlay>
      <span v-if="discount" class="mc-badge">{{ discount }}</span>
    </template>
    <template #footer>
      <span v-if="soldOut" class="mc-stock">已搶完</span>
      <span v-else class="mc-stock" :class="{ 'mc-stock--low': lowStock }">最後{{ options.remaining }}組</span>
    </template>
  </BaseCard>
</template>
