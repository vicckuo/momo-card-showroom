<script setup lang="ts">
import { computed } from 'vue'
import CardRenderer from '../cards/CardRenderer.vue'
import CardEditor from '../editor/CardEditor.vue'
import { useCards } from '../persistence/useCards'

const props = defineProps<{ id: string }>()
const { cards, saveFailed, updateCard, resetCard } = useCards()
const card = computed(() => cards.value.find((c) => c.id === props.id))
const embedSnippet = computed(
  () => `<script src="./embed/momo-card.js"><\/script>\n<momo-card card-id="${props.id}"></momo-card>`,
)
</script>

<template>
  <section v-if="card" class="detail">
    <div class="detail__preview">
      <CardRenderer :card="card" />
      <p v-if="saveFailed" class="warn">無法寫入瀏覽器儲存空間，修改不會保留。</p>
      <button type="button" @click="resetCard(card.id)">重設這張卡</button>
      <h4>嵌入範例</h4>
      <pre>{{ embedSnippet }}</pre>
    </div>
    <CardEditor :card="card" @update="(patch) => updateCard(card!.id, patch)" />
  </section>
  <p v-else>找不到卡片「{{ id }}」。<RouterLink to="/">回列表</RouterLink></p>
</template>
