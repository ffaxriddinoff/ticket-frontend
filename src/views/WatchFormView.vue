<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { useDrafts, validateDraft } from '../composables/useDrafts'
import { useNotice } from '../composables/useNotice'
import { useProfile } from '../composables/useProfile'
import { useWatches } from '../composables/useWatches'
import { ApiError, apiErrorMessage } from '../lib/api'
import { todayInUzbekistan } from '../lib/dates'
import { positions, wagonTypes, zones } from '../types/watch'
import type { DraftInput } from '../types/watch'

const route = useRoute()
const router = useRouter()
const { drafts, saveDraft } = useDrafts()
const { createWatch } = useWatches()
const { state } = useProfile()
const { notify } = useNotice()
const draftID = typeof route.params.id === 'string' ? route.params.id : undefined
const editingDraft = draftID ? drafts.value.find((draft) => draft.id === draftID) : undefined
const missingDraft = !!draftID && !editingDraft
const mode = ref<'watch' | 'draft' | null>(state.value === 'loading' ? null : state.value === 'authenticated' && !draftID ? 'watch' : 'draft')
const creatingWatch = computed(() => mode.value === 'watch')
const title = computed(() => missingDraft ? 'Qoralama topilmadi' : draftID ? 'Qoralamani tahrirlash' : mode.value === null ? 'Safarni rejalashtirish' : creatingWatch.value ? 'Yangi kuzatuv' : 'Yangi qoralama')
const formElement = ref<HTMLFormElement | null>(null)
const form = ref<DraftInput>(editingDraft
  ? { from: editingDraft.from, to: editingDraft.to, travelDate: editingDraft.travelDate, position: editingDraft.position, zone: editingDraft.zone, wagonTypes: [...editingDraft.wagonTypes] }
  : { from: '', to: '', travelDate: '', position: 'all', zone: 'all', wagonTypes: [] })
const errors = ref<Record<string, string>>({})
const saveError = ref('')
const filterError = ref('')
const saving = ref(false)

// Direct links wait for Telegram authentication before choosing where to save.
watch(state, (authState) => {
  if (mode.value === null && authState !== 'loading') {
    mode.value = authState === 'authenticated' && !draftID ? 'watch' : 'draft'
  }
})

onBeforeRouteLeave(() => !saving.value)

function goBack() {
  if (saving.value) return
  const previousPath: unknown = window.history.state?.back
  if (previousPath === '/' || previousPath === '/watches' || previousPath === '/profile') router.back()
  else void router.push('/watches')
}

function swapStations() {
  const from = form.value.from
  form.value.from = form.value.to
  form.value.to = from
  errors.value = {}
}

async function focusInvalidField() {
  await nextTick()
  formElement.value?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
}

async function save() {
  if (saving.value || mode.value === null || missingDraft) return
  errors.value = validateDraft(form.value, creatingWatch.value ? 30 : 80)
  saveError.value = ''
  filterError.value = ''
  if (Object.keys(errors.value).length) {
    await focusInvalidField()
    return
  }
  saving.value = true
  let failed = false
  try {
    if (creatingWatch.value) {
      await createWatch({
        from: form.value.from.trim(),
        to: form.value.to.trim(),
        trip_date: form.value.travelDate,
        filters: {
          trains: [], classes: [],
          position: form.value.position,
          zone: form.value.zone,
          wagon_types: [...form.value.wagonTypes],
        },
      })
    } else {
      const result = saveDraft(form.value, draftID)
      if (!result.ok) {
        saveError.value = result.message || 'Qoralamani saqlab bo‘lmadi.'
        return
      }
    }
  } catch (error) {
    saveError.value = apiErrorMessage(error, 'Kuzatuvni saqlab bo‘lmadi. Qayta urinib ko‘ring.')
    if (error instanceof ApiError) {
      const fields = error.fields
      if (fields.from?.length) errors.value.from = 'Jo‘nash qiymatini tekshiring.'
      if (fields.to?.length) errors.value.to = 'Borish qiymatini tekshiring.'
      if (fields.trip_date?.length || error.code === 'invalid_trip_date') errors.value.travelDate = 'Safar sanasini tekshiring.'
      if (Object.keys(fields).some((field) => field === 'filters' || field.startsWith('filters.'))) filterError.value = 'Joy filtrlarini tekshiring.'
    }
    failed = true
  } finally {
    saving.value = false
  }
  if (failed) {
    await focusInvalidField()
    return
  }
  notify(creatingWatch.value ? 'Kuzatuv hisobingizga saqlandi.' : draftID ? 'Qoralama yangilandi.' : 'Qoralama shu brauzerda saqlandi.')
  await router.replace('/watches')
}
</script>

