import { ref, shallowReadonly } from 'vue'

const notice = ref<{ message: string; error: boolean } | null>(null)
let timeout: ReturnType<typeof setTimeout> | undefined

export function useNotice() {
  return {
    notice: shallowReadonly(notice),
    notify(message: string, error = false) {
      clearTimeout(timeout)
      notice.value = { message, error }
      timeout = setTimeout(() => { notice.value = null }, 5000)
    },
    dismiss() {
      clearTimeout(timeout)
      notice.value = null
    },
  }
}
