<script setup lang="ts">
import { useLocale } from '../lib/i18n'
import AppIcon from './AppIcon.vue'
import { RouterLink } from 'vue-router'
import { useDrafts } from '../composables/useDrafts'
import { useNotice } from '../composables/useNotice'
import { useStations } from '../composables/useStations'
import { formatTravelDate, todayInUzbekistan } from '../lib/dates'
import { positions, wagonTypes } from '../types/watch'
import type { WatchDraft } from '../types/watch'

const { t } = useLocale()

const props = defineProps<{ draft: WatchDraft }>()
const { removeDraft, storageMessage } = useDrafts()
const { notify } = useNotice()
const { stationName } = useStations()

function remove() {
  if (removeDraft(props.draft.id)) notify('Qoralama o‘chirildi.')
  else notify(storageMessage.value, true)
}
</script>

<template>
  <article class="draft-card">
    <div class="draft-card-heading">
      <span class="badge badge-neutral"><AppIcon name="document" :size="13" /> {{ t('Qoralama') }}</span>
      <span v-if="draft.travelDate < todayInUzbekistan()" class="caption text-warning">{{ t('Sana o‘tgan') }}</span>
      <span v-else class="caption text-muted">{{ t('Hali faollashtirilmagan') }}</span>
    </div>
    <div class="draft-route"><strong>{{ stationName(draft.from) }}</strong><AppIcon name="arrow" :size="19" /><strong>{{ stationName(draft.to) }}</strong></div>
    <p class="draft-date"><AppIcon name="calendar" :size="16" /> {{ formatTravelDate(draft.travelDate) }}</p>
    <div class="draft-tags">
      <span v-for="number in draft.trains ?? []" :key="number">{{ t('Poyezd:') }} {{ number }}</span>
      <span>{{ t(positions.find((item) => item.value === draft.position)?.label ?? '') }} {{ t('joy') }}</span>
      <span>{{ draft.zone === 'no_side' ? t('Yon joylarsiz') : t('Hamma zona') }}</span>
      <span v-if="!draft.wagonTypes.length">{{ t('Barcha vagonlar') }}</span>
      <span v-for="type in draft.wagonTypes" :key="type">{{ t(wagonTypes.find((item) => item.value === type)?.label ?? '') }}</span>
    </div>
    <div class="draft-card-footer">
      <RouterLink :to="{ name: 'draft-edit', params: { id: draft.id } }" class="text-button"><AppIcon name="plus" :size="16" /> {{ t('Kuzatuv yaratish') }}</RouterLink>
      <button class="icon-button danger-button" type="button" :aria-label="`${stationName(draft.from)} — ${stationName(draft.to)}: ${t('Qoralamani o‘chirish')}`" @click="remove"><AppIcon name="trash" :size="17" /></button>
    </div>
  </article>
</template>
