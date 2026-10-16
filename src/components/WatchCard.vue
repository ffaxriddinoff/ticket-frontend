<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../lib/i18n'
import AppIcon from './AppIcon.vue'
import { useWatches } from '../composables/useWatches'
import { useNotice } from '../composables/useNotice'
import { useStations } from '../composables/useStations'
import { apiErrorMessage } from '../lib/api'
import { formatTravelDate, todayInUzbekistan } from '../lib/dates'
import { positions, trainClasses, wagonTypes } from '../types/watch'
import type { Watch } from '../types/watch'

const { t } = useLocale()

const props = defineProps<{ watch: Watch }>()
const { removeWatch, deletingIds, setWatchActive, updatingIds } = useWatches()
const { notify } = useNotice()
const { stationName } = useStations()
const updating = computed(() => updatingIds.value.has(props.watch.id))
const busy = computed(() => updating.value || deletingIds.value.has(props.watch.id))
const actionLabel = computed(() => updating.value
  ? props.watch.is_active ? 'Pauza qilinmoqda…' : 'Davom ettirilmoqda…'
  : props.watch.is_active ? 'Pauza' : 'Davom')

async function toggleActive() {
  if (busy.value) return
  const isActive = !props.watch.is_active
  try {
    await setWatchActive(props.watch.id, isActive)
    notify(isActive ? 'Kuzatuv davom ettirildi.' : 'Kuzatuv pauza qilindi.')
  } catch (error) {
    notify(apiErrorMessage(error, isActive
      ? 'Kuzatuvni davom ettirib bo‘lmadi.'
      : 'Kuzatuvni pauza qilib bo‘lmadi.'), true)
  }
}

async function remove() {
  if (busy.value) return
  try {
    await removeWatch(props.watch.id)
    notify('Kuzatuv o‘chirildi.')
  } catch (error) {
    notify(apiErrorMessage(error, 'Kuzatuvni o‘chirib bo‘lmadi.'), true)
  }
}
</script>

<template>
  <article class="draft-card" :aria-busy="busy">
    <div v-if="watch.trip_date < todayInUzbekistan()" class="draft-card-heading">
      <span class="caption text-warning">{{ t('Sana o‘tgan') }}</span>
    </div>
    <div class="draft-route"><strong>{{ stationName(watch.from) }}</strong><AppIcon name="arrow" :size="19" /><strong>{{ stationName(watch.to) }}</strong></div>
    <p class="draft-date"><AppIcon name="calendar" :size="16" /> {{ formatTravelDate(watch.trip_date) }}</p>
    <div class="draft-tags">
      <span>{{ t(positions.find((item) => item.value === watch.filters.position)?.label ?? '') }} {{ t('joy') }}</span>
      <span>{{ watch.filters.zone === 'no_side' ? t('Yon joylarsiz') : t('Hamma zona') }}</span>
      <span v-if="!watch.filters.wagon_types.length">{{ t('Barcha vagonlar') }}</span>
      <span v-for="type in watch.filters.wagon_types" :key="type">{{ t(wagonTypes.find((item) => item.value === type)?.label ?? '') }}</span>
      <span v-for="train in watch.filters.trains" :key="`train-${train}`">{{ t('Poyezd:') }} {{ train }}</span>
      <span v-for="trainClass in watch.filters.classes" :key="`class-${trainClass}`">{{ t('Klass:') }} {{ t(trainClasses.find((option) => option.value === trainClass)?.label ?? trainClass) }}</span>
    </div>
    <div class="watch-card-actions">
      <button class="watch-card-action" :class="watch.is_active ? 'watch-action-pause' : 'watch-action-resume'" type="button" :disabled="busy" :aria-label="`${stationName(watch.from)} — ${stationName(watch.to)}: ${t(actionLabel)}`" @click="toggleActive">
        <span class="watch-action-icon"><span v-if="updating" class="loading-spinner" aria-hidden="true"></span><AppIcon v-else :name="watch.is_active ? 'pause' : 'play'" :size="19" /></span>
        <span>{{ t(actionLabel) }}</span>
      </button>
      <button class="watch-card-action watch-action-edit" type="button" disabled :title="t('Tez orada')">
        <span class="watch-action-icon"><AppIcon name="edit" :size="19" /></span>
        <span>{{ t('Tahrirlash') }}</span>
      </button>
      <button class="watch-card-action watch-action-delete" type="button" :disabled="busy" :aria-label="`${stationName(watch.from)} — ${stationName(watch.to)}: ${t('Kuzatuvni o‘chirish')}`" @click="remove">
        <span class="watch-action-icon"><AppIcon :name="deletingIds.has(watch.id) ? 'clock' : 'trash'" :size="19" /></span>
        <span>{{ deletingIds.has(watch.id) ? t('O‘chirilmoqda…') : t('O‘chirish') }}</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.watch-card-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; padding-top: 9px; border-top: 1px solid #eef1e9; }
.watch-card-action { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; min-width: 0; min-height: 64px; padding: 6px 3px; border: 0; border-radius: 10px; background: transparent; color: var(--action-color); font-size: 10px; line-height: 1.5; font-weight: 750; transition: background .15s; }
.watch-card-action:disabled { opacity: 1; }
.watch-card-action:disabled > span:last-child { opacity: .65; }
.watch-card-action:not(:disabled):hover { background: var(--action-background); }
.watch-card-action:focus-visible { outline-color: var(--action-color); outline-offset: 2px; }
.watch-action-icon { display: grid; place-items: center; width: 34px; height: 32px; border-radius: 9px; background: var(--action-background); }
.watch-action-resume { --action-color: #15945b; --action-background: #eaf8ef; }
.watch-action-pause { --action-color: #a77b12; --action-background: #fff5d9; }
.watch-action-edit { --action-color: #2789d2; --action-background: #edf5ff; }
.watch-action-delete { --action-color: #d85858; --action-background: #fff0ed; }
.watch-action-resume .watch-action-icon :deep(svg), .watch-action-pause .watch-action-icon :deep(svg) { fill: currentColor; stroke: none; }
.watch-action-icon .loading-spinner { width: 18px; height: 18px; margin: 0; border-width: 2px; border-color: var(--action-background); border-top-color: currentColor; }
@media (prefers-reduced-motion: reduce) { .watch-action-icon .loading-spinner { animation: none; } }
</style>
