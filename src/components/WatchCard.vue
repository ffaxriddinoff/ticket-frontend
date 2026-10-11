<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useWatches } from '../composables/useWatches'
import { useNotice } from '../composables/useNotice'
import { apiErrorMessage } from '../lib/api'
import { formatTravelDate, todayInUzbekistan } from '../lib/dates'
import { positions, wagonTypes } from '../types/watch'
import type { Watch } from '../types/watch'

const props = defineProps<{ watch: Watch }>()
const { removeWatch, deletingIds } = useWatches()
const { notify } = useNotice()

async function remove() {
  if (deletingIds.value.has(props.watch.id)) return
  try {
    await removeWatch(props.watch.id)
    notify('Kuzatuv o‘chirildi.')
  } catch (error) {
    notify(apiErrorMessage(error, 'Kuzatuvni o‘chirib bo‘lmadi.'), true)
  }
}
</script>

<template>
  <article class="draft-card" :aria-busy="deletingIds.has(watch.id)">
    <div class="draft-card-heading">
      <span class="badge badge-green"><AppIcon name="check" :size="13" /> Saqlangan</span>
      <span v-if="watch.trip_date < todayInUzbekistan()" class="caption text-warning">Sana o‘tgan</span>
      <span v-else class="caption text-muted">Hisobingizda</span>
    </div>
    <div class="draft-route"><strong>{{ watch.from }}</strong><AppIcon name="arrow" :size="19" /><strong>{{ watch.to }}</strong></div>
    <p class="draft-date"><AppIcon name="calendar" :size="16" /> {{ formatTravelDate(watch.trip_date) }}</p>
    <div class="draft-tags">
      <span>{{ positions.find((item) => item.value === watch.filters.position)?.label }} joy</span>
      <span>{{ watch.filters.zone === 'no_side' ? 'Yon joylarsiz' : 'Hamma zona' }}</span>
      <span v-if="!watch.filters.wagon_types.length">Barcha vagonlar</span>
      <span v-for="type in watch.filters.wagon_types" :key="type">{{ wagonTypes.find((item) => item.value === type)?.label }}</span>
      <span v-for="train in watch.filters.trains" :key="`train-${train}`">Poyezd: {{ train }}</span>
      <span v-for="trainClass in watch.filters.classes" :key="`class-${trainClass}`">Klass: {{ trainClass }}</span>
    </div>
    <div class="draft-card-footer">
      <span class="caption text-muted">{{ deletingIds.has(watch.id) ? 'O‘chirilmoqda…' : 'Hisobingizda saqlangan' }}</span>
      <button class="icon-button danger-button" type="button" :disabled="deletingIds.has(watch.id)" :aria-label="`${watch.from} — ${watch.to} kuzatuvini o‘chirish`" @click="remove"><AppIcon name="trash" :size="17" /></button>
    </div>
  </article>
</template>
