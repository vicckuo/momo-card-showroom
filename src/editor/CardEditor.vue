<script setup lang="ts">
import { computed } from 'vue'
import { getVariant, type FieldDef } from '../cards/registry'
import type { CardInstance, Product } from '../cards/schema'

const props = defineProps<{ card: CardInstance }>()
const emit = defineEmits<{
  update: [patch: { product?: Partial<Product>; options?: Record<string, unknown> }]
}>()

/** 商品欄位對所有 variant 相同；variant 選項欄位來自 registry，新增 variant 不用改這裡。 */
const productFields: readonly FieldDef[] = [
  { key: 'brand', label: '品牌', kind: 'text' },
  { key: 'title', label: '商品名稱', kind: 'text' },
  { key: 'promoText', label: '促銷標語', kind: 'text' },
  { key: 'price', label: '售價', kind: 'number', min: 0 },
  { key: 'originalPrice', label: '原價', kind: 'number', min: 0 },
  { key: 'ratingCount', label: '評價數', kind: 'number', min: 0 },
  { key: 'salesLabel', label: '銷量文字', kind: 'text' },
]

const optionFields = computed(() => getVariant(props.card.variant)?.fields ?? [])

function readValue(source: Record<string, unknown>, field: FieldDef, event: Event): unknown {
  const input = event.target as HTMLInputElement
  if (field.kind === 'boolean') return input.checked
  if (field.kind === 'number') {
    // 空字串代表清空（如原價），不要變成 0 造成「原價 $0」
    if (input.value === '') return field.key === 'originalPrice' ? undefined : source[field.key]
    const n = Number(input.value)
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : source[field.key]
  }
  return input.value
}

function onProduct(field: FieldDef, event: Event) {
  emit('update', { product: { [field.key]: readValue(props.card.product, field, event) } })
}

function onOption(field: FieldDef, event: Event) {
  emit('update', { options: { [field.key]: readValue(props.card.options, field, event) } })
}
</script>

<template>
  <form class="editor" @submit.prevent>
    <fieldset>
      <legend>商品資料</legend>
      <label v-for="field in productFields" :key="field.key" class="editor__row">
        <span>{{ field.label }}</span>
        <input
          :type="field.kind === 'number' ? 'number' : 'text'"
          :min="field.kind === 'number' ? field.min : undefined"
          :value="(card.product as Record<string, unknown>)[field.key] ?? ''"
          @change="onProduct(field, $event)"
        />
      </label>
    </fieldset>
    <fieldset>
      <legend>卡片選項</legend>
      <label v-for="field in optionFields" :key="field.key" class="editor__row">
        <span>{{ field.label }}</span>
        <select v-if="field.kind === 'select'" :value="card.options[field.key]" @change="onOption(field, $event)">
          <option v-for="choice in field.choices" :key="choice" :value="choice">{{ choice }}</option>
        </select>
        <input v-else-if="field.kind === 'boolean'" type="checkbox" :checked="Boolean(card.options[field.key])" @change="onOption(field, $event)" />
        <input v-else-if="field.kind === 'color'" type="color" :value="card.options[field.key]" @input="onOption(field, $event)" />
        <input
          v-else
          :type="field.kind === 'number' ? 'number' : 'text'"
          :value="card.options[field.key]"
          @change="onOption(field, $event)"
        />
      </label>
    </fieldset>
  </form>
</template>
