<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import WatchCard from './WatchCard.vue'
import { useWatches } from '../composables/useWatches'

const props = defineProps<{ compact?: boolean }>()
const { watches, loading, loaded, errorMessage, loadWatches } = useWatches()
const search = ref('')
const visibleWatches = computed(() => {
  if (props.compact) return watches.value.slice(0, 2)
  const query = search.value.trim().toLocaleLowerCase()
  return watches.value.filter((watch) => `${watch.from} ${watch.to}`.toLocaleLowerCase().includes(query))
})
</script>

<template>
  <section class="panel" :class="compact ? 'watches-panel' : 'draft-list-panel'" :aria-busy="loading">
    <div :class="compact ? 'section-heading' : 'draft-list-toolbar'">
      <div class="draft-list-title"><h2>Kuzatuvlar</h2><span class="count-pill">{{ loaded ? watches.length : '…' }}</span></div>
      <RouterLink v-if="compact && watches.length" to="/watches" class="text-button">Barchasi<AppIcon name="arrow" :size="16" /></RouterLink>
      <div v-if="!compact" class="watch-list-actions">
        <div v-if="watches.length" class="search-field"><AppIcon name="filter" :size="17" /><input v-model="search" type="search" aria-label="Kuzatuvlarni marshrut bo‘yicha qidirish" placeholder="Marshrut bo‘yicha qidirish" /></div>
        <button class="icon-button" type="button" :disabled="loading" aria-label="Kuzatuvlarni yangilash" @click="loadWatches"><AppIcon name="refresh" :size="18" /></button>
      </div>
    </div>
    <div v-if="errorMessage" class="watch-load-error" role="alert"><p>{{ errorMessage }}</p><button class="text-button" type="button" :disabled="loading" @click="loadWatches"><AppIcon name="refresh" :size="16" /> Qayta urinish</button></div>
    <div v-if="loading && !watches.length" class="empty-state" role="status"><span class="loading-spinner"></span><p>Kuzatuvlar yuklanmoqda…</p></div>
    <div v-else-if="loaded && !watches.length && !errorMessage" class="empty-state" :class="{ 'large-empty': !compact }">
      <span class="empty-icon"><AppIcon name="bell" :size="28" /><span class="empty-icon-plus">+</span></span>
      <h3>Birinchi kuzatuvingizni yarating</h3><p>Marshrut, safar sanasi va joy filtrlarini tanlang.</p>
      <RouterLink to="/watches/new" class="button button-secondary"><AppIcon name="plus" :size="18" /> Yangi kuzatuv</RouterLink>
    </div>
    <div v-else-if="watches.length && !visibleWatches.length" class="empty-state"><span class="empty-icon"><AppIcon name="filter" :size="28" /></span><h3>Bu marshrut topilmadi</h3><p>Boshqa yo‘nalish bilan qidirib ko‘ring.</p><button class="button button-secondary" type="button" @click="search = ''">Qidiruvni tozalash</button></div>
    <div v-else-if="visibleWatches.length" :class="compact ? 'home-drafts' : 'drafts-grid'">
      <WatchCard v-for="watch in visibleWatches" :key="watch.id" :watch="watch" />
      <RouterLink to="/watches/new" v-if="compact" class="add-draft-button"><AppIcon name="plus" :size="18" /> Yana bir safar qo‘shish</RouterLink>
    </div>
  </section>
</template>
