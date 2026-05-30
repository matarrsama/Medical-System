import { useUIStore } from '@/stores/ui'

export function useToast() {
  const ui = useUIStore()

  function success(message) {
    ui.showToast(message, 'success')
  }

  function error(message) {
    ui.showToast(message, 'error')
  }

  function info(message) {
    ui.showToast(message, 'info')
  }

  return { success, error, info }
}
