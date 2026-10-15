import { computed, ref, shallowRef } from 'vue'
import { ApiError, apiErrorMessage, getStations } from '../lib/api'
import { useLocale } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { getTelegramWebApp } from '../lib/telegram'
import type { Station, StationOption } from '../types/station'

const languages: readonly Locale[] = ['uz', 'ru', 'en']
const catalogs = shallowRef<Partial<Record<Locale, Station[]>>>({})
const loading = ref(false)
const errorMessage = ref('')
const { locale, t } = useLocale()
const stations = computed<StationOption[]>(() => {
  const names = new Map<string, string[]>()
  for (const list of Object.values(catalogs.value)) {
    for (const station of list ?? []) {
      const translations = names.get(station.code) ?? []
      translations.push(station.name)
      names.set(station.code, translations)
    }
  }
  return (catalogs.value[locale.value] ?? []).map((station) => ({
    ...station,
    searchNames: names.get(station.code) ?? [station.name],
  }))
})
const loaded = computed(() => languages.every((language) => !!catalogs.value[language]))
let activeRequest: AbortController | null = null
let pending: Promise<void> | null = null

async function loadStations(force = false): Promise<void> {
  if (!force && loaded.value) return
  if (!force && activeRequest && pending) return pending
  activeRequest?.abort()
  const controller = new AbortController()
  activeRequest = controller
  loading.value = true
  errorMessage.value = ''
  const initData = getTelegramWebApp()?.initData ?? ''

  pending = (async () => {
    try {
      // Fetch translations once, match by code, and keep search entirely in the browser.
      const [uz, ru, en] = await Promise.all(
        languages.map((language) => getStations(language, initData, controller.signal)),
      )
      if (activeRequest !== controller) return
      const codes = new Set(uz.map((station) => station.code))
      if ([ru, en].some((list) => list.length !== uz.length || list.some((station) => !codes.has(station.code)))) {
        throw new ApiError(200, 'invalid_response')
      }
      catalogs.value = { uz, ru, en }
    } catch (error) {
      if (activeRequest !== controller) return
      controller.abort()
      errorMessage.value = apiErrorMessage(error, 'Bekatlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.')
    } finally {
      if (activeRequest === controller) {
        activeRequest = null
        pending = null
        loading.value = false
      }
    }
  })()
  return pending
}

function normalize(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f‘’ʻʼ`']/g, '').toLowerCase()
}

function resolveStationCode(value: string): string | undefined {
  const query = normalize(value)
  for (const list of Object.values(catalogs.value)) {
    const station = list?.find((item) => item.code === value || normalize(item.name) === query)
    if (station) return station.code
  }
}

function stationName(value: string): string {
  const code = resolveStationCode(value)
  const station = stations.value.find((item) => item.code === code)
  if (station) return station.name
  if (/^\d{7}$/.test(value)) return t(loading.value ? 'Bekatlar yuklanmoqda…' : 'Bekat nomi mavjud emas')
  return value
}

export function useStations() {
  return { stations, loaded, loading, errorMessage, loadStations, resolveStationCode, stationName }
}
