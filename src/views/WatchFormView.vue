<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import LanguageSelect from '../components/LanguageSelect.vue'
import StationSelect from '../components/StationSelect.vue'
import TrainSelect from '../components/TrainSelect.vue'
import TrainClassSelect from '../components/TrainClassSelect.vue'
import { useDrafts, validateDraft } from '../composables/useDrafts'
import { useNotice } from '../composables/useNotice'
import { useProfile } from '../composables/useProfile'
import { useWatches } from '../composables/useWatches'
import { useStations } from '../composables/useStations'
import { useTrains } from '../composables/useTrains'
import { useLocale } from '../lib/i18n'
import { ApiError, apiErrorMessage } from '../lib/api'
import { isValidDate, todayInUzbekistan } from '../lib/dates'
import { positions, selectableWagonTypes, zones } from '../types/watch'
import type { DraftInput, TrainClass } from '../types/watch'
import type { TrainSearchParams } from '../types/train'

const route = useRoute()
const router = useRouter()
const { drafts } = useDrafts()
const { createWatch } = useWatches()
const { state } = useProfile()
const { notify } = useNotice()
const { stations, loading: stationsLoading, loaded: stationsLoaded, errorMessage: stationsError, loadStations, resolveStationCode } = useStations()
const { t, locale } = useLocale()
const draftID = typeof route.params.id === 'string' ? route.params.id : undefined
const editingDraft = draftID ? drafts.value.find((draft) => draft.id === draftID) : undefined
const availableDraftWagons = editingDraft?.wagonTypes.filter((type) => selectableWagonTypes.some((option) => option.value === type)) ?? []
const hasUnavailableDraftWagons = !!editingDraft && availableDraftWagons.length !== editingDraft.wagonTypes.length
const missingDraft = !!draftID && !editingDraft
const title = computed(() => missingDraft ? 'Qoralama topilmadi' : draftID ? 'Qoralamadan kuzatuv yaratish' : 'Yangi kuzatuv')
const formElement = ref<HTMLFormElement | null>(null)
const saveErrorElement = ref<HTMLParagraphElement | null>(null)
const form = ref<DraftInput>(editingDraft
  ? { from: editingDraft.from, to: editingDraft.to, travelDate: editingDraft.travelDate, position: editingDraft.position, zone: editingDraft.zone, wagonTypes: availableDraftWagons }
  : { from: '', to: '', travelDate: '', position: 'all', zone: 'all', wagonTypes: [] })
const errors = ref<Record<string, string>>({})
const saveError = ref('')
const filterError = ref('')
const classError = ref('')
const saving = ref(false)

const selectedTrainNumbers = ref<string[]>([...(editingDraft?.trains ?? [])])
const selectedTrainClasses = ref<TrainClass[]>([])
const trainQuery = computed<TrainSearchParams | null>(() => {
  const { from, to, travelDate } = form.value
  const validStations = stationsLoaded.value && from !== to
    && stations.value.some((station) => station.code === from)
    && stations.value.some((station) => station.code === to)
  return !missingDraft && validStations && isValidDate(travelDate) && travelDate >= todayInUzbekistan()
    ? { from, to, trip_date: travelDate, lang: locale.value }
    : null
})
const { trains, loading: trainsLoading, errorMessage: trainsError, loadTrains } = useTrains(trainQuery)
const hasSelectedHighSpeedTrain = computed(() => trains.value.some((train) => {
  if (!selectedTrainNumbers.value.includes(train.number)) return false
  const brand = train.brand.normalize('NFKC').toLowerCase()
  return ['afrosiyob', 'afrosiab', 'афросиаб', 'афросиёб', 'афросиоб', 'manguberdi', 'мангуберди']
    .some((name) => brand.includes(name))
}))
const showTrainClasses = computed(() => !trainsLoading.value && !trainsError.value && hasSelectedHighSpeedTrain.value)

watch(() => [form.value.from, form.value.to, form.value.travelDate], () => {
  selectedTrainNumbers.value = []
  selectedTrainClasses.value = []
  classError.value = ''
})

watch([hasSelectedHighSpeedTrain, trainsLoading], ([hasHighSpeedTrain, loading]) => {
  // A language change reloads train names; retain class choices during that request.
  if (loading || hasHighSpeedTrain) return
  selectedTrainClasses.value = []
  classError.value = ''
})

