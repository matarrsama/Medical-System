import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSyncStore = defineStore('sync', () => {
  const pendingCount = ref(0)
  const syncing = ref(false)

  async function refresh() {
    if (window.electronAPI?.queue) {
      pendingCount.value = await window.electronAPI.queue.count()
    }
  }

  async function add(op) {
    if (window.electronAPI?.queue) {
      pendingCount.value = await window.electronAPI.queue.add(op)
    }
  }

  async function remove(id) {
    if (window.electronAPI?.queue) {
      pendingCount.value = await window.electronAPI.queue.remove(id)
    }
  }

  async function flush() {
    if (window.electronAPI?.queue) {
      await window.electronAPI.queue.flush()
      pendingCount.value = 0
    }
  }

  return { pendingCount, syncing, refresh, add, remove, flush }
})
