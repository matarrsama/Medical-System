<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary dark:text-inverse-primary font-bold">Biomedical</span>
        </div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Biomedical Equipment</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Track specialized hospital medical equipment and compliance.</p>
      </div>
      <button v-if="authStore.canCreateEquipment || !!authStore.departmentHeadOf" @click="ui.openModal('NewEquipment')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New Equipment
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
            <input v-model="searchQuery" class="w-full bg-surface-container dark:bg-inverse-surface pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-on-surface-variant dark:placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors" placeholder="Filter by name or ID..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Operational</option>
              <option>Needs Calibration</option>
              <option>Out of Service</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterType" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Type: All</option>
              <option>Diagnostic</option><option>Therapeutic</option><option>Monitoring</option><option>Laboratory</option><option>Surgical</option><option>Imaging</option><option>Other</option>
            </select>
          </div>
          <div v-if="isAdmin" class="relative hidden sm:block">
            <select v-model="filterDepartment" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Dept: All</option>
              <option v-for="dept in filterDepartmentOptions" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="authStore.canDeleteEquipment && selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors shadow-sm">
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
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Name</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Type</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Status</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden lg:table-cell">Last Cal.</th>
              <th class="p-3 pr-4 border-b border-outline-variant dark:border-outline font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface">
            <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-surface-container-lowest dark:hover:bg-inverse-surface transition-colors group cursor-pointer border-b border-outline-variant/30 dark:border-outline/30 last:border-0" @click="openDetail(item)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary dark:text-inverse-primary font-medium font-mono">{{ item.equipmentId || item.id }}</td>
              <td class="p-3 font-medium">{{ item.name }}</td>
              <td class="p-3 hidden md:table-cell">
                <span :class="typeClass(item.type)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ item.type }}</span>
              </td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant dark:text-outline">{{ item.department }}</td>
              <td class="p-3">
                <span :class="statusClass(item.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(item.status)"></span>
                  {{ item.status }}
                </span>
              </td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant dark:text-outline">{{ item.lastCalibration || '—' }}</td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(item.id, $event)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === item.id" class="equipment-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
                  <button @click.stop="openDetail(item)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <template v-if="authStore.canEditEquipment || authStore.canDeleteEquipment">
                    <button v-if="authStore.canEditEquipment" @click.stop="openEdit(item)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                    <div v-if="authStore.canEditEquipment && authStore.canDeleteEquipment" class="border-t border-outline-variant dark:border-outline my-1"></div>
                    <button v-if="authStore.canDeleteEquipment" @click.stop="deleteItem(item)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
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
        <div class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline">Showing {{ paginatedItems.length }} of {{ filteredItems.length }} items</div>
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
import { useEquipmentStore } from '@/stores/equipment'
import { useDepartmentsStore } from '@/stores/departments'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()
const authStore = useAuthStore()
const equipmentStore = useEquipmentStore()
const deptStore = useDepartmentsStore()

const isAdmin = computed(() => authStore.isBiomedicalAdmin)

const canManage = computed(() => authStore.canCreateEquipment || !!authStore.departmentHeadOf)

const userDept = ref('')

const filterDepartmentOptions = computed(() => isAdmin.value ? deptStore.items : deptStore.items.filter(d => d.name === userDept.value))

const searchQuery = ref(route.query.q || '')
const filterStatus = ref('')
const filterType = ref('')
const filterDepartment = ref('')
const sortDir = ref('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const currentPage = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize.value) || 1)

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

const paginatedItems = computed(() => {
  const tp = totalPages.value
  const page = Math.min(currentPage.value, tp)
  const start = (page - 1) * pageSize.value
  return filteredItems.value.slice(start, start + pageSize.value)
})

function goToPage(n) {
  const tp = totalPages.value
  if (n < 1) currentPage.value = 1
  else if (n > tp) currentPage.value = tp
  else currentPage.value = n
}

watch([searchQuery, filterStatus, filterType, filterDepartment], () => { currentPage.value = 1 })
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

const filteredItems = computed(() => {
  const items = equipmentStore.items.filter(item => {
    const q = searchQuery.value.toLowerCase()
    if (q && !(item.equipmentId || item.id).toLowerCase().includes(q) && !(item.name || '').toLowerCase().includes(q)) return false
    if (filterStatus.value && item.status !== filterStatus.value) return false
    if (filterType.value && item.type !== filterType.value) return false
    if (filterDepartment.value && item.department !== filterDepartment.value) return false
    if (!isAdmin.value && userDept.value && item.department !== userDept.value) return false
    return true
  })
  return [...items].sort((a, b) => {
    const idA = (a.equipmentId || a.id || '').toLowerCase()
    const idB = (b.equipmentId || b.id || '').toLowerCase()
    return sortDir.value === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
  })
})

const stats = computed(() => {
  const all = equipmentStore.items
  const operational = all.filter(e => e.status === 'Operational').length
  const needsCal = all.filter(e => e.status === 'Needs Calibration').length
  const outOfService = all.filter(e => e.status === 'Out of Service').length
  const total = all.length
  return [
    { label: 'Total Equipment', value: total, icon: 'devices', bg: 'bg-surface-container-highest dark:bg-surface-container', iconClass: 'text-on-surface-variant' },
    { label: 'Operational', value: operational, icon: 'check_circle', bg: 'bg-green-100 dark:bg-green-900/30', iconClass: 'text-green-600 dark:text-green-400' },
    { label: 'Needs Calibration', value: needsCal, icon: 'tune', bg: 'bg-amber-100 dark:bg-amber-900/30', iconClass: 'text-amber-600 dark:text-amber-400' },
    { label: 'Out of Service', value: outOfService, icon: 'error', bg: 'bg-red-100 dark:bg-red-900/30', iconClass: 'text-red-600 dark:text-red-400' }
  ]
})

const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const allSelected = computed(() => filteredItems.value.length > 0 && filteredItems.value.every(item => selectedIds.value.has(item.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredItems.value.map(item => item.id))
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
  if (!e.target.closest('.equipment-dropdown')) {
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
        if (!isAdmin.value) department = userDept.value
      }
    } catch {}
  }
  equipmentStore.startListening(department)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  equipmentStore.stopListening()
})

function openDetail(item) {
  openDropdownId.value = null
  ui.openModal('EquipmentDetail', { equipment: item, startEdit: false })
}

function openEdit(item) {
  openDropdownId.value = null
  ui.openModal('EquipmentDetail', { equipment: item, startEdit: true })
}

function deleteItem(item) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', item)
}

function deleteSelected() {
  const items = filteredItems.value.filter(item => selectedIds.value.has(item.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function typeClass(t) {
  const map = { Diagnostic: 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline', Therapeutic: 'bg-tertiary-container/20 text-tertiary dark:bg-tertiary/15 dark:text-tertiary', Monitoring: 'bg-primary-container/30 text-primary dark:bg-primary-container/20 dark:text-primary', Laboratory: 'bg-surface-container dark:bg-white/[0.05] text-on-surface-variant dark:text-outline', Surgical: 'bg-error-container/30 text-on-error-container dark:bg-error/15 dark:text-error', Imaging: 'bg-secondary-container/30 text-secondary dark:bg-secondary/15 dark:text-secondary', Other: 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline' }
  return map[t] || ''
}

function statusClass(s) {
  const map = { Operational: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 'Needs Calibration': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', 'Out of Service': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Operational: 'bg-green-600', 'Needs Calibration': 'bg-amber-500', 'Out of Service': 'bg-red-600' }
  return map[s] || ''
}
</script>
