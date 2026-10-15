<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useLocale } from '../lib/i18n'
import type { Train } from '../types/train'

defineProps<{ trains: readonly Train[]; loading?: boolean; error?: string }>()
defineEmits<{ retry: [] }>()
const selected = defineModel<string[]>({ required: true })
const { t } = useLocale()

function arrivalOffset(train: Train): number {
  const departureDay = train.departure_date.slice(0, 10).split('.').reverse().join('-')
  const arrivalDay = train.arrival_date.slice(0, 10).split('.').reverse().join('-')
  const difference = Date.parse(`${arrivalDay}T00:00:00Z`) - Date.parse(`${departureDay}T00:00:00Z`)
  return Number.isFinite(difference) ? Math.max(0, Math.round(difference / 86_400_000)) : 0
}
</script>

<template>
  <section class="panel form-section train-section" aria-labelledby="train-section-title" :aria-busy="loading">
    <div class="train-section-heading">
      <h2 id="train-section-title">
        <span class="form-section-icon"><AppIcon name="train" :size="20" /></span>
        {{ t('Poyezdlar') }}
      </h2>
    </div>

    <div v-if="loading" class="train-state" role="status">
      <span class="loading-spinner"></span>
      <p>{{ t('Poyezdlar qidirilmoqda…') }}</p>
    </div>
    <div v-else-if="error" class="train-state train-state-error" role="alert">
      <p>{{ t(error) }}</p>
      <button class="text-button" type="button" @click="$emit('retry')">
        <AppIcon name="refresh" :size="16" />{{ t('Qayta urinish') }}
      </button>
    </div>
    <div v-else-if="!trains.length" class="train-state" role="status">
      <AppIcon name="calendar" :size="23" />
      <p>{{ t('Bu yo‘nalish va sanaga poyezd topilmadi.') }}</p>
    </div>

    <template v-else>
    <div class="train-selection-summary">
      <p id="train-selection-hint" aria-live="polite">
        {{ selected.length
          ? t('{count} ta poyezd tanlandi', { count: selected.length })
          : t('Tanlanmasa, barcha poyezdlar kuzatiladi.') }}
      </p>
      <button v-if="selected.length" class="text-button" type="button" @click="selected = []">
        {{ t('Tozalash') }}
      </button>
    </div>

    <div class="train-options" role="group" aria-labelledby="train-section-title" aria-describedby="train-selection-hint">
      <label
        v-for="train in trains"
        :key="train.number"
        class="train-choice"
        :class="{ 'is-selected': selected.includes(train.number) }"
      >
        <input
          v-model="selected"
          type="checkbox"
          :value="train.number"
          :aria-label="t('{number} poyezdini tanlash', { number: train.number })"
        />
        <span class="train-identity">
          <strong class="train-number">{{ train.number }}</strong>
          <span class="train-brand">{{ t(train.brand) }}</span>
        </span>

        <span class="train-timing">
          <span class="train-time">
            <strong>{{ train.departure_date.slice(-5) }}</strong>
            <span>{{ t('Jo‘nash') }}</span>
          </span>
          <span class="train-direction"><AppIcon name="arrow" :size="17" /></span>
          <span class="train-time">
            <strong>
              {{ train.arrival_date.slice(-5) }}
              <small
                v-if="arrivalOffset(train)"
                class="train-day-offset"
                :title="t('{count} kun keyin', { count: arrivalOffset(train) })"
              >+{{ arrivalOffset(train) }}</small>
            </strong>
            <span>{{ t('Kelish') }}</span>
          </span>
        </span>

        <span class="train-choice-mark" aria-hidden="true">
          <AppIcon :name="selected.includes(train.number) ? 'check' : 'plus'" :size="18" />
        </span>
      </label>
    </div>

    </template>
  </section>
</template>

<style scoped>
.train-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.train-section .train-section-heading h2 { margin: 0; font-size: 15px; }
.train-state { display: flex; align-items: center; gap: 12px; min-height: 94px; padding: 18px 0 0; color: var(--muted); font-size: 12px; line-height: 1.8; }
.train-state .loading-spinner { width: 20px; height: 20px; margin: 0; flex-shrink: 0; border-width: 2px; }
.train-state-error { flex-wrap: wrap; gap: 6px 16px; color: #ad634e; }
.train-state-error > p { flex: 1 1 240px; }
.train-state-error > button { flex-shrink: 0; }
.train-selection-summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 25px; margin: 12px 0 15px; }
.train-selection-summary > p { color: var(--muted); font-size: 11px; line-height: 1.7; }
.train-selection-summary > button { flex-shrink: 0; padding: 2px 0; }
.train-options { display: grid; gap: 9px; }
.train-choice { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto 34px; align-items: center; gap: 20px; min-height: 84px; padding: 15px 16px; border: 1px solid var(--border); border-radius: 12px; background: #fcfdfb; cursor: pointer; transition: border-color .15s, background .15s; }
.train-choice:hover { border-color: #b6cbb0; background: #f8fbf5; }
.train-choice.is-selected { border-color: #7da78b; background: #f0f7ee; }
.train-choice:has(input:focus-visible) { outline: 3px solid #9cbc7e; outline-offset: 3px; }
.train-choice:has(input:disabled) { opacity: .55; cursor: not-allowed; }
.train-choice > input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.train-identity { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.train-number { font-size: 17px; line-height: 1.4; font-weight: 800; letter-spacing: -.4px; }
.train-brand { font-size: 11px; line-height: 1.5; color: var(--muted); overflow-wrap: anywhere; }
.train-timing { display: flex; align-items: center; gap: 18px; }
.train-time { display: flex; flex-direction: column; gap: 5px; }
.train-time > strong { position: relative; font-size: 18px; font-weight: 750; line-height: 1.2; letter-spacing: -.6px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.train-time > span { font-size: 9px; line-height: 1.5; color: #8b988a; }
.train-direction { display: flex; align-items: center; color: #a3b49c; padding-bottom: 17px; }
.train-day-offset { position: absolute; top: -8px; right: -11px; color: #859579; font-size: 9px; line-height: 1.4; letter-spacing: 0; }
.train-choice-mark { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #dbe6d5; border-radius: 10px; background: #f0f5eb; color: #78956a; }
.is-selected .train-choice-mark { border-color: var(--accent); background: var(--accent); color: #fff; }
.is-selected .train-number { color: var(--accent); }
@media (max-width: 540px) {
  .train-choice { min-height: 80px; gap: 12px; padding: 13px 12px; grid-template-columns: minmax(0, 1fr) auto 30px; }
  .train-number { font-size: 15px; }
  .train-brand { font-size: 10px; }
  .train-timing { gap: 9px; }
  .train-time > strong { font-size: 17px; }
  .train-direction > svg { width: 14px; height: 14px; }
  .train-choice-mark { width: 30px; height: 30px; border-radius: 9px; }
}
@media (max-width: 359px) {
  .train-choice { grid-template-columns: minmax(0, 1fr) 30px; gap: 10px; }
  .train-identity { grid-column: 1; grid-row: 1; flex-direction: row; align-items: baseline; flex-wrap: wrap; gap: 3px 8px; }
  .train-timing { grid-column: 1; grid-row: 2; gap: 16px; }
  .train-choice-mark { grid-column: 2; grid-row: 1 / 3; }
}
</style>
