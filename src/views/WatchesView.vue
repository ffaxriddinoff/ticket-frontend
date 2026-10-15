<script setup lang="ts">
import { useLocale } from '../lib/i18n'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import DraftCard from '../components/DraftCard.vue'
import WatchList from '../components/WatchList.vue'
import { useDrafts } from '../composables/useDrafts'
import { useProfile } from '../composables/useProfile'
import { useStations } from '../composables/useStations'

const { t } = useLocale()

const { drafts, storageMessage } = useDrafts()
const { state } = useProfile()
const search = ref('')
const { stationName } = useStations()
const filteredDrafts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return drafts.value.filter((draft) => `${stationName(draft.from)} ${stationName(draft.to)} ${draft.from} ${draft.to}`.toLocaleLowerCase().includes(query))
})
</script>

<template>
  <section class="page-heading"><div><p class="eyebrow">{{ t('HAMMASI BIR JOYDA') }}</p><h1>{{ t('Kuzatuvlar') }}<span class="greeting-dot">.</span></h1><p class="page-subtitle">{{ t('Safarlaringiz, marshrutlaringiz va joy tanlovlaringiz.') }}</p></div><RouterLink to="/watches/new" class="button button-primary"><AppIcon name="plus" :size="18" /> {{ t('Yangi kuzatuv') }}</RouterLink></section>
  <div class="drafts-info"><AppIcon name="bell" :size="20" /><p><strong>{{ t('Kuzatuvlar hisobingizga saqlanadi.') }}</strong> {{ t('Joylarni avtomatik tekshirish va Telegram xabarlari keyingi bosqichda ulanadi.') }}</p></div>
  <section v-if="state === 'loading'" class="panel"><div class="empty-state" role="status"><span class="loading-spinner"></span><p>{{ t('Profil tekshirilmoqda…') }}</p></div></section>
  <WatchList v-else />
  <template v-if="drafts.length || storageMessage">
    <div class="drafts-info"><AppIcon name="document" :size="20" /><p>{{ t('Bu brauzerdagi avvalgi qoralamalar. Ochib, kuzatuv sifatida saqlashingiz mumkin.') }}</p></div>
    <p v-if="storageMessage" class="inline-warning" role="alert">{{ t(storageMessage) }}</p>
    <section v-if="drafts.length" class="panel draft-list-panel"><div class="draft-list-toolbar"><div class="draft-list-title"><h2>{{ t('Avvalgi qoralamalar') }}</h2><span class="count-pill">{{ drafts.length }}</span></div><div class="search-field"><AppIcon name="filter" :size="17" /><input v-model="search" type="search" :aria-label="t('Qoralamalarni marshrut bo‘yicha qidirish')" :placeholder="t('Marshrut bo‘yicha qidirish')" /></div></div><div v-if="!filteredDrafts.length" class="empty-state"><span class="empty-icon"><AppIcon name="filter" :size="28" /></span><h3>{{ t('Bu marshrut topilmadi') }}</h3><p>{{ t('Boshqa yo‘nalish bilan qidirib ko‘ring.') }}</p><button class="button button-secondary" type="button" @click="search = ''">{{ t('Qidiruvni tozalash') }}</button></div><div v-else class="drafts-grid"><DraftCard v-for="draft in filteredDrafts" :key="draft.id" :draft="draft" /></div></section>
  </template>
</template>
