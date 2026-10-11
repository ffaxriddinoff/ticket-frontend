interface TelegramWebApp {
  initData: string
  ready(): void
  expand(): void
  setHeaderColor?(color: string): void
  setBackgroundColor?(color: string): void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

export function getBotUrl(): string | null {
  const username = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined)?.trim().replace(/^@/, '')
  return username && /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username)
    ? `https://t.me/${username}`
    : null
}