<template>
  <div class="form-page">
    <header class="form-page-heading">
      <button class="icon-button form-back" type="button" :disabled="saving" aria-label="Orqaga" @click="goBack"><AppIcon name="back" :size="22" /></button>
      <div><h1>{{ title }}</h1><p>Marshrut va qulay joylarni tanlang.</p></div>
      <span class="form-heading-icon"><AppIcon :name="creatingWatch ? 'bell' : 'document'" :size="21" /></span>
    </header>

    <section v-if="missingDraft" class="panel empty-state"><span class="empty-icon"><AppIcon name="document" :size="28" /></span><h2>Bu qoralama mavjud emas</h2><p>Saqlangan qoralamalaringizdan birini tanlang.</p><RouterLink to="/watches" class="button button-primary">Kuzatuvlarga qaytish</RouterLink></section>
    <section v-else-if="mode === null" class="panel empty-state" role="status"><span class="loading-spinner"></span><p>Profil tekshirilmoqda…</p></section>
    <form v-else ref="formElement" novalidate :aria-busy="saving" @submit.prevent="save">
      <fieldset class="watch-form-fields" :disabled="saving" aria-label="Safar ma’lumotlari">
        <section class="panel form-section">
          <h2><span class="form-section-icon"><AppIcon name="pin" :size="20" /></span> Marshrut</h2>
          <div class="station-fields">
            <div class="field"><label for="from">Qayerdan</label><input id="from" v-model="form.from" autocomplete="off" :maxlength="creatingWatch ? 30 : 80" placeholder="Masalan, Toshkent" :aria-invalid="!!errors.from" :aria-describedby="errors.from ? 'from-error' : undefined" /><span v-if="errors.from" id="from-error" class="field-error">{{ errors.from }}</span></div>
            <button class="swap-button" type="button" aria-label="Bekatlar o‘rnini almashtirish" @click="swapStations"><AppIcon name="swap" :size="18" /></button>
            <div class="field"><label for="to">Qayerga</label><input id="to" v-model="form.to" autocomplete="off" :maxlength="creatingWatch ? 30 : 80" placeholder="Masalan, Urganch" :aria-invalid="!!errors.to" :aria-describedby="errors.to ? 'to-error' : undefined" /><span v-if="errors.to" id="to-error" class="field-error">{{ errors.to }}</span></div>
          </div>
          <div class="field date-field"><label for="travel-date">Safar sanasi</label><input id="travel-date" v-model="form.travelDate" type="date" :min="todayInUzbekistan()" :aria-invalid="!!errors.travelDate" :aria-describedby="errors.travelDate ? 'date-error' : undefined" /><span v-if="errors.travelDate" id="date-error" class="field-error">{{ errors.travelDate }}</span></div>
        </section>
        <section class="panel form-section">
          <h2><span class="form-section-icon"><AppIcon name="seat" :size="20" /></span> Qulay joyingiz</h2>
          <fieldset><legend>Joy pozitsiyasi</legend><div class="segmented-control"><label v-for="option in positions" :key="option.value" :class="{ selected: form.position === option.value }"><input v-model="form.position" type="radio" name="position" :value="option.value" /><span>{{ option.label }}</span></label></div></fieldset>
          <fieldset><legend>Joy zonasi</legend><div class="segmented-control"><label v-for="option in zones" :key="option.value" :class="{ selected: form.zone === option.value }"><input v-model="form.zone" type="radio" name="zone" :value="option.value" /><span>{{ option.label }}</span></label></div><p class="field-hint">Yon joylar — platskart vagonining yo‘lak tomonidagi joylar.</p></fieldset>
          <fieldset><legend>Vagon turi <span class="text-muted">· ixtiyoriy</span></legend><div class="wagon-options"><label v-for="option in wagonTypes" :key="option.value" :class="{ selected: form.wagonTypes.includes(option.value) }"><input v-model="form.wagonTypes" type="checkbox" :value="option.value" /><AppIcon v-if="form.wagonTypes.includes(option.value)" name="check" :size="14" /><span>{{ option.label }}</span></label></div><p class="field-hint">Tanlanmasa, barcha vagon turlari hisobga olinadi.</p></fieldset>
          <p v-if="filterError" class="field-error save-error" role="alert">{{ filterError }}</p>
        </section>
      </fieldset>
      <div class="info-box"><AppIcon :name="creatingWatch ? 'shield' : 'document'" :size="19" /><p v-if="creatingWatch"><strong>Kuzatuv hisobingizga saqlanadi.</strong> Joylarni avtomatik tekshirish va Telegram xabarlari keyingi bosqichda ulanadi.</p><p v-else><strong>Qoralama shu brauzerda saqlanadi.</strong> Hisobingizga kuzatuv qo‘shish uchun Mini App’ni Telegram’dan oching.</p></div>
      <p v-if="saveError" class="field-error save-error" role="alert">{{ saveError }}</p>
      <div class="form-actions"><div class="form-actions-inner"><button class="button button-secondary" type="button" :disabled="saving" @click="goBack">Bekor qilish</button><button class="button button-primary" type="submit" :disabled="saving"><AppIcon :name="saving ? 'clock' : 'check'" :size="18" /> {{ saving ? 'Saqlanmoqda…' : creatingWatch ? 'Kuzatuvni saqlash' : 'Qoralamani saqlash' }}</button></div></div>
    </form>
  </div>
</template>
