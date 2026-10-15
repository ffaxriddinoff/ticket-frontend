<script setup lang="ts">
import { useLocale } from '../lib/i18n'
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useProfile } from '../composables/useProfile'
import { useWatches } from '../composables/useWatches'
import { getBotUrl } from '../lib/telegram'
import { dateInUzbekistan, formatTravelDate } from '../lib/dates'

const { t } = useLocale()

const { profile, state, errorMessage, initials, loadProfile } = useProfile()
const { watches, loaded } = useWatches()
const botUrl = getBotUrl()
const subscriptionEnd = computed(() => {
  const value = profile.value?.subscription_expires_at
  if (!value || !Number.isFinite(Date.parse(value))) return '—'
  return formatTravelDate(dateInUzbekistan(new Date(value)))
})
</script>

<template>
  <section class="page-heading"><div><p class="eyebrow">{{ t('SHAXSIY KABINET') }}</p><h1>{{ t('Profil') }}<span class="greeting-dot">.</span></h1><p class="page-subtitle">{{ t('Telegram hisobingiz va obuna holati.') }}</p></div></section>
  <div class="profile-grid">
    <section class="panel profile-panel">
      <template v-if="state === 'authenticated' && profile"><div class="profile-identity"><span class="avatar avatar-large">{{ initials }}</span><h2>{{ profile.display_name || t('Sayohatchi') }}</h2><p v-if="profile.username" class="text-muted">@{{ profile.username }}</p><span class="badge badge-green"><AppIcon name="check" :size="14" /> {{ t('Telegram orqali tasdiqlangan') }}</span></div><dl class="profile-details"><div><dt>Telegram ID</dt><dd>{{ profile.telegram_id }}</dd></div><div><dt>{{ t('Obuna holati') }}</dt><dd>{{ profile.has_active_subscription ? t('Faol obuna') : t('Faol obuna yo‘q') }}</dd></div><div><dt>{{ t('Obuna muddati') }}</dt><dd>{{ subscriptionEnd }}</dd></div></dl><button class="button button-secondary full-width" type="button" @click="loadProfile"><AppIcon name="refresh" :size="17" /> {{ t('Profilni yangilash') }}</button></template>
      <div v-else-if="state === 'loading'" class="profile-placeholder" role="status"><span class="loading-spinner"></span><h2>{{ t('Profil tekshirilmoqda') }}</h2><p>{{ t('Telegram hisobingiz tasdiqlanishini kuting.') }}</p></div>
      <div v-else-if="state === 'error'" class="profile-placeholder"><span class="profile-feature-icon warning-icon"><AppIcon name="shield" :size="33" /></span><h2>{{ t('Profil ochilmadi') }}</h2><p role="alert">{{ t(errorMessage) }}</p><button class="button button-primary" type="button" @click="loadProfile"><AppIcon name="refresh" :size="18" /> {{ t('Qayta urinish') }}</button></div>
      <div v-else class="profile-placeholder"><span class="profile-feature-icon"><AppIcon name="telegram" :size="33" /></span><span class="eyebrow">{{ t('TELEGRAM BILAN BIRGA') }}</span><h2>{{ t('Profilingiz bir bosishda') }}</h2><p>{{ t('Mini App’ni Telegram botimizdan oching. Hisobingiz avtomatik tasdiqlanadi — login va parol kerak emas.') }}</p><a v-if="botUrl" :href="botUrl" class="button button-primary" target="_blank" rel="noopener noreferrer"><AppIcon name="telegram" :size="18" /> {{ t('Telegram botni ochish') }}</a><span v-else class="badge badge-neutral">{{ t('Botga ulash — keyingi qadam') }}</span></div>
    </section>
    <aside class="profile-side">
      <section class="panel profile-note"><span class="note-icon"><AppIcon name="shield" :size="22" /></span><h2>{{ t('Kirish qanday ishlaydi?') }}</h2><p>{{ t('Telegram’dan ochganingizda hisobingiz server orqali tekshiriladi. Faqat tasdiqlangan profil ma’lumotlari ko‘rsatiladi.') }}</p><ul class="check-list"><li><AppIcon name="check" :size="16" /> {{ t('Alohida parol talab qilinmaydi') }}</li><li><AppIcon name="check" :size="16" /> {{ t('Telegram hisobingiz bilan kirasiz') }}</li><li><AppIcon name="check" :size="16" /> {{ t('Profil serverdan olinadi') }}</li></ul></section>
      <section v-if="state === 'authenticated' || loaded" class="panel local-data-note"><span class="note-icon"><AppIcon name="bell" :size="22" /></span><div><h3>{{ t('{count} ta kuzatuv', { count: loaded ? watches.length : '…' }) }}</h3><p>{{ t('Kuzatuvlar hisobingizga saqlanadi. Ularni “Kuzatuvlar” sahifasida boshqarishingiz mumkin.') }}</p></div></section>
    </aside>
  </div>
</template>
