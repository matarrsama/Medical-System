<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary dark:text-inverse-primary font-bold">{{ canManageDepartments ? 'Departments' : 'My Department' }}</span>
        </div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">{{ canManageDepartments ? 'Departments' : 'My Department' }}</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">{{ canManageDepartments ? 'Manage hospital departments, contacts, and configurations.' : 'View your department details and staff.' }}</p>
      </div>
      <button v-if="canManageDepartments" @click="ui.openModal('AddDepartment')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Department
      </button>
      <button v-else-if="authStore.departmentHeadOf" @click="ui.openModal('ProvisionUser')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">person_add</span>
        Add New Staff
      </button>
    </div>

    <template v-if="!canManageDepartments && authStore.departmentHeadOf">
      <div v-if="myDept" class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center" :class="myDept.colorClass">
            <span class="material-symbols-outlined text-on-primary text-[28px]">domain</span>
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">{{ myDept.name }}</h2>
            <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ myDept.deptId || myDept.id }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
            <span class="text-label-sm text-outline font-medium">Total Staff</span>
            <p class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mt-1">{{ totalStaff }}</p>
          </div>
          <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
            <span class="text-label-sm text-outline font-medium">Active</span>
            <p class="text-headline-sm font-headline-md text-green-600 dark:text-green-400 mt-1">{{ activeStaffCount }}</p>
          </div>
          <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
            <span class="text-label-sm text-outline font-medium">On Leave</span>
            <p class="text-headline-sm font-headline-md text-amber-600 dark:text-amber-400 mt-1">{{ onLeaveStaffCount }}</p>
          </div>
          <div v-if="isCriticallyLow" class="p-4 rounded-xl bg-error-container/20 dark:bg-error/10 border border-error/30">
            <span class="text-label-sm text-error font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">warning</span>
              Critical
            </span>
            <p class="text-headline-sm font-headline-md text-error mt-1">{{ activeStaffCount }}</p>
            <p class="text-label-sm text-error mt-0.5">Critically low</p>
          </div>
          <div v-else class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
            <span class="text-label-sm text-outline font-medium">Availability</span>
            <p class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mt-1">{{ availabilityPercent }}%</p>
          </div>
        </div>

        <div v-if="isCriticallyLow" class="px-4 py-3 rounded-lg bg-error-container/20 dark:bg-error/10 border border-error/30 flex items-center gap-3">
          <span class="material-symbols-outlined text-error text-[20px]">warning</span>
          <div>
            <p class="text-label-sm font-label-sm text-error font-medium">Staffing Alert</p>
            <p class="text-body-sm text-on-surface dark:text-inverse-on-surface">Only {{ activeStaffCount }} of {{ totalStaff }} staff are currently active. {{ onLeaveStaffCount }} staff member(s) are on leave.</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
          <div>
            <span class="text-label-sm text-outline font-medium">Department Head</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ myDept.headName || myDept.head || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Location</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ myDept.location || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Created</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(myDept.created) }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Created by</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ myDept.createdByName || myDept.createdBy || '—' }}</p>
          </div>
        </div>

        <div>
          <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-3">Staff Members ({{ totalStaff }})</h4>
          <div class="overflow-x-auto border border-outline-variant dark:border-outline rounded-xl">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-surface-container-low dark:bg-inverse-surface text-on-surface-variant dark:text-outline text-label-sm font-label-sm uppercase tracking-wider">
                  <th class="p-3 pl-4 border-b border-outline-variant dark:border-outline font-medium">Name</th>
                  <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Role</th>
                  <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Status</th>
                </tr>
              </thead>
              <tbody class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface">
                <tr v-for="staff in departmentStaff" :key="staff.uid || staff.id" class="hover:bg-surface-container-lowest dark:hover:bg-inverse-surface transition-colors border-b border-outline-variant/30 dark:border-outline/30 last:border-0">
                  <td class="p-3 pl-4 font-medium">{{ staff.name || staff.displayName || '—' }}</td>
                  <td class="p-3 text-on-surface-variant dark:text-outline">{{ staff.role || '—' }}</td>
                  <td class="p-3">
                    <span v-if="isOnLeave(staff)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      On Leave
                    </span>
                    <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="departmentStaff.length === 0" class="text-body-sm text-on-surface-variant dark:text-outline text-center py-8">No staff members in this department.</p>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-16 text-on-surface-variant dark:text-outline">
        <span class="material-symbols-outlined text-[48px] mb-4">domain_off</span>
        <p class="text-body-sm font-body-sm">Loading department details...</p>
      </div>
    </template>

    <template v-else-if="canManageDepartments">
      <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
        <div class="border-b border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-wrap gap-3 items-center justify-between">
          <div class="flex flex-wrap gap-3 items-center flex-1">
            <div class="relative w-full sm:w-64">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" style="font-size: 18px;">search</span>
              <input v-model="searchQuery" class="w-full bg-surface-container dark:bg-inverse-surface pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-on-surface-variant dark:placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors" placeholder="Search by name or head..." type="text" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="canManageDepartments && selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors shadow-sm">
              <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
              Delete ({{ selectedIds.size }})
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter p-4">
          <div v-for="dept in filteredDepartments" :key="dept.id" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm hover:shadow-md transition-shadow group relative cursor-pointer" @click="openDetail(dept)">
            <div class="absolute top-3 left-3 z-10" @click.stop>
              <input type="checkbox" :checked="selectedIds.has(dept.id)" @change="toggleSelect(dept.id)" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': selectedIds.has(dept.id) }" />
            </div>
            <div class="absolute top-3 right-3 z-10" @click.stop>
              <button @click.stop="toggleDropdown(dept.id, $event)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline opacity-0 group-hover:opacity-100 transition-all">
                <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
              </button>
              <div v-if="openDropdownId === dept.id" class="dept-dropdown absolute right-0 z-50 w-44 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
                <button @click.stop="openDetail(dept)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                  <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                  View Details
                </button>
                <template v-if="canManageDepartments">
                  <button @click.stop="openEdit(dept)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                    Edit
                  </button>
                  <div class="border-t border-outline-variant dark:border-outline my-1"></div>
                  <button @click.stop="deleteItem(dept)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </button>
                </template>
              </div>
            </div>
            <div class="p-lg">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="dept.colorClass">
                  <span class="material-symbols-outlined text-on-primary">domain</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-body-md font-bold text-on-surface dark:text-inverse-on-surface truncate">{{ dept.name }}</h3>
                  <p class="text-label-sm text-on-surface-variant dark:text-outline truncate">{{ dept.headName || dept.head || '—' }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between text-label-sm text-on-surface-variant dark:text-outline mt-4 pt-3 border-t border-outline-variant/30 dark:border-outline/30">
                <span>{{ staffCount(dept) }} staff</span>
                <span>{{ deviceCount(dept) }} devices</span>
                <span class="text-on-surface-variant/60 dark:text-outline/60">{{ dept.location || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredDepartments.length === 0" class="flex flex-col items-center justify-center py-16 text-on-surface-variant dark:text-outline">
          <span class="material-symbols-outlined text-[48px] mb-4">domain_off</span>
          <p class="text-body-sm font-body-sm">No departments found.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useDepartmentsStore } from '@/stores/departments'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()
const authStore = useAuthStore()
const deptStore = useDepartmentsStore()

const canManageDepartments = computed(() => authStore.canManageDepartments)

const users = ref([])
const inventoryItems = ref([])
const equipmentItems = ref([])
const allLeaveRequests = ref([])
let unsubUsers = null
let unsubInventory = null
let unsubEquipment = null
let unsubLeaveReqs = null

const myDept = computed(() => {
  if (!authStore.departmentHeadOf) return null
  return deptStore.items.find(d => d.name === authStore.departmentHeadOf) || null
})

const departmentStaff = computed(() =>
  users.value.filter(u => u.department === (myDept.value?.name || ''))
)

const activeApprovedLeaves = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allLeaveRequests.value.filter(l => {
    if (l.status !== 'Approved') return false
    const start = l.startDate ? (typeof l.startDate === 'string' ? l.startDate : (l.startDate?.toDate ? l.startDate.toDate().toISOString().split('T')[0] : '')) : ''
    const end = l.endDate ? (typeof l.endDate === 'string' ? l.endDate : (l.endDate?.toDate ? l.endDate.toDate().toISOString().split('T')[0] : '')) : ''
    if (!start || !end) return false
    return today >= start && today <= end
  })
})

