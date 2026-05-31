<template>
  <aside class="bg-surface-container dark:bg-surface-container-low border-r border-outline-variant dark:border-outline flex flex-col h-full fixed left-0 top-0 pt-16 z-20 overflow-y-auto w-64 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
    <div class="p-lg flex items-center gap-sm border-b border-outline-variant/50">
      <div class="w-10 h-10 rounded bg-primary flex items-center justify-center text-on-primary shrink-0">
        <span class="material-symbols-outlined icon-fill">health_and_safety</span>
      </div>
      <div class="overflow-hidden">
        <h2 class="text-headline-sm font-headline-md font-black text-on-surface dark:text-inverse-on-surface truncate">{{ displayName }}</h2>
      </div>
    </div>
    <nav class="flex-1 py-md px-sm flex flex-col gap-xs overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center px-4 py-2 gap-3 rounded-lg transition-colors group"
        :class="$route.path === item.to
          ? 'bg-secondary-container text-on-secondary-container font-bold rounded-lg scale-95 dark:bg-secondary dark:text-on-secondary'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface dark:hover:bg-inverse-surface dark:hover:text-inverse-on-surface'"
      >
        <span class="material-symbols-outlined text-[20px]" :class="$route.path === item.to ? 'icon-fill' : ''">{{ item.icon }}</span>
        <span class="text-label-md font-label-md">{{ item.label }}</span>
      </router-link>
      <div class="my-2 border-t border-outline-variant/30 mx-2"></div>
      <router-link
        v-for="item in bottomNavItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center px-4 py-2 gap-3 rounded-lg transition-colors group"
        :class="$route.path === item.to
          ? 'bg-secondary-container text-on-secondary-container font-bold rounded-lg scale-95 dark:bg-secondary dark:text-on-secondary'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface dark:hover:bg-inverse-surface dark:hover:text-inverse-on-surface'"
      >
        <span class="material-symbols-outlined text-[20px]" :class="$route.path === item.to ? 'icon-fill' : ''">{{ item.icon }}</span>
        <span class="text-label-md font-label-md">{{ item.label }}</span>
      </router-link>
    </nav>
    <div class="p-md border-t border-outline-variant mt-auto flex flex-col gap-sm">
      <button @click="handleLogout" :disabled="signingOut" class="w-full text-outline border border-outline-variant hover:bg-error-container hover:text-on-error-container transition-colors text-label-md font-label-md py-2 rounded-lg flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="signingOut" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">logout</span>
        Sign Out
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettings } from '@/composables/useSettings'
const $route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { displayName } = useSettings()

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
  { to: '/biomedical', icon: 'medical_services', label: 'Biomedical' }
]

const bottomNavItems = computed(() => {
  const items = [
    { to: '/departments', icon: 'domain', label: 'Departments' },
    { to: '/reports', icon: 'analytics', label: 'Reports' },
    { to: '/settings', icon: 'settings', label: 'Settings' }
  ]
  if (auth.canAccessAdmin) {
    items.splice(2, 0, { to: '/admin', icon: 'admin_panel_settings', label: 'Admin' })
  }
  if (auth.canManageUsers) {
    const idx = auth.canAccessAdmin ? 3 : 2
    items.splice(idx, 0, { to: '/users', icon: 'group', label: 'Users' })
  }
  if (auth.canAccessAuditLogs) {
    const len = items.length
    items.splice(len, 0, { to: '/audit-logs', icon: 'history_edu', label: 'Audit Logs' })
  }
  return items
})
</script>
