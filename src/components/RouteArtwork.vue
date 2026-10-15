<script setup lang="ts">
import { useLocale } from '../lib/i18n'

const { t } = useLocale()
</script>

<template>
  <div class="route-artwork" aria-hidden="true">
    <span class="art-label art-label-top"><span class="live-dot"></span> {{ t('Yaxshi safarlar oldinda') }}</span>
    <svg class="route-art" viewBox="0 0 410 220" fill="none">
      <path d="M-15 180h100c60 0 50-130 120-130h90c45 0 35 95 75 95h60" stroke="#c5d6bd" stroke-width="2" stroke-dasharray="5 7" />
      <circle cx="85" cy="180" r="9" fill="#f6f8e9" stroke="#a3bba0" stroke-width="2" />
      <circle cx="85" cy="180" r="3" fill="#176b50" />
      <circle cx="295" cy="50" r="9" fill="#f6f8e9" stroke="#a3bba0" stroke-width="2" />
      <circle cx="295" cy="50" r="3" fill="#176b50" />
      <ellipse cx="220" cy="185" rx="80" ry="10" fill="#d7e3ca" opacity=".65" />
      <path d="m155 197 15-19m100 19-15-19m-99 11h111m-105-8h97" stroke="#9cb397" stroke-width="3" stroke-linecap="round" />
      <rect x="160" y="57" width="100" height="125" rx="28" fill="#fdfef9" stroke="#a2ba9a" stroke-width="2" />
      <rect x="171" y="76" width="78" height="48" rx="10" fill="#176b50" />
      <path d="M210 77v47" stroke="#f3f6e7" stroke-width="2" />
      <path d="M187 69h46" stroke="#a2ba9a" stroke-width="3" stroke-linecap="round" />
      <path d="M161 136h98" stroke="#b8cbb0" stroke-width="2" />
      <rect x="176" y="147" width="15" height="8" rx="4" fill="#dce8b6" stroke="#9bb18b" />
      <rect x="229" y="147" width="15" height="8" rx="4" fill="#dce8b6" stroke="#9bb18b" />
      <path d="M197 166h26" stroke="#a2ba9a" stroke-width="3" stroke-linecap="round" />
      <path d="M133 79v17m-8-8h16M291 117v12m-6-6h12" stroke="#9fb78d" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span class="art-label art-label-bottom">{{ t('Sizga mos joy. Siz tanlagan safar.') }}</span>
  </div>
</template>
