import type { Locale } from '../lib/i18n'

export interface Train {
  number: string
  brand: string
  departure_date: string
  arrival_date: string
}

export interface TrainSearchParams {
  from: string
  to: string
  trip_date: string
  lang: Locale
}
