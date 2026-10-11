// Profile returned by GET /api/v1/me.
export interface UserProfile {
  id: number
  telegram_id: number
  username: string
  display_name: string
  plan_id: number | null
  subscription_expires_at: string | null
  has_active_subscription: boolean
  created_at: string
}
