import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isDark = ref(false)
  const toasts = ref([])
  const activeModal = ref(null)
  const modalData = ref(null)
  const modalExpanded = ref(false)

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
    modalExpanded.value = false
  }

  function closeModal() {
    activeModal.value = null
    modalData.value = null
    modalExpanded.value = false
  }

  function toggleModalExpanded() {
    modalExpanded.value = !modalExpanded.value
  }

  return { isDark, toasts, activeModal, modalData, modalExpanded, toggleTheme, showToast, openModal, closeModal, toggleModalExpanded }
})