watch(stations, () => {
  for (const field of ['from', 'to'] as const) {
    const code = resolveStationCode(form.value[field])
    if (code) form.value[field] = code
  }
}, { immediate: true })

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
  const field = formElement.value?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
  if (field) field.focus()
  else saveErrorElement.value?.focus()
}

async function save() {
  if (saving.value || stationsLoading.value || !stationsLoaded.value || trainsLoading.value || trainsError.value || state.value === 'loading' || missingDraft) return
  errors.value = validateDraft(form.value, 30)
  if (!stations.value.some((station) => station.code === form.value.from)) errors.value.from = 'Jo‘nash bekatini ro‘yxatdan tanlang.'
  if (!stations.value.some((station) => station.code === form.value.to)) errors.value.to = 'Borish bekatini ro‘yxatdan tanlang.'
  saveError.value = ''
  filterError.value = ''
  classError.value = ''
  if (Object.keys(errors.value).length) {
    await focusInvalidField()
    return
  }
  saving.value = true
  let failed = false
  try {
    await createWatch({
      from: form.value.from.trim(),
      to: form.value.to.trim(),
      trip_date: form.value.travelDate,
      filters: {
        trains: [...selectedTrainNumbers.value],
        classes: showTrainClasses.value ? [...selectedTrainClasses.value] : [],
        position: form.value.position,
        zone: form.value.zone,
        wagon_types: form.value.wagonTypes.filter((type) => selectableWagonTypes.some((option) => option.value === type)),
      },
    })
  } catch (error) {
    saveError.value = apiErrorMessage(error, 'Kuzatuvni saqlab bo‘lmadi. Qayta urinib ko‘ring.')
    if (error instanceof ApiError) {
      const fields = error.fields
      if (fields.from?.length) errors.value.from = 'Jo‘nash qiymatini tekshiring.'
      if (fields.to?.length) errors.value.to = 'Borish qiymatini tekshiring.'
      if (fields.trip_date?.length || error.code === 'invalid_trip_date') errors.value.travelDate = 'Safar sanasini tekshiring.'
      const isClassField = (field: string) => field === 'filters.classes' || field.startsWith('filters.classes.')
      if (Object.keys(fields).some(isClassField)) classError.value = 'Klass tanlovini tekshiring.'
      if (Object.keys(fields).some((field) => (field === 'filters' || field.startsWith('filters.')) && !isClassField(field))) filterError.value = 'Joy filtrlarini tekshiring.'
    }
    failed = true
  } finally {
    saving.value = false
  }
  if (failed) {
    await focusInvalidField()
    return
  }
  notify('Kuzatuv hisobingizga saqlandi.')
  await router.replace('/watches')
}
</script>

