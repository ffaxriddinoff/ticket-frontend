<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import DraftCard from '../components/DraftCard.vue'
import WatchList from '../components/WatchList.vue'
import { useDrafts } from '../composables/useDrafts'
import { useProfile } from '../composables/useProfile'

const { drafts, storageMessage } = useDrafts()
const { state } = useProfile()
const search = ref('')
const filteredDrafts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return drafts.value.filter((draft) => `${draft.from} ${draft.to}`.toLocaleLowerCase().includes(query))
})
</script>

<template>
  <section class="page-heading"><div><p class="eyebrow">HAMMASI BIR JOYDA</p><h1>Kuzatuvlar<span class="greeting-dot">.</span></h1><p class="page-subtitle">Safarlaringiz, marshrutlaringiz va joy tanlovlaringiz.</p></div><RouterLink to="/watches/new" class="button button-primary"><AppIcon name="plus" :size="18" /> {{ state === 'authenticated' ? 'Yangi kuzatuv' : 'Yangi qoralama' }}</RouterLink></section>
  <div v-if="state === 'authenticated'" class="drafts-info"><AppIcon name="bell" :size="20" /><p><strong>Kuzatuvlar hisobingizga saqlanadi.</strong> Joylarni avtomatik tekshirish va Telegram xabarlari keyingi bosqichda ulanadi.</p></div>
  <div v-else-if="state !== 'loading'" class="drafts-info"><AppIcon name="document" :size="20" /><p><strong>Bu yerda lokal qoralamalar saqlanadi.</strong> Hisobingizdagi kuzatuvlarni ko‘rish uchun Mini App’ni Telegram’dan oching.</p></div>
  <WatchList v-if="state === 'authenticated'" />
  <section v-else-if="state === 'loading'" class="panel"><div class="empty-state" role="status"><span class="loading-spinner"></span><p>Profil tekshirilmoqda…</p></div></section>
  <template v-else>
    <p v-if="storageMessage" class="inline-warning" role="alert">{{ storageMessage }}</p>
    <section class="panel draft-list-panel"><div class="draft-list-toolbar"><div class="draft-list-title"><h2>Qoralamalar</h2><span class="count-pill">{{ drafts.length }}</span></div><div v-if="drafts.length" class="search-field"><AppIcon name="filter" :size="17" /><input v-model="search" type="search" aria-label="Qoralamalarni marshrut bo‘yicha qidirish" placeholder="Marshrut bo‘yicha qidirish" /></div></div><div v-if="!drafts.length" class="empty-state large-empty"><span class="empty-icon"><AppIcon name="pin" :size="30" /><span class="empty-icon-plus">+</span></span><h3>Birinchi safaringizni rejalashtiring</h3><p>Qayerga va qachon borasiz?<br />Marshrutni qo‘shishdan boshlang.</p><RouterLink to="/watches/new" class="button button-primary"><AppIcon name="plus" :size="18" /> Qoralama yaratish</RouterLink><span class="empty-footnote"><AppIcon name="shield" :size="14" /> Qoralama uchun Telegram’ga kirish shart emas</span></div><div v-else-if="!filteredDrafts.length" class="empty-state"><span class="empty-icon"><AppIcon name="filter" :size="28" /></span><h3>Bu marshrut topilmadi</h3><p>Boshqa yo‘nalish bilan qidirib ko‘ring.</p><button class="button button-secondary" type="button" @click="search = ''">Qidiruvni tozalash</button></div><div v-else class="drafts-grid"><DraftCard v-for="draft in filteredDrafts" :key="draft.id" :draft="draft" /></div></section>
  </template>
</template>
