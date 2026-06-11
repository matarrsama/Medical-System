<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary dark:text-inverse-primary font-bold">Maintenance</span>
        </div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Maintenance Schedule</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Plan and track preventive maintenance for hospital equipment.</p>
      </div>
      <button v-if="authStore.canCreateMaintenance" @click="ui.openModal('ScheduleMaintenance')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Schedule Maintenance
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-gutter mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-md flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="stat.bg">
          <span class="material-symbols-outlined text-[20px]" :class="stat.iconClass">{{ stat.icon }}</span>
        </div>
        <div>
          <div class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline">{{ stat.label }}</div>
          <div class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface mt-0.5">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container dark:bg-inverse-surface pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-on-surface-variant dark:placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors" placeholder="Filter by equipment or ID..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterType" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Type: All</option>
              <option>Preventive</option>
              <option>Corrective</option>
              <option>Inspection</option>
              <option>Calibration</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="authStore.canDeleteMaintenance && selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors shadow-sm">
            <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
            Delete ({{ selectedIds.size }})
          </button>
        </div>
      </div>

      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low dark:bg-inverse-surface text-on-surface-variant dark:text-outline text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant dark:border-outline font-medium w-10">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary" />
              </th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium cursor-pointer select-none" @click="toggleSort">ID <span class="material-symbols-outlined align-middle" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Equipment</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Type</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden sm:table-cell">Scheduled Date</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Status</th>
              <th class="p-3 pr-4 border-b border-outline-variant dark:border-outline font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface">
            <tr v-for="task in paginatedTasks" :key="task.id" class="hover:bg-surface-container-lowest dark:hover:bg-inverse-surface transition-colors group cursor-pointer border-b border-outline-variant/30 dark:border-outline/30 last:border-0" @click="openDetail(task)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(task.id)" @change="toggleSelect(task.id)" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary dark:text-inverse-primary font-medium font-mono">{{ task.maintenanceId || task.id }}</td>
              <td class="p-3 font-medium">{{ task.equipment }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant dark:text-outline">
                <span :class="typeClass(task.type)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ task.type }}</span>
              </td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant dark:text-outline">{{ task.department }}</td>
              <td class="p-3 hidden sm:table-cell text-on-surface-variant dark:text-outline">{{ task.scheduledDate || '—' }}</td>
              <td class="p-3">
                <span :class="statusClass(task.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(task.status)"></span>
                  {{ task.status }}
                </span>
              </td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(task.id, $event)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === task.id" class="maintenance-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
                  <button @click.stop="openDetail(task)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <template v-if="authStore.canEditMaintenance || authStore.canDeleteMaintenance">
                    <button v-if="authStore.canEditMaintenance" @click.stop="openEdit(task)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                    <div v-if="authStore.canEditMaintenance && authStore.canDeleteMaintenance" class="border-t border-outline-variant dark:border-outline my-1"></div>
                    <button v-if="authStore.canDeleteMaintenance" @click.stop="deleteTask(task)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      <div class="border-t border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline">Showing {{ paginatedTasks.length }} of {{ filteredTasks.length }} tasks</div>
        <div class="flex items-center gap-2">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="px-2 py-1 rounded border border-outline-variant dark:border-outline text-on-surface-variant dark:text-outline hover:bg-surface-container dark:hover:bg-white/[0.08] text-label-sm font-label-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <template v-for="n in visiblePages" :key="n">
            <button v-if="n !== '...'" @click="goToPage(n)" :class="n === currentPage ? 'bg-primary text-on-primary' : 'border border-outline-variant dark:border-outline text-on-surface-variant dark:text-outline hover:bg-surface-container dark:hover:bg-white/[0.08]'" class="px-3 py-1 rounded text-label-sm font-label-sm transition-colors">{{ n }}</button>
            <span v-else class="px-1 text-on-surface-variant dark:text-outline">...</span>
          </template>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-2 py-1 rounded border border-outline-variant dark:border-outline text-on-surface-variant dark:text-outline hover:bg-surface-container dark:hover:bg-white/[0.08] text-label-sm font-label-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useMaintenanceStore } from '@/stores/maintenance'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()
const authStore = useAuthStore()
const maintenanceStore = useMaintenanceStore()

const canSchedule = computed(() => authStore.canScheduleMaintenance)

const userDept = ref('')

const userTasks = computed(() => maintenanceStore.tasks)

const searchQuery = ref(route.query.q || '')
const filterStatus = ref('')
const filterType = ref('')
const sortDir = ref('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const currentPage = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => Math.ceil(filteredTasks.value.length / pageSize.value) || 1)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  if (total > 1) pages.push(total)
  return pages
})

