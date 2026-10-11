export type Position = 'all' | 'lower' | 'upper'
export type Zone = 'all' | 'no_side'
export type WagonType = 'seated' | 'platzkart' | 'coupe' | 'lux' | 'soft' | 'sv' | 'general'

export const positions: { value: Position; label: string }[] = [
  { value: 'all', label: 'Barchasi' },
  { value: 'lower', label: 'Pastki' },
  { value: 'upper', label: 'Yuqori' },
]
export const zones: { value: Zone; label: string }[] = [
  { value: 'all', label: 'Hamma joy' },
  { value: 'no_side', label: 'Yon joylarsiz' },
]
export const wagonTypes: { value: WagonType; label: string }[] = [
  { value: 'seated', label: 'O‘rindiqli' },
  { value: 'platzkart', label: 'Platskart' },
  { value: 'coupe', label: 'Kupe' },
  { value: 'lux', label: 'Lyuks' },
  { value: 'soft', label: 'Yumshoq' },
  { value: 'sv', label: 'SV' },
  { value: 'general', label: 'Umumiy' },
]

export interface WatchFilters {
  trains: string[]
  position: Position
  zone: Zone
  wagon_types: WagonType[]
  classes: string[]
}

export interface CreateWatchInput {
  from: string
  to: string
  trip_date: string
  filters: WatchFilters
}

export interface Watch extends CreateWatchInput {
  id: number
  user_id: number
  created_at: string
  updated_at: string
}

// Local drafts use the same form, but are saved only in this browser.
export interface DraftInput {
  from: string
  to: string
  travelDate: string
  position: Position
  zone: Zone
  wagonTypes: WagonType[]
}

export interface WatchDraft extends DraftInput {
  id: string
  updatedAt: string
}
