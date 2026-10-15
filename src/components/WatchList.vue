<script setup lang="ts">
import { useLocale } from '../lib/i18n'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import WatchCard from './WatchCard.vue'
import { useWatches } from '../composables/useWatches'

const { t } = useLocale()

const props = defineProps<{ compact?: boolean }>()
const { watches, loading, loaded, errorMessage, loadWatches } = useWatches()
const visibleWatches = computed(() => props.compact ? watches.value.slice(0, 2) : watches.value)
</script>

<template>
  <section class="panel" :class="compact ? 'watches-panel' : 'draft-list-panel'" :aria-busy="loading">
    <div :class="compact ? 'section-heading' : 'draft-list-toolbar'">
      <div class="draft-list-title"><h2>{{ t('Kuzatuvlar') }}</h2><span class="count-pill">{{ loaded ? watches.length : loading ? '…' : '—' }}</span></div>
      <RouterLink v-if="compact && watches.length" to="/watches" class="text-button">{{ t('Barchasi') }}<AppIcon name="arrow" :size="16" /></RouterLink>
      <button v-if="!compact" class="icon-button" type="button" :disabled="loading" :aria-label="t('Kuzatuvlarni yangilash')" @click="loadWatches"><AppIcon name="refresh" :size="18" /></button>
    </div>
    <div v-if="errorMessage" class="watch-load-error" role="alert"><p>{{ t(errorMessage) }}</p><button class="text-button" type="button" :disabled="loading" @click="loadWatches"><AppIcon name="refresh" :size="16" /> {{ t('Qayta urinish') }}</button></div>
    <div v-if="loading && !watches.length" class="empty-state" role="status"><span class="loading-spinner"></span><p>{{ t('Kuzatuvlar yuklanmoqda…') }}</p></div>
    <div v-else-if="loaded && !watches.length && !errorMessage" class="empty-state" :class="{ 'large-empty': !compact }">
      <span class="empty-icon"><AppIcon name="bell" :size="28" /><span class="empty-icon-plus">+</span></span>
      <h3>{{ t('Birinchi kuzatuvingizni yarating') }}</h3><p>{{ t('Marshrut, safar sanasi va joy filtrlarini tanlang.') }}</p>
      <RouterLink to="/watches/new" class="button button-secondary"><AppIcon name="plus" :size="18" /> {{ t('Yangi kuzatuv') }}</RouterLink>
    </div>
    <div v-else-if="visibleWatches.length" :class="compact ? 'home-drafts' : 'drafts-grid'">
      <WatchCard v-for="watch in visibleWatches" :key="watch.id" :watch="watch" />
      <RouterLink to="/watches/new" v-if="compact" class="add-draft-button"><AppIcon name="plus" :size="18" /> {{ t('Yana bir safar qo‘shish') }}</RouterLink>
    </div>
  </section>
</template>
