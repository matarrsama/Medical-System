<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary font-bold">Departments</span>
        </div>
        <h2 class="text-display font-display text-on-surface">Departments</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage hospital departments, contacts, and configurations.</p>
      </div>
      <button v-if="canManageDepartments" @click="ui.openModal('AddDepartment')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Department
      </button>
    </div>

    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant p-4 bg-surface-container-lowest flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container pl-9 pr-3 py-1.5 rounded border border-outline-variant text-body-sm font-body-sm placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors" placeholder="Search by name or head..." type="text" />
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
        <div v-for="dept in filteredDepartments" :key="dept.id" class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow group relative cursor-pointer" @click="openDetail(dept)">
          <div class="absolute top-3 left-3 z-10" @click.stop>
            <input type="checkbox" :checked="selectedIds.has(dept.id)" @change="toggleSelect(dept.id)" class="rounded border-outline-variant text-primary focus:ring-primary opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': selectedIds.has(dept.id) }" />
          </div>
          <div class="absolute top-3 right-3 z-10" @click.stop>
            <button @click.stop="toggleDropdown(dept.id, $event)" class="p-1 rounded hover:bg-surface-container text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
              <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
            </button>
            <div v-if="openDropdownId === dept.id" class="dept-dropdown absolute right-0 z-50 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
              <button @click.stop="openDetail(dept)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                View Details
              </button>
              <template v-if="canManageDepartments">
                <button @click.stop="openEdit(dept)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                  <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                  Edit
                </button>
                <div class="border-t border-outline-variant my-1"></div>
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
                <h3 class="text-body-md font-bold text-on-surface truncate">{{ dept.name }}</h3>
                <p class="text-label-sm text-on-surface-variant truncate">{{ dept.headName || dept.head || '—' }}</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-label-sm text-on-surface-variant mt-4 pt-3 border-t border-outline-variant/30">
              <span>{{ staffCount(dept) }} staff</span>
              <span>{{ deviceCount(dept) }} devices</span>
              <span class="text-on-surface-variant/60">{{ dept.location || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredDepartments.length === 0" class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <span class="material-symbols-outlined text-[48px] mb-4">domain_off</span>
        <p class="text-body-sm font-body-sm">No departments found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useDepartmentsStore } from '@/stores/departments'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

const ui = useUIStore()
const authStore = useAuthStore()
const deptStore = useDepartmentsStore()

const canManageDepartments = computed(() => ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(authStore.role))

const users = ref([])
const inventoryItems = ref([])
const equipmentItems = ref([])
let unsubUsers = null
let unsubInventory = null
let unsubEquipment = null

const searchQuery = ref('')
const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const filteredDepartments = computed(() => {
  if (!searchQuery.value) return deptStore.items
  const q = searchQuery.value.toLowerCase()
  return deptStore.items.filter(d =>
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
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  if (unsubUsers) unsubUsers()
  if (unsubInventory) unsubInventory()
  if (unsubEquipment) unsubEquipment()
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
</script>
