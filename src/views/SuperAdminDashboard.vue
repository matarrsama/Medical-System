<template>
  <div>
    <div class="flex justify-between items-end mb-lg">
      <div>
        <h1 class="text-display font-display text-on-surface">Super Admin Dashboard</h1>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">System-wide metrics and tenant management.</p>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
        <div class="text-label-md font-label-md text-on-surface-variant">{{ stat.label }}</div>
        <div class="text-display font-display text-on-surface mt-1">{{ stat.value }}</div>
        <div class="text-label-sm font-label-sm text-on-surface-variant mt-1">{{ stat.subtext }}</div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-outline-variant">
          <h3 class="text-headline-sm font-headline-md text-on-surface">Tenant Overview</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
                <th class="p-3 pl-4 border-b border-outline-variant font-medium">Tenant</th>
                <th class="p-3 border-b border-outline-variant font-medium">Users</th>
                <th class="p-3 border-b border-outline-variant font-medium">Tickets</th>
                <th class="p-3 border-b border-outline-variant font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="text-body-sm text-on-surface">
              <tr v-for="tenant in tenants" :key="tenant.name" class="border-b border-outline-variant/30 last:border-0">
                <td class="p-3 pl-4 font-medium">{{ tenant.name }}</td>
                <td class="p-3">{{ tenant.users }}</td>
                <td class="p-3">{{ tenant.tickets }}</td>
                <td class="p-3">
                  <span :class="tenant.status === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ tenant.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <h3 class="text-headline-sm font-headline-md text-on-surface mb-4">System Health</h3>
        <div class="space-y-4">
          <div v-for="health in systemHealth" :key="health.label" class="flex items-center justify-between">
            <span class="text-body-md text-on-surface">{{ health.label }}</span>
            <div class="flex items-center gap-2">
              <div class="w-24 h-2 rounded-full bg-surface-container">
                <div class="h-full rounded-full" :class="health.color" :style="{ width: health.percent + '%' }"></div>
              </div>
              <span class="text-label-sm font-label-sm text-on-surface-variant">{{ health.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { label: 'Active Tenants', value: 3, subtext: 'Main, North, East campuses' },
  { label: 'Total Users', value: '12,847', subtext: 'Across all tenants' },
  { label: 'Open Tickets', value: 347, subtext: 'System-wide' },
  { label: 'Uptime', value: '99.97%', subtext: 'Last 30 days' }
])

const tenants = ref([
  { name: 'Main Hospital', users: '8,234', tickets: 124, status: 'Healthy' },
  { name: 'North Campus', users: '2,891', tickets: 47, status: 'Healthy' },
  { name: 'East Campus', users: '1,722', tickets: 176, status: 'Warning' }
])

const systemHealth = ref([
  { label: 'Server CPU', percent: 67, color: 'bg-green-500' },
  { label: 'Memory Usage', percent: 82, color: 'bg-amber-500' },
  { label: 'Disk Storage', percent: 73, color: 'bg-green-500' },
  { label: 'Network Bandwidth', percent: 45, color: 'bg-green-500' },
  { label: 'Database Connections', percent: 58, color: 'bg-green-500' }
])
</script>