<template>
  <div class="form-page">
    <header class="form-page-heading">
      <button class="icon-button form-back" type="button" :disabled="saving" :aria-label="t('Orqaga')" @click="goBack"><AppIcon name="back" :size="22" /></button>
      <div><h1>{{ t(title) }}</h1><p>{{ t('Marshrut va qulay joylarni tanlang.') }}</p></div>
      <LanguageSelect />
    </header>

    <section v-if="missingDraft" class="panel empty-state"><span class="empty-icon"><AppIcon name="document" :size="28" /></span><h2>{{ t('Bu qoralama mavjud emas') }}</h2><p>{{ t('Saqlangan qoralamalaringizdan birini tanlang.') }}</p><RouterLink to="/watches" class="button button-primary">{{ t('Kuzatuvlarga qaytish') }}</RouterLink></section>
    <section v-else-if="state === 'loading'" class="panel empty-state" role="status"><span class="loading-spinner"></span><p>{{ t('Profil tekshirilmoqda…') }}</p></section>
    <form v-else ref="formElement" novalidate :aria-busy="saving || stationsLoading" @submit.prevent="save">
      <fieldset class="watch-form-fields" :disabled="saving" :aria-label="t('Safar ma’lumotlari')">
        <section class="panel form-section">
          <h2><span class="form-section-icon"><AppIcon name="pin" :size="20" /></span> {{ t('Marshrut') }}</h2>
          <div v-if="stationsError" class="station-load-error" role="alert"><p>{{ t(stationsError) }}</p><button class="text-button" type="button" :disabled="stationsLoading" @click="loadStations(true)"><AppIcon name="refresh" :size="16" />{{ t('Qayta urinish') }}</button></div>
          <div class="station-fields">
            <StationSelect id="from" v-model="form.from" :label="t('Qayerdan')" :stations="stations" :loading="stationsLoading" :disabled="saving" :error="errors.from" />
            <button class="swap-button" type="button" :aria-label="t('Bekatlar o‘rnini almashtirish')" @click="swapStations"><AppIcon name="swap" :size="18" /></button>
            <StationSelect id="to" v-model="form.to" :label="t('Qayerga')" :stations="stations" :loading="stationsLoading" :disabled="saving" :error="errors.to" />
          </div>
          <div class="field date-field"><label for="travel-date">{{ t('Safar sanasi') }}</label><input id="travel-date" v-model="form.travelDate" type="date" :min="todayInUzbekistan()" :aria-invalid="!!errors.travelDate" :aria-describedby="errors.travelDate ? 'date-error' : undefined" /><span v-if="errors.travelDate" id="date-error" class="field-error">{{ t(errors.travelDate) }}</span></div>
        </section>
        <TrainSelect v-if="trainQuery" v-model="selectedTrainNumbers" :trains="trains" :loading="trainsLoading" :error="trainsError" @retry="loadTrains" />
        <section class="panel form-section">
          <h2><span class="form-section-icon"><AppIcon name="seat" :size="20" /></span> {{ t('Qulay joyingiz') }}</h2>
          <fieldset><legend>{{ t('Joy pozitsiyasi') }}</legend><div class="segmented-control"><label v-for="option in positions" :key="option.value" :class="{ selected: form.position === option.value }"><input v-model="form.position" type="radio" name="position" :value="option.value" /><span>{{ t(option.label) }}</span></label></div></fieldset>
          <fieldset><legend>{{ t('Joy zonasi') }}</legend><div class="segmented-control"><label v-for="option in zones" :key="option.value" :class="{ selected: form.zone === option.value }"><input v-model="form.zone" type="radio" name="zone" :value="option.value" /><span>{{ t(option.label) }}</span></label></div><p class="field-hint">{{ t('Yon joylar — platskart vagonining yo‘lak tomonidagi joylar.') }}</p></fieldset>
          <fieldset><legend>{{ t('Vagon turi') }} <span class="text-muted">{{ t('· ixtiyoriy') }}</span></legend><div class="wagon-options"><label v-for="option in selectableWagonTypes" :key="option.value" :class="{ selected: form.wagonTypes.includes(option.value) }"><input v-model="form.wagonTypes" type="checkbox" :value="option.value" /><AppIcon v-if="form.wagonTypes.includes(option.value)" name="check" :size="14" /><span>{{ t(option.label) }}</span></label></div><p class="field-hint">{{ t('Tanlanmasa, barcha vagon turlari hisobga olinadi.') }}</p><p v-if="hasUnavailableDraftWagons" class="inline-warning">{{ t('Avvalgi qoralamadagi ayrim vagon turlari hozir tanlanmaydi. Vagon turini qayta tanlang.') }}</p></fieldset>
          <p v-if="filterError" class="field-error save-error" role="alert">{{ t(filterError) }}</p>
        </section>
        <TrainClassSelect v-if="showTrainClasses" v-model="selectedTrainClasses" :error="classError" />
      </fieldset>
      <p v-if="saveError" ref="saveErrorElement" class="field-error save-error" role="alert" tabindex="-1">{{ t(saveError) }}</p>
      <div class="form-actions"><div class="form-actions-inner"><button class="button button-secondary" type="button" :disabled="saving" @click="goBack">{{ t('Bekor qilish') }}</button><button class="button button-primary" type="submit" :disabled="saving || stationsLoading || !stationsLoaded || trainsLoading || !!trainsError"><AppIcon :name="saving ? 'clock' : 'check'" :size="18" /> {{ saving ? t('Saqlanmoqda…') : t('Kuzatuvni saqlash') }}</button></div></div>
    </form>
  </div>
</template>
