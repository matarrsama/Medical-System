import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isDark = ref(false)
  const toasts = ref([])
  const activeModal = ref(null)
  const modalData = ref(null)
  const modalExpanded = ref(false)
  const sidebarOpen = ref(false)
  const searchOpen = ref(false)
  const isOnline = ref(navigator.onLine)

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

  function switchModal(name, data) {
    activeModal.value = name
    modalData.value = data
    modalExpanded.value = false
  }

  function toggleModalExpanded() {
    modalExpanded.value = !modalExpanded.value
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function toggleSearch() {
    searchOpen.value = !searchOpen.value
  }

  return { isDark, toasts, activeModal, modalData, modalExpanded, sidebarOpen, searchOpen, isOnline, toggleTheme, showToast, openModal, closeModal, switchModal, toggleModalExpanded, toggleSidebar, closeSidebar, toggleSearch }
})
