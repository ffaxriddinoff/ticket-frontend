<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useProfile } from '../composables/useProfile'
import { useDrafts } from '../composables/useDrafts'
import { useWatches } from '../composables/useWatches'
import { getBotUrl } from '../lib/telegram'
import { dateInUzbekistan, formatTravelDate } from '../lib/dates'

const { profile, state, errorMessage, initials, loadProfile } = useProfile()
const { drafts } = useDrafts()
const { watches, loaded } = useWatches()
const botUrl = getBotUrl()
const subscriptionEnd = computed(() => {
  const value = profile.value?.subscription_expires_at
  if (!value || !Number.isFinite(Date.parse(value))) return '—'
  return formatTravelDate(dateInUzbekistan(new Date(value)))
})
</script>

<template>
  <section class="page-heading"><div><p class="eyebrow">SHAXSIY KABINET</p><h1>Profil<span class="greeting-dot">.</span></h1><p class="page-subtitle">Telegram hisobingiz va obuna holati.</p></div></section>
  <div class="profile-grid">
    <section class="panel profile-panel">
      <template v-if="state === 'authenticated' && profile"><div class="profile-identity"><span class="avatar avatar-large">{{ initials }}</span><h2>{{ profile.display_name || 'Sayohatchi' }}</h2><p v-if="profile.username" class="text-muted">@{{ profile.username }}</p><span class="badge badge-green"><AppIcon name="check" :size="14" /> Telegram orqali tasdiqlangan</span></div><dl class="profile-details"><div><dt>Telegram ID</dt><dd>{{ profile.telegram_id }}</dd></div><div><dt>Obuna holati</dt><dd>{{ profile.has_active_subscription ? 'Faol obuna' : 'Faol obuna yo‘q' }}</dd></div><div><dt>Obuna muddati</dt><dd>{{ subscriptionEnd }}</dd></div></dl><button class="button button-secondary full-width" type="button" @click="loadProfile"><AppIcon name="refresh" :size="17" /> Profilni yangilash</button></template>
      <div v-else-if="state === 'loading'" class="profile-placeholder" role="status"><span class="loading-spinner"></span><h2>Profil tekshirilmoqda</h2><p>Telegram hisobingiz tasdiqlanishini kuting.</p></div>
      <div v-else-if="state === 'error'" class="profile-placeholder"><span class="profile-feature-icon warning-icon"><AppIcon name="shield" :size="33" /></span><h2>Profil ochilmadi</h2><p role="alert">{{ errorMessage }}</p><button class="button button-primary" type="button" @click="loadProfile"><AppIcon name="refresh" :size="18" /> Qayta urinish</button></div>
      <div v-else class="profile-placeholder"><span class="profile-feature-icon"><AppIcon name="telegram" :size="33" /></span><span class="eyebrow">TELEGRAM BILAN BIRGA</span><h2>Profilingiz bir bosishda</h2><p>Mini App’ni Telegram botimizdan oching. Hisobingiz avtomatik tasdiqlanadi — login va parol kerak emas.</p><a v-if="botUrl" :href="botUrl" class="button button-primary" target="_blank" rel="noopener noreferrer"><AppIcon name="telegram" :size="18" /> Telegram botni ochish</a><span v-else class="badge badge-neutral">Botga ulash — keyingi qadam</span><span class="profile-local-note">Hozir brauzerda qoralamalar yaratishingiz mumkin.</span></div>
    </section>
    <aside class="profile-side">
      <section class="panel profile-note"><span class="note-icon"><AppIcon name="shield" :size="22" /></span><h2>Kirish qanday ishlaydi?</h2><p>Telegram’dan ochganingizda hisobingiz server orqali tekshiriladi. Faqat tasdiqlangan profil ma’lumotlari ko‘rsatiladi.</p><ul class="check-list"><li><AppIcon name="check" :size="16" /> Alohida parol talab qilinmaydi</li><li><AppIcon name="check" :size="16" /> Telegram hisobingiz bilan kirasiz</li><li><AppIcon name="check" :size="16" /> Profil serverdan olinadi</li></ul></section>
      <section v-if="state === 'authenticated'" class="panel local-data-note"><span class="note-icon"><AppIcon name="bell" :size="22" /></span><div><h3>{{ loaded ? watches.length : '…' }} ta kuzatuv</h3><p>Kuzatuvlar hisobingizga saqlanadi. Ularni “Kuzatuvlar” sahifasida boshqarishingiz mumkin.</p></div></section>
      <section v-else class="panel local-data-note"><span class="note-icon"><AppIcon name="document" :size="22" /></span><div><h3>{{ drafts.length }} ta lokal qoralama</h3><p>Qoralamalar hisobingizga sinxronlanmaydi. Brauzer ma’lumotlari tozalansa, ular ham o‘chadi.</p></div></section>
    </aside>
  </div>
</template>
