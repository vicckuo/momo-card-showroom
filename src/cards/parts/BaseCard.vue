<script setup lang="ts">
import type { Product } from '../schema'
import PriceTag from './PriceTag.vue'

/**
 * 所有 variant 共用的骨架：圖、標語、標題、價格、評價/銷量。
 * variant 只透過 slot 加自己的區塊，不複製骨架。
 */
defineProps<{
  product: Product
  layout: 'vertical' | 'horizontal'
  accentColor: string
  showOriginalPrice: boolean
  showMeta: boolean
  pricePrefix?: string
}>()
</script>

<template>
  <article
    class="mc-card"
    :class="`mc-card--${layout}`"
    :style="{ '--mc-accent': accentColor }"
  >
    <div class="mc-card__media">
      <img :src="product.imageUrl" :alt="product.title" loading="lazy" />
      <slot name="media-overlay" />
    </div>
    <div class="mc-card__body">
      <p v-if="product.promoText" class="mc-card__promo">{{ product.promoText }}</p>
      <h3 class="mc-card__title">
        <span v-if="product.brand">【{{ product.brand }}】</span>{{ product.title }}
      </h3>
      <slot name="before-price" />
      <PriceTag
        :price="product.price"
        :original-price="product.originalPrice"
        :show-original="showOriginalPrice"
        :prefix="pricePrefix"
      />
      <div v-if="showMeta" class="mc-card__meta">
        <span v-if="product.ratingCount > 0">({{ product.ratingCount.toLocaleString('zh-TW') }})</span>
        <span v-if="product.salesLabel">{{ product.salesLabel }}</span>
      </div>
      <slot name="footer" />
    </div>
  </article>
</template>
