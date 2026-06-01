<template>
  <div class="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col dark:bg-inverse-surface dark:text-inverse-on-surface">
    <OfflineBanner />
    <!-- Login layout -->
    <template v-if="isLoginPage">
      <router-view />
    </template>

    <!-- App shell -->
    <template v-else>
      <AppTopBar />
      <div class="flex flex-1 overflow-hidden relative">
        <AppSidebar />
        <div class="sm:ml-64 ml-0 flex-1 overflow-hidden relative w-full h-full">
          <main class="p-container-padding bg-background dark:bg-inverse-surface overflow-y-auto h-[calc(100vh-64px)] w-full">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>
        </div>
      </div>
    </template>

    <!-- Floating new ticket button -->
    <button v-if="!isLoginPage" @click="ui.openModal('NewTicket')"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg hover:bg-primary-container hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center"
      title="New Ticket">
      <span class="material-symbols-outlined text-[24px]">confirmation_number</span>
    </button>

    <!-- Global modals -->
    <ModalOverlay />
    <ToastContainer />

    <!-- Force change password overlay -->
    <Teleport to="body">
      <div
        v-if="authStore.mustChangePassword && authStore.mustChangeChecked"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-lg"
      >
        <div class="absolute inset-0 bg-on-surface/60 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-md z-10 shadow-2xl bg-surface-container-lowest rounded-xl overflow-hidden">
          <ChangePasswordModal />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useSettings } from '@/composables/useSettings'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'
import ChangePasswordModal from '@/components/modals/ChangePasswordModal.vue'
import OfflineBanner from '@/components/OfflineBanner.vue'
import { useOfflineSync } from '@/composables/useOfflineSync'

const route = useRoute()
const ui = useUIStore()
const authStore = useAuthStore()
const { replayQueue, init: initSync } = useOfflineSync()

function goOnline() { ui.isOnline = true; setTimeout(replayQueue, 1000) }
function goOffline() { ui.isOnline = false }

onMounted(() => {
  authStore.init()
  ui.isOnline = navigator.onLine
  window.addEventListener('online', goOnline)
  window.addEventListener('offline', goOffline)
  initSync()
})

onUnmounted(() => {
  window.removeEventListener('online', goOnline)
  window.removeEventListener('offline', goOffline)
})

const { hospitalName } = useSettings()

watch(hospitalName, (val) => {
  document.title = val
  if (window.electronAPI?.setAppTitle) {
    window.electronAPI.setAppTitle(val)
  }
}, { immediate: true })

const isLoginPage = computed(() => route.path === '/login' || route.path === '/')


</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
