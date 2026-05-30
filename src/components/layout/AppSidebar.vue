<template>
  <aside class="bg-surface-container dark:bg-surface-container-low border-r border-outline-variant dark:border-outline flex flex-col h-full fixed left-0 top-0 pt-16 z-20 overflow-y-auto w-64 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
    <div class="p-lg flex items-center gap-sm border-b border-outline-variant/50">
      <div class="w-10 h-10 rounded bg-primary flex items-center justify-center text-on-primary shrink-0">
        <span class="material-symbols-outlined icon-fill">health_and_safety</span>
      </div>
      <div class="overflow-hidden">
        <h2 class="text-headline-sm font-headline-md font-black text-on-surface dark:text-inverse-on-surface truncate">ICT Admin Console</h2>
        <p class="text-label-sm font-label-sm text-on-surface-variant truncate">v2.4.1 - Main Hospital</p>
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
    <div class="p-md border-t border-outline-variant mt-auto">
      <button class="w-full bg-surface-container-highest text-primary border border-outline-variant hover:bg-surface-variant transition-colors text-label-md font-label-md py-2 rounded-lg flex justify-center items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">download</span>
        Generate Report
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
const $route = useRoute()

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/tickets', icon: 'confirmation_number', label: 'Tickets' },
  { to: '/requests', icon: 'assignment_returned', label: 'Requests' },
  { to: '/inventory', icon: 'inventory_2', label: 'Inventory' },
  { to: '/procurement', icon: 'shopping_cart', label: 'Procurement' },
  { to: '/maintenance', icon: 'build', label: 'Maintenance' },
  { to: '/biomedical', icon: 'medical_services', label: 'Biomedical' }
]

const bottomNavItems = [
  { to: '/departments', icon: 'domain', label: 'Departments' },
  { to: '/reports', icon: 'analytics', label: 'Reports' },
  { to: '/users', icon: 'group', label: 'Users' },
  { to: '/audit-logs', icon: 'history_edu', label: 'Audit Logs' },
  { to: '/admin', icon: 'admin_panel_settings', label: 'Admin' },
  { to: '/settings', icon: 'settings', label: 'Settings' }
]
</script>
