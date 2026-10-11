<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import RouteArtwork from '../components/RouteArtwork.vue'
import DraftCard from '../components/DraftCard.vue'
import WatchList from '../components/WatchList.vue'
import { useDrafts } from '../composables/useDrafts'
import { useProfile } from '../composables/useProfile'
import { useWatches } from '../composables/useWatches'

const { drafts, storageMessage } = useDrafts()
const { displayName, state } = useProfile()
const { watches, loaded } = useWatches()
const savedCount = computed(() => state.value === 'authenticated' ? loaded.value ? watches.value.length : '…' : state.value === 'loading' ? '…' : drafts.value.length)
const steps = [
  { title: 'Marshrutni belgilang', text: 'Jo‘nash, borish bekati va safar sanasini tanlang.', icon: 'pin' },
  { title: 'Qulay joyni tanlang', text: 'Vagon turi, pastki yoki yuqori joyni belgilang.', icon: 'seat' },
  { title: 'Telegram’da xabar oling', text: 'Kuzatuv xizmati ulangach, mos joy topilganda xabar keladi.', icon: 'telegram' },
]
</script>

<template>
  <section class="page-heading home-heading"><div><h1>Salom, {{ displayName }}<span class="greeting-dot">.</span></h1><p class="page-subtitle">Keyingi safaringizni birga rejalashtiramiz.</p></div><span class="quiet-label"><AppIcon name="shield" :size="16" /> Siz tanlagan yo‘nalish, sizga mos joy</span></section>
  <section class="hero-card"><div class="hero-content"><span class="hero-kicker"><span class="live-dot"></span> SHOSHILMASDAN REJALASHTIRING</span><h2>Qulay joyni topish<br /><span>shu yerdan boshlanadi.</span></h2><p>Marshrutni va o‘zingizga qulay joylarni belgilang. Safar rejangiz doim qo‘lingiz ostida bo‘lsin.</p><RouterLink to="/watches/new" class="button button-primary">Safarni rejalashtirish<AppIcon name="arrow" :size="18" /></RouterLink><span class="hero-footnote">{{ state === 'authenticated' ? 'Kuzatuv hisobingizga saqlanadi' : 'Qoralama shu brauzerda saqlanadi' }}</span></div><RouteArtwork /></section>

  <div class="summary-grid">
    <div class="summary-card"><span class="summary-icon"><AppIcon :name="state === 'authenticated' ? 'bell' : 'document'" :size="21" /></span><div><p>{{ state === 'authenticated' ? 'Saqlangan kuzatuvlar' : 'Saqlangan qoralamalar' }}</p><strong>{{ savedCount }}<span> ta</span></strong></div><RouterLink to="/watches" class="summary-link" aria-label="Saqlangan safarlarni ko‘rish"><AppIcon name="chevron" :size="18" /></RouterLink></div>
    <div class="summary-card telegram-summary" :class="{ 'is-connected': state === 'authenticated' }">
      <span class="summary-icon">
        <AppIcon name="telegram" :size="21" />
        <span class="telegram-connection-mark"><AppIcon :name="state === 'authenticated' ? 'check' : state === 'loading' ? 'clock' : 'close'" :size="10" /></span>
      </span>
      <div><p>Telegram hisobi</p><strong class="summary-text">{{ state === 'authenticated' ? 'Ulangan' : state === 'loading' ? 'Tekshirilmoqda' : 'Ulanmagan' }}</strong></div>
      <RouterLink to="/profile" class="summary-link" aria-label="Telegram profilini ko‘rish"><AppIcon name="chevron" :size="18" /></RouterLink>
    </div>
  </div>

  <div class="dashboard-grid">
    <WatchList v-if="state === 'authenticated'" compact />
    <section v-else-if="state === 'loading'" class="panel watches-panel"><div class="empty-state" role="status"><span class="loading-spinner"></span><p>Profil tekshirilmoqda…</p></div></section>
    <section v-else class="panel watches-panel"><div class="section-heading"><div><span class="eyebrow">SAFAR REJALARINGIZ</span><h2>Qoralamalar</h2></div><RouterLink v-if="drafts.length" to="/watches" class="text-button">Barchasi<AppIcon name="arrow" :size="16" /></RouterLink><span v-else class="count-pill">0</span></div><p v-if="storageMessage" class="inline-warning" role="alert">{{ storageMessage }}</p><div v-if="!drafts.length" class="empty-state"><span class="empty-icon"><AppIcon name="bell" :size="28" /><span class="empty-icon-plus">+</span></span><h3>Keyingi safaringizni qo‘shing</h3><p>Marshrut va joy filtrlarini saqlang.<br />Barcha qoralamalaringiz shu yerda turadi.</p><RouterLink to="/watches/new" class="button button-secondary"><AppIcon name="plus" :size="18" /> Yangi qoralama</RouterLink></div><div v-else class="home-drafts"><DraftCard v-for="draft in drafts.slice(0, 2)" :key="draft.id" :draft="draft" /><RouterLink to="/watches/new" class="add-draft-button"><AppIcon name="plus" :size="18" /> Yana bir safar qo‘shish</RouterLink></div></section>
    <aside class="how-it-works panel"><span class="eyebrow">UCHTA ODDIY QADAM</span><h2>Qanday ishlaydi?</h2><ol class="steps-list"><li v-for="(step, index) in steps" :key="step.title"><span class="step-number">0{{ index + 1 }}</span><div><h3>{{ step.title }}</h3><p>{{ step.text }}</p></div></li></ol><div class="help-note"><AppIcon name="sparkles" :size="19" /><p>Avval rejalashtiramiz.<br /><strong>Keyin joylarni birga kuzatamiz.</strong></p></div></aside>
  </div>
</template>
