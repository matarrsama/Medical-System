import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isDark = ref(false)
  const toasts = ref([])
  const activeModal = ref(null)
  const modalData = ref(null)

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function showToast(message, type = 'success') {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  function openModal(name, data = null) {
    modalData.value = data
    activeModal.value = name
  }

  function closeModal() {
    activeModal.value = null
    modalData.value = null
  }

  return { isDark, toasts, activeModal, modalData, toggleTheme, showToast, openModal, closeModal }
})
