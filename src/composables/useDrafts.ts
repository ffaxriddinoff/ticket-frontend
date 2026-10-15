import { ref, shallowReadonly } from 'vue'
import { isValidDate, todayInUzbekistan } from '../lib/dates'
import { positions, wagonTypes, zones } from '../types/watch'
import type { DraftInput, WatchDraft } from '../types/watch'

const storageKey = 'railway-ticket.watch-drafts.v1'
const drafts = ref<WatchDraft[]>([])
const storageMessage = ref('')
let initialized = false

export function validateDraft(input: DraftInput, maxRouteLength = 80): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!input.from.trim()) errors.from = 'Jo‘nash bekatini kiriting.'
  if (!input.to.trim()) errors.to = 'Borish bekatini kiriting.'
  if (input.from.trim() && input.from.trim().toLocaleLowerCase() === input.to.trim().toLocaleLowerCase()) {
    errors.to = 'Jo‘nash va borish bekatlari farq qilishi kerak.'
  }
  if ([...input.from.trim()].length > maxRouteLength) errors.from = `Jo‘nash nomi ${maxRouteLength} belgidan oshmasin.`
  if ([...input.to.trim()].length > maxRouteLength) errors.to = `Borish nomi ${maxRouteLength} belgidan oshmasin.`
  if (!isValidDate(input.travelDate)) errors.travelDate = 'Safar sanasini tanlang.'
  else if (input.travelDate < todayInUzbekistan()) errors.travelDate = 'Safar sanasi o‘tib ketgan. Yangi sana tanlang.'
  return errors
}

function isStoredDraft(value: unknown): value is WatchDraft {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 100
    && typeof item.from === 'string' && item.from.trim().length > 0 && item.from.length <= 80
    && typeof item.to === 'string' && item.to.trim().length > 0 && item.to.length <= 80
    && typeof item.travelDate === 'string' && isValidDate(item.travelDate)
    && typeof item.updatedAt === 'string' && Number.isFinite(Date.parse(item.updatedAt))
    && positions.some((option) => option.value === item.position)
    && zones.some((option) => option.value === item.zone)
    && Array.isArray(item.wagonTypes) && item.wagonTypes.length <= wagonTypes.length
    && item.wagonTypes.every((type: unknown) => wagonTypes.some((option) => option.value === type))
    && (item.trains === undefined || (Array.isArray(item.trains)
      && item.trains.every((number: unknown) => typeof number === 'string' && number.trim().length > 0 && number.length <= 100)))
}

function loadDrafts() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    if (raw.length > 100_000) throw new Error('Invalid draft storage')
    const stored: unknown = JSON.parse(raw)
    if (!stored || typeof stored !== 'object' || !('version' in stored) || stored.version !== 1
      || !('drafts' in stored) || !Array.isArray(stored.drafts) || stored.drafts.length > 50
      || !stored.drafts.every(isStoredDraft)) throw new Error('Invalid draft storage')
    drafts.value = stored.drafts.filter((draft, index, all) => all.findIndex((item) => item.id === draft.id) === index)
  } catch {
    storageMessage.value = 'Brauzerdagi qoralamalarni o‘qib bo‘lmadi. Ular bu qurilmada saqlanadi.'
  }
}

function persist(next: WatchDraft[]): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, drafts: next }))
    drafts.value = next
    storageMessage.value = ''
    return true
  } catch {
    storageMessage.value = 'Qoralama saqlanmadi. Brauzer xotirasi to‘lgan yoki saqlashga ruxsat berilmagan.'
    return false
  }
}

function removeDraft(id: string): boolean {
  return persist(drafts.value.filter((draft) => draft.id !== id))
}

export function useDrafts() {
  if (!initialized) {
    initialized = true
    loadDrafts()
  }
  return { drafts: shallowReadonly(drafts), storageMessage: shallowReadonly(storageMessage), removeDraft }
}
