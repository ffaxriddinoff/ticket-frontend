<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { RouterLink } from 'vue-router'
import { useDrafts } from '../composables/useDrafts'
import { useNotice } from '../composables/useNotice'
import { formatTravelDate, todayInUzbekistan } from '../lib/dates'
import { positions, wagonTypes } from '../types/watch'
import type { WatchDraft } from '../types/watch'

const props = defineProps<{ draft: WatchDraft }>()
const { removeDraft, storageMessage } = useDrafts()
const { notify } = useNotice()

function remove() {
  if (removeDraft(props.draft.id)) notify('Qoralama o‘chirildi.')
  else notify(storageMessage.value, true)
}
</script>

<template>
  <article class="draft-card">
    <div class="draft-card-heading">
      <span class="badge badge-neutral"><AppIcon name="document" :size="13" /> Qoralama</span>
      <span v-if="draft.travelDate < todayInUzbekistan()" class="caption text-warning">Sana o‘tgan</span>
      <span v-else class="caption text-muted">Hali faollashtirilmagan</span>
    </div>
    <div class="draft-route"><strong>{{ draft.from }}</strong><AppIcon name="arrow" :size="19" /><strong>{{ draft.to }}</strong></div>
    <p class="draft-date"><AppIcon name="calendar" :size="16" /> {{ formatTravelDate(draft.travelDate) }}</p>
    <div class="draft-tags">
      <span>{{ positions.find((item) => item.value === draft.position)?.label }} joy</span>
      <span>{{ draft.zone === 'no_side' ? 'Yon joylarsiz' : 'Hamma zona' }}</span>
      <span v-if="!draft.wagonTypes.length">Barcha vagonlar</span>
      <span v-for="type in draft.wagonTypes" :key="type">{{ wagonTypes.find((item) => item.value === type)?.label }}</span>
    </div>
    <div class="draft-card-footer">
      <RouterLink :to="{ name: 'draft-edit', params: { id: draft.id } }" class="text-button"><AppIcon name="edit" :size="16" /> Tahrirlash</RouterLink>
      <button class="icon-button danger-button" type="button" :aria-label="`${draft.from} — ${draft.to} qoralamasini o‘chirish`" @click="remove"><AppIcon name="trash" :size="17" /></button>
    </div>
  </article>
</template>
