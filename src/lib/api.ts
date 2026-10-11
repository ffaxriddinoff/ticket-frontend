import { isValidDate } from './dates'
import type { UserProfile } from '../types/user'
import { positions, wagonTypes, zones } from '../types/watch'
import type { CreateWatchInput, Watch, WatchFilters } from '../types/watch'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly fields: Record<string, string[]> = {},
  ) {
    super(code)
    this.name = 'ApiError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function errorFields(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {}
  const fields: Record<string, string[]> = {}
  for (const [field, errors] of Object.entries(value)) {
    const messages = typeof errors === 'string' ? [errors]
      : Array.isArray(errors) ? errors
      : isRecord(errors) ? Object.values(errors) : []
    fields[field] = messages.filter((message): message is string => typeof message === 'string')
  }
  return fields
}

async function request(path: string, initData: string, options: RequestInit = {}) {
  if (!initData) throw new ApiError(401, 'unauthorized')
  const controller = new AbortController()
  const abort = () => controller.abort()
  const signal = options.signal
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', abort, { once: true })
  const timeout = window.setTimeout(abort, 12_000)

  try {
    const headers = new Headers(options.headers)
    headers.set('Authorization', `tma ${initData}`)
    headers.set('Accept', 'application/json')
    if (options.body) headers.set('Content-Type', 'application/json')
    const response = await fetch(path, {
      ...options, headers, cache: 'no-store', signal: controller.signal,
    })
    const body: unknown = response.status === 204
      ? null : await response.json().catch((error: unknown) => {
          if (controller.signal.aborted) throw error
          return null
        })
    if (!response.ok) {
      const error = isRecord(body) && isRecord(body.error) ? body.error : null
      const fallback = response.status === 401 ? 'unauthorized'
        : response.status === 503 ? 'auth_unavailable' : 'api_error'
      throw new ApiError(
        response.status,
        typeof error?.code === 'string' ? error.code : fallback,
        errorFields(error?.fields),
      )
    }
    return { response, body }
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export async function getProfile(initData: string, signal: AbortSignal): Promise<UserProfile> {
  const { response, body } = await request('/api/v1/me', initData, { signal })
  if (!isRecord(body) || !isProfile(body.data)) {
    throw new ApiError(response.status, 'invalid_response')
  }
  return body.data
}

export async function getWatches(initData: string, signal?: AbortSignal): Promise<Watch[]> {
  const { response, body } = await request('/api/v1/watches', initData, { signal })
  if (!isRecord(body) || !Array.isArray(body.data)) {
    throw new ApiError(response.status, 'invalid_response')
  }
  return body.data.map((value: unknown) => {
    const watch = parseWatch(value)
    if (!watch) throw new ApiError(response.status, 'invalid_response')
    return watch
  })
}

export async function createWatch(
  initData: string,
  input: CreateWatchInput,
  signal?: AbortSignal,
): Promise<Watch> {
  const { response, body } = await request('/api/v1/watches', initData, {
    method: 'POST', body: JSON.stringify(input), signal,
  })
  const watch = isRecord(body) ? parseWatch(body.data) : null
  if (!watch) throw new ApiError(response.status, 'invalid_response')
  return watch
}

export async function deleteWatch(initData: string, id: number, signal?: AbortSignal): Promise<void> {
  const { response } = await request(`/api/v1/watches/${id}`, initData, {
    method: 'DELETE', signal,
  })
  if (response.status !== 204) throw new ApiError(response.status, 'invalid_response')
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Kirish muddati tugagan. Mini App’ni yopib, qayta oching.'
    if (error.code === 'auth_unavailable') return 'Telegram orqali kirish vaqtincha ishlamayapti. Birozdan so‘ng qayta urinib ko‘ring.'
    if (error.code === 'invalid_response') return 'Server javobini o‘qib bo‘lmadi. Qayta urinib ko‘ring.'
    if (error.status === 422) return 'Kiritilgan ma’lumotlarni tekshiring.'
    if (error.status === 404) return 'Kuzatuv topilmadi. Ro‘yxatni yangilang.'
  }
  if (error instanceof Error && error.name === 'AbortError') return 'Server javobi kechikdi. Qayta urinib ko‘ring.'
  if (error instanceof TypeError) return 'Server bilan bog‘lanib bo‘lmadi. Ulanishni tekshiring.'
  return fallback
}

function isProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) return false
  return typeof value.id === 'number' && typeof value.telegram_id === 'number'
    && typeof value.display_name === 'string' && typeof value.username === 'string'
    && (value.plan_id === null || typeof value.plan_id === 'number')
    && (value.subscription_expires_at === null || typeof value.subscription_expires_at === 'string')
    && typeof value.has_active_subscription === 'boolean' && typeof value.created_at === 'string'
}

function stringList(value: unknown): string[] | null {
  // Go slices can be null in an older record's JSON.
  if (value === null) return []
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : null
}

function parseWatch(value: unknown): Watch | null {
  if (!isRecord(value) || !isRecord(value.filters)) return null
  const filters = value.filters
  const trains = stringList(filters.trains)
  const classes = stringList(filters.classes)
  const wagons = stringList(filters.wagon_types)
  if (trains === null || classes === null || wagons === null
    || !positions.some((option) => option.value === filters.position)
    || !zones.some((option) => option.value === filters.zone)
    || !wagons.every((type) => wagonTypes.some((option) => option.value === type))
    || !Number.isSafeInteger(value.id) || (value.id as number) <= 0
    || !Number.isSafeInteger(value.user_id) || (value.user_id as number) <= 0
    || typeof value.from !== 'string' || typeof value.to !== 'string'
    || typeof value.trip_date !== 'string' || !isValidDate(value.trip_date)
    || typeof value.created_at !== 'string' || !Number.isFinite(Date.parse(value.created_at))
    || typeof value.updated_at !== 'string' || !Number.isFinite(Date.parse(value.updated_at))) return null
  return {
    id: value.id as number, user_id: value.user_id as number,
    from: value.from, to: value.to, trip_date: value.trip_date,
    created_at: value.created_at, updated_at: value.updated_at,
    filters: {
      trains, classes,
      position: filters.position as WatchFilters['position'],
      zone: filters.zone as WatchFilters['zone'],
      wagon_types: wagons as WatchFilters['wagon_types'],
    },
  }
}
