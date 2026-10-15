import { onScopeDispose, ref, shallowRef, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { apiErrorMessage, getTrains } from '../lib/api'
import { getTelegramWebApp } from '../lib/telegram'
import type { Train, TrainSearchParams } from '../types/train'

export function useTrains(query: ComputedRef<TrainSearchParams | null>) {
  const trains = shallowRef<Train[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  let activeRequest: AbortController | null = null
  let pendingTimer: number | undefined

  function cancel() {
    window.clearTimeout(pendingTimer)
    pendingTimer = undefined
    activeRequest?.abort()
    activeRequest = null
  }

  async function loadTrains(input = query.value): Promise<void> {
    cancel()
    if (!input) return

    const controller = new AbortController()
    activeRequest = controller
    loading.value = true
    errorMessage.value = ''

    try {
      const result = await getTrains(input, getTelegramWebApp()?.initData ?? '', controller.signal)
      if (activeRequest !== controller) return
      trains.value = result
    } catch (error) {
      if (activeRequest !== controller) return
      trains.value = []
      errorMessage.value = apiErrorMessage(error, 'Poyezdlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.')
    } finally {
      if (activeRequest === controller) {
        activeRequest = null
        loading.value = false
      }
    }
  }

  watch(query, (input) => {
    cancel()
    trains.value = []
    errorMessage.value = ''
    loading.value = !!input
    if (input) pendingTimer = window.setTimeout(() => { void loadTrains(input) }, 250)
  }, { immediate: true })

  onScopeDispose(cancel)

  return { trains, loading, errorMessage, loadTrains: () => loadTrains() }
}
