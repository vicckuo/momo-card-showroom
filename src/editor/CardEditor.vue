<script setup lang="ts">
import { computed } from 'vue'
import { getVariant, type FieldDef } from '../cards/registry'
import { LIMITS, type CardInstance, type CardPatch } from '../cards/schema'

const props = defineProps<{ card: CardInstance }>()
const emit = defineEmits<{
  update: [patch: CardPatch]
}>()

/** 商品欄位對所有 variant 相同；variant 選項欄位來自 registry，新增 variant 不用改這裡。 */
const productFields: readonly FieldDef[] = [
  { key: 'brand', label: '品牌', kind: 'text', maxLength: LIMITS.shortTextLength },
  { key: 'title', label: '商品名稱', kind: 'text', maxLength: LIMITS.titleLength },
  { key: 'promoText', label: '促銷標語', kind: 'text', maxLength: LIMITS.shortTextLength },
  { key: 'price', label: '售價', kind: 'number', min: 0, max: LIMITS.price },
  { key: 'originalPrice', label: '原價', kind: 'number', min: 0, max: LIMITS.price, optional: true },
  { key: 'ratingCount', label: '評價數', kind: 'number', min: 0, max: LIMITS.count },
  { key: 'salesLabel', label: '銷量文字', kind: 'text', maxLength: LIMITS.shortTextLength },
]

const variant = computed(() => getVariant(props.card.variant))
const optionFields = computed(() => variant.value?.fields ?? [])

/** 由 variant 宣告目前會隱藏哪些商品欄位；編輯器不需知道任何 variant 的選項名稱。 */
const hiddenFields = computed(() => new Set<string>(variant.value?.hiddenProductFields?.(props.card.options) ?? []))

function readValue(source: Record<string, unknown>, field: FieldDef, event: Event): unknown {
  const input = event.target as HTMLInputElement
  if (field.kind === 'boolean') return input.checked
  if (field.kind === 'number') {
    // 選填欄位清空 = 移除值（不要變成 0 造成「原價 $0」）；必填欄位清空則保留原值
    if (input.value === '') return field.optional ? undefined : source[field.key]
    const n = Number(input.value)
    if (!Number.isFinite(n)) return source[field.key]
    // 夾在欄位宣告的範圍內，並把輸入框改成實際存下的值，畫面與資料一致
    const clamped = Math.min(field.max, Math.max(field.min, Math.round(n)))
    input.value = String(clamped)
    return clamped
  }
  if (field.kind === 'text') {
    const text = input.value.slice(0, field.maxLength)
    input.value = text
    return text
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
          :max="field.kind === 'number' ? field.max : undefined"
          :maxlength="field.kind === 'text' ? field.maxLength : undefined"
          :value="(card.product as Record<string, unknown>)[field.key] ?? ''"
          @change="onProduct(field, $event)"
        />
        <small v-if="hiddenFields.has(field.key)" class="editor__hint">目前的卡片選項不顯示這個欄位</small>
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
          :min="field.kind === 'number' ? field.min : undefined"
          :max="field.kind === 'number' ? field.max : undefined"
          :maxlength="field.kind === 'text' ? field.maxLength : undefined"
          :value="card.options[field.key]"
          @change="onOption(field, $event)"
        />
      </label>
    </fieldset>
  </form>
</template>
