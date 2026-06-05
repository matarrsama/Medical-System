<template>
  <aside
    :class="[
      'bg-surface-container dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flex flex-col h-full fixed left-0 top-0 pt-16 z-20 overflow-y-auto w-64 shadow-[1px_0_4px_rgba(0,0,0,0.02)]',
      'max-sm:transition-transform max-sm:duration-300 max-sm:ease-in-out',
      ui.sidebarOpen ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'
    ]"
  >
    <div class="flex items-center justify-end px-sm pt-sm sm:hidden">
      <button @click="ui.closeSidebar()" class="p-1 rounded-full hover:bg-surface-container-high dark:hover:bg-white/[0.08] transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
    <div class="flex flex-col items-center py-4 px-4 border-b border-outline-variant/30 dark:border-outline/30">
      <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-container-highest dark:border-white/[0.12] flex items-center justify-center bg-surface-container-high dark:bg-white/[0.08] text-on-surface-variant dark:text-outline font-bold text-title-md select-none mb-2">
        <img v-if="auth.user?.avatar" class="w-full h-full object-cover" :src="auth.user?.avatar" alt="" />
        <span v-else class="uppercase tracking-tighter">{{ auth.user?.initials || 'U' }}</span>
      </div>
      <span class="text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface truncate max-w-[180px] text-center">{{ auth.user?.displayName || 'User' }}</span>
      <span class="text-label-xs text-on-surface-variant dark:text-outline truncate max-w-[180px] text-center">{{ auth.departmentHeadOf ? `Head of ${auth.departmentHeadOf}` : auth.user?.department || '' }}</span>
    </div>
    <nav class="flex-1 py-md px-sm flex flex-col gap-xs overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center px-4 py-2 gap-3 rounded-lg transition-colors group"
        :class="$route.path === item.to
          ? 'bg-secondary-container text-on-secondary-container font-bold rounded-lg scale-95 dark:bg-secondary dark:text-on-secondary'
          : 'text-on-surface-variant dark:text-outline hover:bg-surface-container-high hover:text-on-surface dark:hover:bg-inverse-surface dark:hover:text-inverse-on-surface'"
      >
        <span class="material-symbols-outlined text-[20px]" :class="$route.path === item.to ? 'icon-fill' : ''">{{ item.icon }}</span>
        <span class="text-label-md font-label-md">{{ item.label }}</span>
      </router-link>
      <div class="my-2 border-t border-outline-variant/30 dark:border-outline/30 mx-2"></div>
      <router-link
        v-for="item in bottomNavItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center px-4 py-2 gap-3 rounded-lg transition-colors group"
        :class="$route.path === item.to
          ? 'bg-secondary-container text-on-secondary-container font-bold rounded-lg scale-95 dark:bg-secondary dark:text-on-secondary'
          : 'text-on-surface-variant dark:text-outline hover:bg-surface-container-high hover:text-on-surface dark:hover:bg-inverse-surface dark:hover:text-inverse-on-surface'"
      >
        <span class="material-symbols-outlined text-[20px]" :class="$route.path === item.to ? 'icon-fill' : ''">{{ item.icon }}</span>
        <span class="text-label-md font-label-md">{{ item.label }}</span>
      </router-link>
    </nav>
    <div class="p-md border-t border-outline-variant dark:border-outline mt-auto flex flex-col gap-sm">
      <button @click="handleLogout" :disabled="signingOut" class="w-full text-outline dark:text-outline border border-outline-variant dark:border-outline hover:bg-error-container dark:hover:bg-error-container/30 hover:text-on-error-container dark:hover:text-on-error-container transition-colors text-label-md font-label-md py-2 rounded-lg flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="signingOut" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">logout</span>
        Sign Out
      </button>
    </div>
  </aside>
  <div v-if="ui.sidebarOpen" @click="ui.closeSidebar()" class="fixed inset-0 bg-black/50 z-10 sm:hidden"></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
const $route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const ui = useUIStore()

const signingOut = ref(false)

async function handleLogout() {
  if (signingOut.value) return
  signingOut.value = true
  try {
    await auth.logout()
    router.push('/login')
  } finally {
    signingOut.value = false
  }
}

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/tickets', icon: 'confirmation_number', label: 'Tickets' },
  { to: '/requests', icon: 'assignment_returned', label: 'Requests' },
  { to: '/inventory', icon: 'inventory_2', label: 'Inventory' },
  { to: '/procurement', icon: 'shopping_cart', label: 'Procurement' },
  { to: '/maintenance', icon: 'build', label: 'Maintenance' },
  { to: '/biomedical', icon: 'medical_services', label: 'Biomedical' },
  { to: '/leave-requests', icon: 'event', label: 'Leave Requests' }
]

const bottomNavItems = computed(() => {
  const items = []
  if (auth.canAccessDepartments) {
    items.push({ to: '/departments', icon: 'domain', label: auth.canManageDepartments ? 'Departments' : 'My Department' })
  }
  items.push({ to: '/reports', icon: 'analytics', label: 'Reports' })
  items.push({ to: '/settings', icon: 'settings', label: 'Settings' })
  if (auth.canManageRoles) {
    items.push({ to: '/roles', icon: 'badge', label: 'Roles' })
  }
  if (auth.canAccessAdmin) {
    items.push({ to: '/admin', icon: 'admin_panel_settings', label: 'Admin' })
  }
  if (auth.canViewUsers) {
    items.push({ to: '/staffs', icon: 'group', label: 'Staffs' })
  }
  if (auth.canAccessAuditLogs) {
    items.push({ to: '/audit-logs', icon: 'history_edu', label: 'Audit Logs' })
  }
  return items
})
</script>
