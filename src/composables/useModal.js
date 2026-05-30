import { useUIStore } from '@/stores/ui'

export function useModal() {
  const ui = useUIStore()

  function open(name) {
    ui.openModal(name)
  }

  function close() {
    ui.closeModal()
  }

  return { open, close }
}