function isOnLeave(staff) {
  const uid = staff.uid || staff.id
  return activeApprovedLeaves.value.some(l => l.createdBy === uid)
}

const totalStaff = computed(() => departmentStaff.value.length)
const onLeaveStaffCount = computed(() => departmentStaff.value.filter(s => isOnLeave(s)).length)
const activeStaffCount = computed(() => totalStaff.value - onLeaveStaffCount.value)

const isCriticallyLow = computed(() => {
  if (totalStaff.value === 0) return false
  return activeStaffCount.value / totalStaff.value < 0.3 || activeStaffCount.value < 2
})

const availabilityPercent = computed(() => {
  if (totalStaff.value === 0) return 0
  return Math.round(activeStaffCount.value / totalStaff.value * 100)
})

const searchQuery = ref(route.query.q || '')
const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const visibleDepartments = computed(() => {
  if (canManageDepartments.value) return deptStore.items
  if (authStore.departmentHeadOf) {
    return deptStore.items.filter(d => d.name === authStore.departmentHeadOf)
  }
  return []
})

const filteredDepartments = computed(() => {
  let items = visibleDepartments.value
  if (!searchQuery.value) return items
  const q = searchQuery.value.toLowerCase()
  return items.filter(d =>
    (d.name && d.name.toLowerCase().includes(q)) ||
    (d.headName && d.headName.toLowerCase().includes(q)) ||
    (d.head && d.head.toLowerCase().includes(q))
  )
})

