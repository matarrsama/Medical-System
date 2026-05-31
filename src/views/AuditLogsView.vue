<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Audit Logs</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Track all system changes and user activities.</p>
      </div>
      <div v-if="authStore.isSuperAdmin" class="flex items-center gap-3 mt-2 sm:mt-0">
        <button v-if="selectedIds.size > 0" @click="clearSelection" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-surface-variant hover:bg-surface-container-higher transition-colors">
          <span class="material-symbols-outlined text-[16px]">close</span>
          Clear ({{ selectedIds.size }})
        </button>
        <button v-if="selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors">
          <span class="material-symbols-outlined text-[16px]">delete</span>
          Delete Selected
        </button>
      </div>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex flex-wrap gap-3 items-center">
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
              <th v-if="authStore.isSuperAdmin" class="p-3 pl-4 border-b border-outline-variant font-medium w-10">
                <input type="checkbox" :checked="allSelected" :indeterminate="someSelected" @change="toggleSelectAll" class="w-4 h-4 rounded border-outline-variant text-primary cursor-pointer" />
              </th>
              <th class="p-3 pl-4 border-b border-outline-variant font-medium">Timestamp</th>
              <th class="p-3 border-b border-outline-variant font-medium">User</th>
              <th class="p-3 border-b border-outline-variant font-medium">Action</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Resource</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Details</th>
            </tr>
          </thead>
          <tbody class="text-body-sm text-on-surface">
            <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-surface-container-lowest cursor-pointer border-b border-outline-variant/30 last:border-0" :class="{ 'bg-primary-container/10': selectedIds.has(log.id) }" @click="ui.openModal('AuditDetail')">
              <td v-if="authStore.isSuperAdmin" class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(log.id)" @change="toggleSelect(log.id)" class="w-4 h-4 rounded border-outline-variant text-primary cursor-pointer" />
              </td>
              <td class="p-3 pl-4 text-on-surface-variant">{{ log.timestamp }}</td>
              <td class="p-3 font-medium">{{ log.user }}</td>
              <td class="p-3">
                <span :class="actionClass(log.action)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ log.action }}</span>
              </td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ log.resource }}</td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant max-w-[300px] break-words whitespace-pre-wrap">{{ log.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

const ui = useUIStore()
const authStore = useAuthStore()
const filterAction = ref('')
const filterUser = ref('')
const logs = ref([])
const selectedIds = ref(new Set())

const cache = useFirestoreCache()
const cached = cache.load('auditLogs')
if (cached) logs.value = cached

let unsubscribe = null

onMounted(() => {
  const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    const mapped = snapshot.docs.map(doc => {
      const data = doc.data()
      const ts = data.timestamp?.toDate?.()
      return {
        id: doc.id,
        timestamp: ts ? ts.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(',', '') : data.timestamp,
        user: data.user,
        action: data.action,
        resource: data.resource,
        details: data.details
      }
    })
    logs.value = mapped
    selectedIds.value = new Set()
    cache.save('auditLogs', mapped)
  }, () => {})
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    if (filterAction.value && l.action !== filterAction.value) return false
    if (filterUser.value && l.user !== filterUser.value) return false
    return true
  })
})

const allSelected = computed(() => filteredLogs.value.length > 0 && filteredLogs.value.every(l => selectedIds.value.has(l.id)))
const someSelected = computed(() => filteredLogs.value.some(l => selectedIds.value.has(l.id)) && !allSelected.value)

function toggleSelect(id) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredLogs.value.map(l => l.id))
  }
}

function clearSelection() {
  selectedIds.value = new Set()
}

function deleteSelected() {
  const items = filteredLogs.value.filter(l => selectedIds.value.has(l.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function actionClass(a) {
  const map = { Create: 'bg-green-100 text-green-800', Update: 'bg-blue-100 text-blue-800', Delete: 'bg-error-container/40 text-on-error-container', Login: 'bg-surface-container text-on-surface-variant' }
  return map[a] || ''
}
</script>
