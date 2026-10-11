import { ref, shallowReadonly } from 'vue'
import { ApiError, apiErrorMessage, createWatch as postWatch, deleteWatch, getWatches } from '../lib/api'
import { getTelegramWebApp } from '../lib/telegram'
import type { CreateWatchInput, Watch } from '../types/watch'
import { useProfile } from './useProfile'

const watches = ref<Watch[]>([])
const loading = ref(false)
const loaded = ref(false)
const errorMessage = ref('')
const creating = ref(false)
const deletingIds = ref(new Set<number>())
let activeRequest: AbortController | null = null
let sessionVersion = 0
let mutationVersion = 0

function session() {
  const { profile, state } = useProfile()
  const initData = getTelegramWebApp()?.initData
  if (state.value !== 'authenticated' || !profile.value || !initData) {
    throw new ApiError(401, 'unauthorized')
  }
  return { initData, userID: profile.value.id, version: sessionVersion }
}

function resetWatches() {
  sessionVersion++
  mutationVersion++
  activeRequest?.abort()
  activeRequest = null
  watches.value = []
  loading.value = false
  loaded.value = false
  errorMessage.value = ''
  creating.value = false
  deletingIds.value = new Set()
}

async function loadWatches() {
  const controller = new AbortController()
  activeRequest?.abort()
  activeRequest = controller
  loading.value = true
  errorMessage.value = ''
  const revision = mutationVersion
  try {
    const current = session()
    const result = await getWatches(current.initData, controller.signal)
    if (activeRequest !== controller || current.version !== sessionVersion) return
    if (revision !== mutationVersion) {
      void loadWatches()
      return
    }
    if (result.some((watch) => watch.user_id !== current.userID)) {
      throw new ApiError(200, 'invalid_response')
    }
    watches.value = result
    loaded.value = true
  } catch (error) {
    if (activeRequest !== controller) return
    errorMessage.value = apiErrorMessage(error, 'Kuzatuvlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.')
  } finally {
    if (activeRequest === controller) {
      activeRequest = null
      loading.value = false
    }
  }
}

async function createWatch(input: CreateWatchInput): Promise<Watch> {
  const current = session()
  creating.value = true
  try {
    const watch = await postWatch(current.initData, input)
    if (current.version !== sessionVersion) throw new ApiError(401, 'unauthorized')
    if (watch.user_id !== current.userID) throw new ApiError(201, 'invalid_response')
    mutationVersion++
    watches.value = [watch, ...watches.value.filter((item) => item.id !== watch.id)]
    // Recover a list that failed before this successful create.
    if (!loaded.value && !loading.value) void loadWatches()
    return watch
  } finally {
    if (current.version === sessionVersion) creating.value = false
  }
}

async function removeWatch(id: number): Promise<void> {
  if (deletingIds.value.has(id)) return
  const current = session()
  deletingIds.value = new Set([...deletingIds.value, id])
  try {
    try {
      await deleteWatch(current.initData, id)
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404 && error.code === 'watch_not_found')) throw error
    }
    if (current.version !== sessionVersion) throw new ApiError(401, 'unauthorized')
    mutationVersion++
    watches.value = watches.value.filter((watch) => watch.id !== id)
  } finally {
    if (current.version === sessionVersion) {
      const next = new Set(deletingIds.value)
      next.delete(id)
      deletingIds.value = next
    }
  }
}

export function useWatches() {
  return {
    watches: shallowReadonly(watches),
    loading: shallowReadonly(loading),
    loaded: shallowReadonly(loaded),
    errorMessage: shallowReadonly(errorMessage),
    creating: shallowReadonly(creating),
    deletingIds: shallowReadonly(deletingIds),
    loadWatches, resetWatches, createWatch, removeWatch,
  }
}
