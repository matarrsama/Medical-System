<template>
  <Transition name="slide">
    <div v-if="!ui.isOnline" class="bg-error-container text-on-error-container text-center py-2 px-4 text-label-sm font-label-sm flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-[16px]">wifi_off</span>
      <span>You're offline — showing cached data. Changes will sync when you reconnect.</span>
      <button @click="retry" class="underline hover:no-underline font-medium">Retry</button>
    </div>
  </Transition>
</template>

<script setup>
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

function retry() {
  window.dispatchEvent(new Event('online'))
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
