<template>
  <div v-if="visible" class="fixed bottom-6 right-6 z-50 max-w-sm w-full">
    <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-2xl p-4 flex flex-col gap-3">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span v-if="status.checking" class="material-symbols-outlined animate-spin text-primary dark:text-inverse-primary text-[20px]">sync</span>
          <span v-else-if="status.error" class="material-symbols-outlined text-error text-[20px]">error</span>
          <span v-else-if="status.downloaded" class="material-symbols-outlined text-tertiary dark:text-inverse-tertiary text-[20px]">check_circle</span>
          <span v-else-if="status.available && status.percent > 0" class="material-symbols-outlined text-secondary dark:text-inverse-secondary text-[20px]">downloading</span>
          <span v-else-if="status.available" class="material-symbols-outlined text-primary dark:text-inverse-primary text-[20px]">system_update</span>
          <span class="text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Update Available</span>
        </div>
        <button @click="dismiss" class="p-1 rounded hover:bg-surface-container-high dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Body -->
      <p v-if="status.checking" class="text-body-sm text-on-surface-variant dark:text-outline">Checking for updates...</p>
      <p v-else-if="status.version" class="text-body-sm text-on-surface-variant dark:text-outline">Version <strong>{{ status.version }}</strong> is available.</p>
      <p v-else-if="status.error" class="text-body-sm text-error">Update check failed: {{ status.error }}</p>

      <!-- Progress bar -->
      <div v-if="status.percent > 0 && !status.downloaded" class="w-full bg-surface-container-high dark:bg-white/[0.08] rounded-full h-2 overflow-hidden">
        <div class="h-full bg-primary dark:bg-inverse-primary rounded-full transition-all duration-300" :style="{ width: status.percent + '%' }"></div>
      </div>
      <p v-if="status.percent > 0 && !status.downloaded" class="text-label-xs text-on-surface-variant dark:text-outline text-right">{{ status.percent }}%</p>

      <!-- Actions -->
      <div class="flex gap-2 justify-end">
        <button v-if="status.error" @click="retry" class="text-label-sm font-label-md px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors">
          Retry
        </button>
        <button v-if="status.downloaded" @click="install" class="text-label-sm font-label-md px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors">
          Restart & Install
        </button>
        <button v-if="status.available && !status.downloaded && status.percent === 0" @click="download" class="text-label-sm font-label-md px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors">
          Download
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const status = reactive({
  checking: false,
  available: false,
  downloaded: false,
  error: null,
  version: null,
  percent: 0,
})

const dismissedVersion = ref(null)
let removeListener = null

const visible = computed(() => {
  if (!status.available && !status.error && !status.checking) return false
  if (dismissedVersion.value === status.version && !status.error) return false
  return true
})

onMounted(() => {
  if (window.electronAPI?.onUpdateStatus) {
    removeListener = window.electronAPI.onUpdateStatus((s) => {
      Object.assign(status, s)
    })
  }
  if (window.electronAPI?.getUpdateStatus) {
    window.electronAPI.getUpdateStatus().then((s) => {
      if (s) Object.assign(status, s)
    })
  }
})

onUnmounted(() => {
  if (removeListener) removeListener()
})

function dismiss() {
  dismissedVersion.value = status.version
}

function retry() {
  if (window.electronAPI?.checkForUpdates) {
    status.error = null
    status.checking = true
    window.electronAPI.checkForUpdates()
  }
}

function download() {
  if (window.electronAPI?.checkForUpdates) {
    window.electronAPI.checkForUpdates()
  }
}

function install() {
  if (window.electronAPI?.installUpdate) {
    window.electronAPI.installUpdate()
  }
}
</script>
