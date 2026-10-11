export function todayInUzbekistan(): string {
  return dateInUzbekistan(new Date())
}

export function dateInUzbekistan(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function formatTravelDate(value: string): string {
  if (!isValidDate(value)) return value
  // Some WebViews lack uz-UZ month names, so keep the calendar labels explicit.
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
  const [year, month, day] = value.split('-')
  return `${Number(day)}-${months[Number(month) - 1]}, ${year}`
}
