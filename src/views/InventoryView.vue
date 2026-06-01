<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary font-bold">ICT Assets</span>
        </div>
        <h2 class="text-display font-display text-on-surface">Inventory &amp; Assets</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Track and manage hospital ICT assets and equipment.</p>
      </div>
      <button v-if="canAddInventory" @click="ui.openModal('AddInventory')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Inventory
      </button>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant p-4 bg-surface-container-lowest flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container pl-9 pr-3 py-1.5 rounded border border-outline-variant text-body-sm font-body-sm placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors" placeholder="Filter by name or tag..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterCategory" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
              <option value="">Category: All</option>
              <option>Desktop</option>
              <option>Network</option>
              <option>Printer</option>
              <option>Server</option>
              <option>Mobile</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Active</option>
              <option>Maintenance</option>
              <option>Retired</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="canManageInventory && selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors shadow-sm">
            <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
            Delete ({{ selectedIds.size }})
          </button>
        </div>
      </div>
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium w-10">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="rounded border-outline-variant text-primary focus:ring-primary" />
              </th>
              <th class="p-3 border-b border-outline-variant font-medium cursor-pointer select-none" @click="toggleSort">Asset Tag <span class="material-symbols-outlined align-middle" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
              <th class="p-3 border-b border-outline-variant font-medium">Name</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Category</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant font-medium">Status</th>
              <th class="p-3 pr-4 border-b border-outline-variant font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface">
            <tr v-for="asset in filteredAssets" :key="asset.id" class="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/30 last:border-0" @click="openDetail(asset)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(asset.id)" @change="toggleSelect(asset.id)" class="rounded border-outline-variant text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary font-medium font-mono">{{ asset.assetTag || asset.id }}</td>
              <td class="p-3 font-medium">{{ asset.name }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ asset.category }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ asset.department }}</td>
              <td class="p-3">
                <span :class="statusClass(asset.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(asset.status)"></span>
                  {{ asset.status }}
                </span>
              </td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(asset.id, $event)" class="p-1 rounded hover:bg-surface-container text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === asset.id" class="asset-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
                  <button @click.stop="openDetail(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <template v-if="canManageInventory">
                    <button @click.stop="openEdit(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                    <div class="border-t border-outline-variant my-1"></div>
                    <button @click.stop="deleteAsset(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </template>
                  <template v-else-if="authStore.departmentHeadOf && asset.department === authStore.departmentHeadOf">
                    <button @click.stop="openEdit(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'

const ui = useUIStore()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

const canManageInventory = computed(() => ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(authStore.role))
const canAddInventory = computed(() => canManageInventory.value || !!authStore.departmentHeadOf)

const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const sortDir = ref('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const filteredAssets = computed(() => {
  let items = inventoryStore.assets
  if (!canManageInventory.value) {
    const userDept = authStore.user?.department
    const headDept = authStore.departmentHeadOf
    const dept = headDept || userDept
    if (dept) items = items.filter(a => a.department === dept)
  }
  items = items.filter(a => {
    const q = searchQuery.value.toLowerCase()
    if (q && !(a.assetTag || a.id).toLowerCase().includes(q) && !(a.name || '').toLowerCase().includes(q)) return false
    if (filterCategory.value && a.category !== filterCategory.value) return false
    if (filterStatus.value && a.status !== filterStatus.value) return false
    return true
  })
  return [...items].sort((a, b) => {
    const idA = (a.assetTag || a.id || '').toLowerCase()
    const idB = (b.assetTag || b.id || '').toLowerCase()
    return sortDir.value === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
  })
})

const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const allSelected = computed(() => filteredAssets.value.length > 0 && filteredAssets.value.every(a => selectedIds.value.has(a.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredAssets.value.map(a => a.id))
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
  if (!e.target.closest('.asset-dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

function openDetail(asset) {
  openDropdownId.value = null
  ui.openModal('InventoryDetail', { asset, startEdit: false })
}

function openEdit(asset) {
  openDropdownId.value = null
  ui.openModal('InventoryDetail', { asset, startEdit: true })
}

function deleteAsset(asset) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', asset)
}

function deleteSelected() {
  const items = filteredAssets.value.filter(a => selectedIds.value.has(a.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function statusClass(s) {
  const map = { Active: 'bg-green-100 text-green-800', Maintenance: 'bg-amber-100 text-amber-800', Retired: 'bg-gray-100 text-gray-600' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Active: 'bg-green-600', Maintenance: 'bg-amber-500', Retired: 'bg-outline' }
  return map[s] || ''
}
</script>
