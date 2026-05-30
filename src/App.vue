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
import { syncData } from '@/services/api.js'
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
  ui.showToast('Syncing mock data to Firestore...', 'info')
  const users = [
    { name: 'Dr. Sarah Chen', initials: 'SC', email: 'sarah.chen@hospital.org', employeeId: 'BGH-XK4-M7', title: 'Chief of Emergency Medicine', department: 'ER', role: 'Physician', status: 'Active', mfa: 'push', created: '2024-08-15', lastActive: '2 min ago' },
    { name: 'James Okafor', initials: 'JO', email: 'james.okafor@hospital.org', employeeId: 'BGH-9PL-2R', title: 'Senior Network Engineer', department: 'ICT', role: 'ICT Officer', status: 'Active', mfa: 'push', created: '2024-06-01', lastActive: '15 min ago' },
    { name: 'Maria Gonzalez', initials: 'MG', email: 'maria.g@hospital.org', employeeId: 'BGH-3WN-8K', title: 'Registered Nurse', department: 'Maternity', role: 'Nurse', status: 'Active', mfa: 'sms', created: '2025-01-20', lastActive: '1 hour ago' },
    { name: 'Ahmed Al-Rashid', initials: 'AA', email: 'ahmed.al@hospital.org', employeeId: 'BGH-6HB-4D', title: 'Systems Administrator', department: 'ICT', role: 'Sys Administrator', status: 'Active', mfa: 'push', created: '2023-11-10', lastActive: '5 min ago' },
    { name: 'Lisa Thompson', initials: 'LT', email: 'lisa.t@hospital.org', employeeId: 'BGH-2FV-9A', title: 'Administrative Assistant', department: 'Administration', role: 'Viewer', status: 'Inactive', mfa: 'none', created: '2024-03-05', lastActive: '3 days ago' },
    { name: 'John Mwangi', initials: 'JM', email: 'john.mwangi@hospital.org', employeeId: 'BGH-8TY-1X', title: 'Senior Accountant', department: 'Finance', role: 'Accounting', status: 'Active', mfa: 'push', created: '2024-09-12', lastActive: '30 min ago' },
    { name: 'Grace Akinyi', initials: 'GA', email: 'grace.akinyi@hospital.org', employeeId: 'BGH-5RM-6C', title: 'Procurement Officer', department: 'Procurement', role: 'Procurement', status: 'Active', mfa: 'sms', created: '2025-02-18', lastActive: '1 hour ago' },
    { name: 'Dr. Peter Kamau', initials: 'PK', email: 'peter.kamau@hospital.org', employeeId: 'BGH-1GJ-3W', title: 'Hospital Director', department: 'Super Admin', role: 'Hospital Admin', status: 'Active', mfa: 'push', created: '2023-06-01', lastActive: '10 min ago' },
    { name: 'Mary Wanjiku', initials: 'MW', email: 'mary.wanjiku@hospital.org', employeeId: 'BGH-4KL-8Z', title: 'Senior Lab Technologist', department: 'LAB', role: 'Lab Technician', status: 'Active', mfa: 'none', created: '2024-07-22', lastActive: '45 min ago' },
    { name: 'David Otieno', initials: 'DO', email: 'david.otieno@hospital.org', employeeId: 'BGH-7NA-2M', title: 'Clinical Pharmacist', department: 'Pharmacy', role: 'Pharmacist', status: 'Active', mfa: 'push', created: '2025-04-10', lastActive: '20 min ago' }
  ]
  try {
    const result = await syncData(users)
    ui.showToast(`Synced ${result.created} users to Firestore`, result.failed > 0 ? 'warn' : 'success')
  } catch (err) {
    ui.showToast(`Sync failed: ${err.message}`, 'error')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
