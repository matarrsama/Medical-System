<template>
  <div>
    <div class="flex justify-between items-end mb-lg">
      <div>
        <h1 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Super Admin Dashboard</h1>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">System-wide metrics and tenant management.</p>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-md">
        <div class="text-label-md font-label-md text-on-surface-variant dark:text-outline">{{ stat.label }}</div>
        <div class="text-display font-display text-on-surface dark:text-inverse-on-surface mt-1">{{ stat.value }}</div>
        <div class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline mt-1">{{ stat.subtext }}</div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
      <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-outline-variant dark:border-outline">
          <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Tenant Overview</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low dark:bg-inverse-surface text-on-surface-variant dark:text-outline text-label-sm font-label-sm uppercase tracking-wider">
                <th class="p-3 pl-4 border-b border-outline-variant dark:border-outline font-medium">Tenant</th>
                <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Users</th>
                <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Tickets</th>
                <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="text-body-sm text-on-surface dark:text-inverse-on-surface">
              <tr v-for="tenant in tenants" :key="tenant.name" class="border-b border-outline-variant/30 dark:border-outline/30 last:border-0">
                <td class="p-3 pl-4 font-medium">{{ tenant.name }}</td>
                <td class="p-3">{{ tenant.users }}</td>
                <td class="p-3">{{ tenant.tickets }}</td>
                <td class="p-3">
                  <span :class="tenant.status === 'Healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ tenant.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm">
        <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mb-4">System Health</h3>
        <div class="space-y-4">
          <div v-for="health in systemHealth" :key="health.label" class="flex items-center justify-between">
            <span class="text-body-md text-on-surface dark:text-inverse-on-surface">{{ health.label }}</span>
            <div class="flex items-center gap-2">
              <div class="w-24 h-2 rounded-full bg-surface-container dark:bg-white/[0.08]">
                <div class="h-full rounded-full" :class="health.color" :style="{ width: health.percent + '%' }"></div>
              </div>
              <span class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline">{{ health.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

const cache = useFirestoreCache()
const rawTenants = ref([])
const rawUsers = ref([])
const rawTickets = ref([])

const cachedTenants = cache.load('superadmin_tenants')
const cachedUsers = cache.load('superadmin_users')
const cachedTickets = cache.load('superadmin_tickets')
if (cachedTenants) rawTenants.value = cachedTenants
if (cachedUsers) rawUsers.value = cachedUsers
if (cachedTickets) rawTickets.value = cachedTickets

const systemHealth = ref([
  { label: 'Server CPU', percent: 67, color: 'bg-green-500' },
  { label: 'Memory Usage', percent: 82, color: 'bg-amber-500' },
  { label: 'Disk Storage', percent: 73, color: 'bg-green-500' },
  { label: 'Network Bandwidth', percent: 45, color: 'bg-green-500' },
  { label: 'Database Connections', percent: 58, color: 'bg-green-500' }
])

const unsubscribers = []

onMounted(() => {
  const unsubTenants = onSnapshot(collection(db, 'tenants'), (snapshot) => {
    const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    rawTenants.value = mapped
    cache.save('superadmin_tenants', mapped)
  }, () => {})
  unsubscribers.push(unsubTenants)

  const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
    const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    rawUsers.value = mapped
    cache.save('superadmin_users', mapped)
  }, () => {})
  unsubscribers.push(unsubUsers)

  const unsubTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
    const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    rawTickets.value = mapped
    cache.save('superadmin_tickets', mapped)
  }, () => {})
  unsubscribers.push(unsubTickets)
})

onUnmounted(() => {
  unsubscribers.forEach(fn => fn())
})

const stats = computed(() => [
  {
    label: 'Active Tenants',
    value: rawTenants.value.length || 1,
    subtext: rawTenants.value.length ? `${rawTenants.value.length} tenants` : 'Single tenant system'
  },
  {
    label: 'Total Users',
    value: rawUsers.value.length.toLocaleString(),
    subtext: 'Across all tenants'
  },
  {
    label: 'Open Tickets',
    value: rawTickets.value.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length,
    subtext: 'System-wide'
  },
  {
    label: 'Uptime',
    value: '99.97%',
    subtext: 'Last 30 days'
  }
])

const tenants = computed(() => {
  if (!rawTenants.value.length) {
    return [
      { name: 'Default Tenant', users: rawUsers.value.length.toLocaleString(), tickets: rawTickets.value.length, status: 'Healthy' }
    ]
  }
  return rawTenants.value.map(t => {
    const tenantUsers = rawUsers.value.filter(u => u.tenantId === t.id).length
    const tenantTickets = rawTickets.value.filter(tk => tk.tenantId === t.id).length
    return {
      name: t.name || t.id,
      users: tenantUsers || '—',
      tickets: tenantTickets || 0,
      status: t.status || 'Healthy'
    }
  })
})
</script>