const allSelected = computed(() => filteredDepartments.value.length > 0 && filteredDepartments.value.every(d => selectedIds.value.has(d.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredDepartments.value.map(d => d.id))
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
  if (!e.target.closest('.dept-dropdown')) {
    openDropdownId.value = null
  }
}

function subscribeLeaveReqs() {
  if (unsubLeaveReqs) unsubLeaveReqs()
  if (canManageDepartments.value) {
    unsubLeaveReqs = onSnapshot(collection(db, 'leaveRequests'), (snap) => {
      allLeaveRequests.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }, (err) => console.error('[DepartmentsView] leaveReqs snapshot error:', err))
  } else {
    const deptName = authStore.departmentHeadOf
    if (!deptName) { allLeaveRequests.value = []; return }
    unsubLeaveReqs = onSnapshot(
      query(collection(db, 'leaveRequests'), where('department', '==', deptName)),
      (snap) => { allLeaveRequests.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) },
      (err) => console.error('[DepartmentsView] leaveReqs snapshot error:', err)
    )
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
    users.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, () => {})
  unsubInventory = onSnapshot(collection(db, 'inventory'), (snap) => {
    inventoryItems.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, () => {})
  unsubEquipment = onSnapshot(collection(db, 'equipment'), (snap) => {
    equipmentItems.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, () => {})
  subscribeLeaveReqs()
})

watch([canManageDepartments, () => authStore.departmentHeadOf], subscribeLeaveReqs, { immediate: false })
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
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  if (unsubUsers) unsubUsers()
  if (unsubInventory) unsubInventory()
  if (unsubEquipment) unsubEquipment()
  if (unsubLeaveReqs) unsubLeaveReqs()
})

function staffCount(dept) {
  return users.value.filter(u => u.department === dept.name).length
}

function deviceCount(dept) {
  const inv = inventoryItems.value.filter(i => i.department === dept.name).length
  const eq = equipmentItems.value.filter(e => e.department === dept.name).length
  return inv + eq
}

function openDetail(dept) {
  openDropdownId.value = null
  ui.openModal('DepartmentDetail', { department: dept, startEdit: false })
}

function openEdit(dept) {
  openDropdownId.value = null
  ui.openModal('DepartmentDetail', { department: dept, startEdit: true })
}

function deleteItem(dept) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', dept)
}

function deleteSelected() {
  const items = filteredDepartments.value.filter(d => selectedIds.value.has(d.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function formatDate(v) {
  if (!v) return ''
  let d
  if (v?.toDate) {
    d = v.toDate()
  } else if (typeof v === 'string') {
    d = new Date(v)
  } else {
    return String(v)
  }
  if (isNaN(d.getTime())) return String(v)
  if (typeof v === 'string' && v.includes('T')) {
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString()
}
</script>
