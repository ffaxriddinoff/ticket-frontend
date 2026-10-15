import { readonly, ref } from 'vue'
import { messages } from '../locales/messages'

export type Locale = 'uz' | 'ru' | 'en'
const storageKey = 'railway-ticket.locale'

function savedLocale(): Locale {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'ru' || saved === 'en') return saved
  } catch { /* Language selection still works when storage is unavailable. */ }
  return 'uz'
}

const locale = ref<Locale>(savedLocale())
document.documentElement.lang = locale.value

export function setLocale(value: string) {
  if (value !== 'uz' && value !== 'ru' && value !== 'en') return
  locale.value = value
  document.documentElement.lang = value
  try { localStorage.setItem(storageKey, value) } catch { /* Keep the current session's language. */ }
}

export function t(message: string, values: Record<string, string | number> = {}): string {
  const translated = locale.value === 'uz' ? message : messages[message]?.[locale.value === 'ru' ? 0 : 1] ?? message
  return translated.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}

export function useLocale() {
  return { locale: readonly(locale), setLocale, t }
}