const paginatedTasks = computed(() => {
  const tp = totalPages.value
  const page = Math.min(currentPage.value, tp)
  const start = (page - 1) * pageSize.value
  return filteredTasks.value.slice(start, start + pageSize.value)
})

function goToPage(n) {
  const tp = totalPages.value
  if (n < 1) currentPage.value = 1
  else if (n > tp) currentPage.value = tp
  else currentPage.value = n
}

watch([searchQuery, filterStatus, filterType], () => { currentPage.value = 1 })
watch(searchQuery, (q) => {
  const currentQ = route.query.q || ''
  if (q !== currentQ) {
    router.replace({ query: q ? { q } : undefined })
  }
})
watch(() => route.query.q, (q) => {
  const newQ = q || ''
  if (newQ !== searchQuery.value) {
    searchQuery.value = newQ
  }
})

const filteredTasks = computed(() => {
  const items = userTasks.value.filter(t => {
    const q = searchQuery.value.toLowerCase()
    if (q && !(t.maintenanceId || t.id).toLowerCase().includes(q) && !(t.equipment || '').toLowerCase().includes(q)) return false
    if (filterStatus.value && t.status !== filterStatus.value) return false
    if (filterType.value && t.type !== filterType.value) return false
    return true
  })
  return [...items].sort((a, b) => {
    const idA = (a.maintenanceId || a.id || '').toLowerCase()
    const idB = (b.maintenanceId || b.id || '').toLowerCase()
    return sortDir.value === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
  })
})

const stats = computed(() => {
  const all = userTasks.value
  const scheduled = all.filter(t => t.status === 'Scheduled').length
  const inProgress = all.filter(t => t.status === 'In Progress').length
  const completed = all.filter(t => t.status === 'Completed').length
  const overdue = all.filter(t => t.status === 'Overdue').length
  return [
    { label: 'Scheduled', value: scheduled, icon: 'event', bg: 'bg-blue-100 dark:bg-blue-900/30', iconClass: 'text-blue-600 dark:text-blue-400' },
    { label: 'In Progress', value: inProgress, icon: 'sync', bg: 'bg-amber-100 dark:bg-amber-900/30', iconClass: 'text-amber-600 dark:text-amber-400' },
    { label: 'Completed', value: completed, icon: 'check_circle', bg: 'bg-green-100 dark:bg-green-900/30', iconClass: 'text-green-600 dark:text-green-400' },
    { label: 'Overdue', value: overdue, icon: 'warning', bg: 'bg-red-100 dark:bg-red-900/30', iconClass: 'text-red-600 dark:text-red-400' }
  ]
})

const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const allSelected = computed(() => filteredTasks.value.length > 0 && filteredTasks.value.every(t => selectedIds.value.has(t.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredTasks.value.map(t => t.id))
  }
}

function toggleDropdown(id, e) {
  if (openDropdownId.value === id) {
    openDropdownId.value = null
    return
  }
  openDropdownId.value = id
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  dropdownUp.value = spaceBelow < 200 && spaceAbove > 200
}

function onDocClick(e) {
  if (!e.target.closest('.maintenance-dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', onDocClick)
  const uid = auth.currentUser?.uid
  let department = null
  if (uid) {
    try {
      const userSnap = await getDoc(doc(db, 'users', uid))
      if (userSnap.exists()) {
        userDept.value = userSnap.data().department || ''
        if (!canSchedule.value) department = userDept.value
      }
    } catch {}
  }
  maintenanceStore.startListening(department)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  maintenanceStore.stopListening()
})

function openDetail(task) {
  openDropdownId.value = null
  ui.openModal('MaintenanceDetail', { task, startEdit: false })
}

function openEdit(task) {
  openDropdownId.value = null
  ui.openModal('MaintenanceDetail', { task, startEdit: true })
}

function deleteTask(task) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', task)
}

function deleteSelected() {
  const items = filteredTasks.value.filter(t => selectedIds.value.has(t.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function typeClass(t) {
  const map = { Preventive: 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline', Corrective: 'bg-tertiary-container/20 text-tertiary dark:bg-tertiary/15 dark:text-tertiary', Inspection: 'bg-primary-container/30 text-primary dark:bg-primary-container/20 dark:text-primary', Calibration: 'bg-surface-container dark:bg-white/[0.05] text-on-surface-variant dark:text-outline' }
  return map[t] || ''
}

function statusClass(s) {
  const map = { Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', 'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Scheduled: 'bg-blue-600', 'In Progress': 'bg-amber-500', Completed: 'bg-green-600', Overdue: 'bg-red-600' }
  return map[s] || ''
}
</script>
