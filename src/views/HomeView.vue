<script setup lang="ts">
import { useLocale } from '../lib/i18n'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import RouteArtwork from '../components/RouteArtwork.vue'
import WatchList from '../components/WatchList.vue'
import { useProfile } from '../composables/useProfile'
import { useWatches } from '../composables/useWatches'

const { t } = useLocale()

const { displayName, state } = useProfile()
const { watches, loaded, loading } = useWatches()
const savedCount = computed(() => loaded.value ? watches.value.length : loading.value || state.value === 'loading' ? '…' : '—')
const steps = [
  { title: 'Marshrutni belgilang', text: 'Jo‘nash, borish bekati va safar sanasini tanlang.', icon: 'pin' },
  { title: 'Qulay joyni tanlang', text: 'Vagon turi, pastki yoki yuqori joyni belgilang.', icon: 'seat' },
  { title: 'Telegram’da xabar oling', text: 'Kuzatuv xizmati ulangach, mos joy topilganda xabar keladi.', icon: 'telegram' },
]
</script>

<template>
  <section class="page-heading home-heading"><div><h1>{{ t('Salom,') }} {{ displayName }}<span class="greeting-dot">.</span></h1><p class="page-subtitle">{{ t('Keyingi safaringizni birga rejalashtiramiz.') }}</p></div><span class="quiet-label"><AppIcon name="shield" :size="16" /> {{ t('Siz tanlagan yo‘nalish, sizga mos joy') }}</span></section>
  <section class="hero-card"><div class="hero-content"><span class="hero-kicker"><span class="live-dot"></span> {{ t('SHOSHILMASDAN REJALASHTIRING') }}</span><h2>{{ t('Qulay joyni topish') }}<br /><span>{{ t('shu yerdan boshlanadi.') }}</span></h2><p>{{ t('Marshrutni va o‘zingizga qulay joylarni belgilang. Safar rejangiz doim qo‘lingiz ostida bo‘lsin.') }}</p><RouterLink to="/watches/new" class="button button-primary">{{ t('Safarni rejalashtirish') }}<AppIcon name="arrow" :size="18" /></RouterLink><span class="hero-footnote">{{ t('Kuzatuv hisobingizga saqlanadi') }}</span></div><RouteArtwork /></section>

  <div class="summary-grid">
    <div class="summary-card"><span class="summary-icon"><AppIcon name="bell" :size="21" /></span><div><p>{{ t('Saqlangan kuzatuvlar') }}</p><strong>{{ savedCount }}<span> {{ t('ta') }}</span></strong></div><RouterLink to="/watches" class="summary-link" :aria-label="t('Saqlangan safarlarni ko‘rish')"><AppIcon name="chevron" :size="18" /></RouterLink></div>
    <div class="summary-card telegram-summary" :class="{ 'is-connected': state === 'authenticated' }">
      <span class="summary-icon">
        <AppIcon name="telegram" :size="21" />
        <span class="telegram-connection-mark"><AppIcon :name="state === 'authenticated' ? 'check' : state === 'loading' ? 'clock' : 'close'" :size="10" /></span>
      </span>
      <div><p>{{ t('Telegram hisobi') }}</p><strong class="summary-text">{{ state === 'authenticated' ? t('Ulangan') : state === 'loading' ? t('Tekshirilmoqda') : t('Ulanmagan') }}</strong></div>
      <RouterLink to="/profile" class="summary-link" :aria-label="t('Telegram profilini ko‘rish')"><AppIcon name="chevron" :size="18" /></RouterLink>
    </div>
  </div>

  <div class="dashboard-grid">
    <section v-if="state === 'loading'" class="panel watches-panel"><div class="empty-state" role="status"><span class="loading-spinner"></span><p>{{ t('Profil tekshirilmoqda…') }}</p></div></section>
    <WatchList v-else compact />
    <aside class="how-it-works panel"><span class="eyebrow">{{ t('UCHTA ODDIY QADAM') }}</span><h2>{{ t('Qanday ishlaydi?') }}</h2><ol class="steps-list"><li v-for="(step, index) in steps" :key="step.title"><span class="step-number">0{{ index + 1 }}</span><div><h3>{{ t(step.title) }}</h3><p>{{ t(step.text) }}</p></div></li></ol><div class="help-note"><AppIcon name="sparkles" :size="19" /><p>{{ t('Avval rejalashtiramiz.') }}<br /><strong>{{ t('Keyin joylarni birga kuzatamiz.') }}</strong></p></div></aside>
  </div>
</template>
