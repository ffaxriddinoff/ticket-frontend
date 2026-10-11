<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AppIcon from './components/AppIcon.vue'
import { useDrafts } from './composables/useDrafts'
import { useNotice } from './composables/useNotice'
import { useProfile } from './composables/useProfile'
import { useWatches } from './composables/useWatches'

const route = useRoute()
const isFormPage = computed(() => route.meta.formPage === true)
const { profile, state, initials, loadProfile } = useProfile()
const { drafts } = useDrafts()
const { watches, loadWatches, resetWatches } = useWatches()
const savedCount = computed(() => state.value === 'authenticated' ? watches.value.length : state.value === 'loading' ? 0 : drafts.value.length)
const { notice, dismiss } = useNotice()
const navigation = [
  { to: '/', label: 'Asosiy', icon: 'home' },
  { to: '/watches', label: 'Kuzatuvlar', icon: 'bell' },
  { to: '/profile', label: 'Profil', icon: 'user' },
]

onBeforeMount(loadProfile)
onBeforeUnmount(resetWatches)

watch(() => state.value === 'authenticated' ? profile.value?.id : null, (userID) => {
  resetWatches()
  if (userID) void loadWatches()
}, { immediate: true, flush: 'sync' })

</script>

<template>
  <a href="#main-content" class="skip-link">Asosiy qismga o‘tish</a>
  <div class="app-shell">
    <header v-if="!isFormPage" class="app-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand" aria-label="Railway Ticket — asosiy sahifa"><span class="brand-icon"><AppIcon name="train" :size="25" /></span><span>railway<span class="brand-light">ticket</span><span class="brand-dot">.</span></span></RouterLink>
        <nav class="desktop-nav" aria-label="Asosiy navigatsiya"><RouterLink v-for="item in navigation" :key="item.to" :to="item.to" exact-active-class="is-active"><AppIcon :name="item.icon" :size="18" />{{ item.label }}<span v-if="item.to === '/watches' && savedCount" class="nav-count">{{ savedCount }}</span></RouterLink></nav>
        <div class="header-actions"><span class="header-status"><span class="status-dot" :class="{ connected: state === 'authenticated' }"></span>{{ state === 'authenticated' ? 'Telegram ulangan' : 'Boshlang‘ich versiya' }}</span><RouterLink to="/profile" class="avatar avatar-small" aria-label="Profilni ochish"><span v-if="state === 'authenticated'">{{ initials }}</span><AppIcon v-else name="user" :size="18" /></RouterLink></div>
      </div>
    </header>

    <div class="page-container" :class="{ 'page-container-form': isFormPage }">
      <div v-if="state === 'error'" class="preview-banner error-banner"><AppIcon name="info" :size="18" /><p>Telegram profilini tasdiqlab bo‘lmadi.</p><RouterLink to="/profile">Tekshirish<AppIcon name="arrow" :size="15" /></RouterLink></div>
      <main id="main-content" tabindex="-1"><RouterView v-slot="{ Component, route: currentRoute }"><component :is="Component" :key="currentRoute.fullPath" /></RouterView></main>
      <footer v-if="!isFormPage" class="app-footer"><span class="footer-brand"><AppIcon name="train" :size="17" /> Railway Ticket</span><span>Yaxshi safarlar shu yerdan boshlanadi.</span><span class="footer-version">Boshlang‘ich versiya · v0.1</span></footer>
    </div>

    <nav v-if="!isFormPage" class="mobile-nav" aria-label="Mobil navigatsiya"><RouterLink v-for="item in navigation" :key="item.to" :to="item.to" exact-active-class="is-active"><span class="mobile-nav-icon"><AppIcon :name="item.icon" :size="21" /></span><span>{{ item.label }}</span></RouterLink><RouterLink to="/watches/new" exact-active-class="is-active"><span class="mobile-nav-icon mobile-add-icon"><AppIcon name="plus" :size="21" /></span><span>Yangi</span></RouterLink></nav>
    <Transition name="notice"><div v-if="notice" class="toast" :class="{ 'toast-error': notice.error }" role="status" aria-live="polite"><span class="toast-icon"><AppIcon :name="notice.error ? 'info' : 'check'" :size="18" /></span><span>{{ notice.message }}</span><button class="icon-button" type="button" aria-label="Xabarni yopish" @click="dismiss"><AppIcon name="close" :size="16" /></button></div></Transition>
  </div>
</template>
