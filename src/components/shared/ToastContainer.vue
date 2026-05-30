<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="['px-lg py-md rounded-lg shadow-lg border text-label-md font-bold flex items-center gap-2 pointer-events-auto transition-all duration-300', toastClass(toast.type)]"
        >
          <span class="material-symbols-outlined text-[18px]" :class="toast.type === 'success' ? 'icon-fill' : ''">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'warning' : 'info' }}
          </span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useUIStore } from '@/stores/ui'
const ui = useUIStore()

function toastClass(type) {
  if (type === 'success') return 'bg-green-500 text-white border-green-600'
  if (type === 'error') return 'bg-error text-white border-error-container'
  return 'bg-surface-container text-on-surface border-outline-variant'
}
</script>

<style scoped>
.toast-enter-active { animation: slideIn 0.3s ease-out; }
.toast-leave-active { animation: fadeOut 0.3s ease-in; }
@keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
</style>
