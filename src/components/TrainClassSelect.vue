<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useLocale } from '../lib/i18n'
import { trainClasses } from '../types/watch'
import type { TrainClass } from '../types/watch'

defineProps<{ error?: string }>()
const selected = defineModel<TrainClass[]>({ required: true })
const { t } = useLocale()
</script>

<template>
  <section class="panel form-section train-class-section" aria-labelledby="train-class-title">
    <h2 id="train-class-title">
      <span class="form-section-icon"><AppIcon name="sparkles" :size="20" /></span>
      <span class="train-class-title">{{ t('Tezyurar') }}<small>({{ t('Afrosiyob, Jaloliddin Manguberdi') }})</small></span>
    </h2>
    <p id="train-class-hint" class="train-class-hint">{{ t('Tanlanmasa, barcha klasslar kuzatiladi. Bir yoki bir nechta klassni tanlashingiz mumkin.') }}</p>
    <div class="train-class-options" role="group" :aria-label="t('Poyezd klassi')" :aria-describedby="error ? 'train-class-hint train-class-error' : 'train-class-hint'">
      <label v-for="option in trainClasses" :key="option.value" :class="{ selected: selected.includes(option.value) }">
        <input v-model="selected" type="checkbox" name="train-classes" :value="option.value" :aria-invalid="!!error" :aria-describedby="error ? 'train-class-error' : undefined" />
        <AppIcon v-if="selected.includes(option.value)" name="check" :size="15" />
        <span>{{ t(option.label) }}</span>
      </label>
    </div>
    <p v-if="error" id="train-class-error" class="field-error save-error" role="alert">{{ t(error) }}</p>
  </section>
</template>

<style scoped>
.train-class-section h2 { align-items: flex-start; margin-bottom: 10px; }
.train-class-section .form-section-icon { flex-shrink: 0; }
.train-class-title { display: grid; gap: 3px; line-height: 1.5; }
.train-class-title small { color: var(--muted); font-size: 11px; font-weight: 500; }
.train-class-hint { margin-bottom: 16px; color: var(--muted); font-size: 11px; line-height: 1.8; }
.train-class-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.train-class-options label { position: relative; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 10px 8px; border: 1px solid #e1e8d9; border-radius: 9px; background: #fbfcf9; color: #68795c; font-size: 12px; cursor: pointer; }
.train-class-options label.selected { border-color: #bfd2a8; background: #eaf3e2; color: #4c7440; font-weight: 750; }
.train-class-options label:has(input:focus-visible) { outline: 3px solid #a5bd89; outline-offset: 2px; }
.train-class-options input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.train-class-options svg { flex-shrink: 0; }
</style>
