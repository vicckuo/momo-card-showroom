<script setup lang="ts">
import { computed, ref } from 'vue'
import CardRenderer from '../cards/CardRenderer.vue'
import { getVariant, listVariants } from '../cards/registry'
import type { CardInstance } from '../cards/schema'
import { useCards } from '../persistence/useCards'

const { cards, resetAll } = useCards()
const variantFilter = ref('all')
const variants = listVariants()
const visible = computed(() =>
  variantFilter.value === 'all' ? cards.value : cards.value.filter((c) => c.variant === variantFilter.value),
)
const spansTwo = (card: CardInstance) => getVariant(card.variant)?.gridSpan?.(card.options) === 2
</script>

<template>
  <section>
    <div class="toolbar">
      <label>
        類型
        <select v-model="variantFilter">
          <option value="all">全部（{{ cards.length }}）</option>
          <option v-for="v in variants" :key="v.type" :value="v.type">{{ v.label }}</option>
        </select>
      </label>
      <button type="button" @click="resetAll">全部重設</button>
    </div>
    <ul class="grid">
      <li v-for="card in visible" :key="card.id" :class="{ 'grid__wide': spansTwo(card) }">
        <RouterLink :to="`/card/${card.id}`" class="grid__link">
          <CardRenderer :card="card" />
        </RouterLink>
        <small class="grid__label">{{ card.variant }} · {{ card.id }}</small>
      </li>
    </ul>
  </section>
</template>
