<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Audit Logs</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Track all system changes and user activities.</p>
      </div>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex flex-wrap gap-3">
        <select v-model="filterAction" class="border border-outline-variant rounded px-3 py-1.5 text-body-sm bg-surface-container">
          <option value="">All Actions</option>
          <option>Create</option>
          <option>Update</option>
          <option>Delete</option>
          <option>Login</option>
        </select>
        <select v-model="filterUser" class="border border-outline-variant rounded px-3 py-1.5 text-body-sm bg-surface-container">
          <option value="">All Users</option>
          <option>Ahmed Al-Rashid</option>
          <option>Maria Gonzalez</option>
          <option>James Okafor</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium">Timestamp</th>
              <th class="p-3 border-b border-outline-variant font-medium">User</th>
              <th class="p-3 border-b border-outline-variant font-medium">Action</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Resource</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Details</th>
            </tr>
          </thead>
          <tbody class="text-body-sm text-on-surface">
            <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-surface-container-lowest cursor-pointer border-b border-outline-variant/30 last:border-0" @click="ui.openModal('AuditDetail')">
              <td class="p-3 pl-4 text-on-surface-variant">{{ log.timestamp }}</td>
              <td class="p-3 font-medium">{{ log.user }}</td>
              <td class="p-3">
                <span :class="actionClass(log.action)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ log.action }}</span>
              </td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ log.resource }}</td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ log.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()
const filterAction = ref('')
const filterUser = ref('')

const logs = ref([
  { id: 1, timestamp: '2026-05-30 10:14:22', user: 'Ahmed Al-Rashid', action: 'Update', resource: 'Ticket INC-9042', details: 'Changed status to Investigating' },
  { id: 2, timestamp: '2026-05-30 09:45:00', user: 'Maria Gonzalez', action: 'Create', resource: 'User EMP-10299', details: 'New user account created' },
  { id: 3, timestamp: '2026-05-30 08:30:15', user: 'James Okafor', action: 'Login', resource: 'System', details: 'Successful login from 10.0.1.45' },
  { id: 4, timestamp: '2026-05-29 23:00:00', user: 'System', action: 'Delete', resource: 'Backup Log', details: 'Auto-purged logs older than 90 days' },
  { id: 5, timestamp: '2026-05-29 16:20:33', user: 'Ahmed Al-Rashid', action: 'Update', resource: 'Configuration', details: 'Changed backup retention policy' }
])

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    if (filterAction.value && l.action !== filterAction.value) return false
    if (filterUser.value && l.user !== filterUser.value) return false
    return true
  })
})

function actionClass(a) {
  const map = { Create: 'bg-green-100 text-green-800', Update: 'bg-blue-100 text-blue-800', Delete: 'bg-error-container/40 text-on-error-container', Login: 'bg-surface-container text-on-surface-variant' }
  return map[a] || ''
}
</script>
