<template>
  <div class="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col dark:bg-inverse-surface dark:text-inverse-on-surface">
    <!-- Login layout -->
    <template v-if="isLoginPage">
      <router-view />
    </template>

    <!-- App shell -->
    <template v-else>
      <AppTopBar @new-ticket="ui.openModal('NewTicket')" @sync-data="syncMockData" />
      <div class="flex flex-1 overflow-hidden relative">
        <AppSidebar />
        <div class="ml-64 flex-1 overflow-hidden relative w-full h-full">
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

    <!-- Global modals -->
    <ModalOverlay />
    <ToastContainer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { seedAll } from '@/services/api.js'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'

const route = useRoute()
const ui = useUIStore()
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})

const isLoginPage = computed(() => route.path === '/login' || route.path === '/')

async function syncMockData() {
  ui.showToast('Seeding all data to Firestore...', 'info')
  try {
    const result = await seedAll()
    const total = Object.values(result).reduce((sum, c) => sum + c.created, 0)
    const skipped = Object.values(result).reduce((sum, c) => sum + c.skipped, 0)
    const errors = Object.values(result).reduce((sum, c) => sum + c.errors.length, 0)
    ui.showToast(`Seeded ${total} docs (${skipped} skipped, ${errors} errors)`, errors > 0 ? 'warn' : 'success')
  } catch (err) {
    ui.showToast(`Seed failed: ${err.message}`, 'error')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
