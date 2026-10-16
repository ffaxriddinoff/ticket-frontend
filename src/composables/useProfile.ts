import { computed, readonly, ref } from 'vue'
import { ApiError, getProfile } from '../lib/api'
import { getTelegramWebApp } from '../lib/telegram'
import type { UserProfile } from '../types/user'
import { t } from '../lib/i18n'

const profile = ref<UserProfile | null>(null)
const state = ref<'browser' | 'loading' | 'authenticated' | 'error'>('browser')
const errorMessage = ref('')
let activeRequest: AbortController | null = null

async function loadProfile() {
  activeRequest?.abort()
  activeRequest = null
  const webApp = getTelegramWebApp()
  const initData = webApp?.initData ?? ''
  if (!initData && !import.meta.env.DEV) {
    profile.value = null
    state.value = 'browser'
    errorMessage.value = ''
    return
  }
  if (initData && webApp) {
    webApp.ready()
    webApp.expand()
    webApp.setHeaderColor?.('#f6f8f5')
    webApp.setBackgroundColor?.('#f6f8f5')
  }
  const controller = new AbortController()
  activeRequest = controller
  const timeout = window.setTimeout(() => controller.abort(), 12_000)
  profile.value = null
  state.value = 'loading'
  errorMessage.value = ''
  try {
    const user = await getProfile(initData, controller.signal)
    if (activeRequest !== controller) return
    profile.value = user
    state.value = 'authenticated'
  } catch (error) {
    if (activeRequest !== controller) return
    state.value = 'error'
    errorMessage.value = error instanceof ApiError
      ? ({
          unauthorized: 'Kirish muddati tugagan yoki tasdiqlanmadi. Mini App’ni yopib, qayta oching.',
          auth_unavailable: 'Telegram orqali kirish hali sozlanmagan. Birozdan so‘ng qayta urinib ko‘ring.',
          invalid_response: 'Server javobini o‘qib bo‘lmadi. Qayta urinib ko‘ring.',
        }[error.code] ?? 'Profilni yuklab bo‘lmadi. Qayta urinib ko‘ring.')
      : 'Server bilan bog‘lanib bo‘lmadi. Ulanishni tekshirib, qayta urinib ko‘ring.'
  } finally {
    window.clearTimeout(timeout)
    if (activeRequest === controller) activeRequest = null
  }
}

export function useProfile() {
  return {
    profile: readonly(profile), state: readonly(state), errorMessage: readonly(errorMessage),
    displayName: computed(() => profile.value?.display_name || t('Sayohatchi')),
    initials: computed(() => (profile.value?.display_name || 'S').split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()),
    loadProfile,
  }
}
