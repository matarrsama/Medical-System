<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary dark:text-inverse-primary font-bold">ICT Assets</span>
        </div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Inventory &amp; Assets</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Track and manage hospital ICT assets and equipment.</p>
      </div>
      <button v-if="canAddInventory" @click="ui.openModal('AddInventory')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Inventory
      </button>
    </div>
    <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container dark:bg-inverse-surface pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-on-surface-variant dark:placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors" placeholder="Filter by name or tag..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterCategory" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Category: All</option>
              <option>Desktop</option>
              <option>Network</option>
              <option>Printer</option>
              <option>Server</option>
              <option>Mobile</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Active</option>
              <option>Maintenance</option>
              <option>Retired</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="authStore.canDeleteInventory && selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors shadow-sm">
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
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium cursor-pointer select-none" @click="toggleSort">Asset Tag <span class="material-symbols-outlined align-middle" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Name</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Category</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Status</th>
              <th class="p-3 pr-4 border-b border-outline-variant dark:border-outline font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface">
            <tr v-for="asset in paginatedAssets" :key="asset.id" class="hover:bg-surface-container-lowest dark:hover:bg-inverse-surface transition-colors group cursor-pointer border-b border-outline-variant/30 dark:border-outline/30 last:border-0" @click="openDetail(asset)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(asset.id)" @change="toggleSelect(asset.id)" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary dark:text-inverse-primary font-medium font-mono">{{ asset.assetTag || asset.id }}</td>
              <td class="p-3 font-medium">{{ asset.name }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant dark:text-outline">{{ asset.category }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant dark:text-outline">{{ asset.department }}</td>
              <td class="p-3">
                <span :class="statusClass(asset.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(asset.status)"></span>
                  {{ asset.status }}
                </span>
              </td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(asset.id, $event)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === asset.id" class="asset-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
                  <button @click.stop="openDetail(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <template v-if="authStore.canEditInventory || authStore.canDeleteInventory">
                    <button v-if="authStore.canEditInventory" @click.stop="openEdit(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                    <div v-if="authStore.canEditInventory && authStore.canDeleteInventory" class="border-t border-outline-variant dark:border-outline my-1"></div>
                    <button v-if="authStore.canDeleteInventory" @click.stop="deleteAsset(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </template>
                  <template v-else-if="authStore.departmentHeadOf && asset.department === authStore.departmentHeadOf">
                    <button @click.stop="openEdit(asset)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      <div class="border-t border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline">Showing {{ paginatedAssets.length }} of {{ filteredAssets.length }} assets</div>
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
import { useInventoryStore } from '@/stores/inventory'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

const canManageInventory = computed(() => authStore.canManageInventory)
const canAddInventory = computed(() => canManageInventory.value || !!authStore.departmentHeadOf)

const searchQuery = ref(route.query.q || '')
const filterCategory = ref('')
const filterStatus = ref('')
const sortDir = ref('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const currentPage = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => Math.ceil(filteredAssets.value.length / pageSize.value) || 1)

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

const paginatedAssets = computed(() => {
  const tp = totalPages.value
  const page = Math.min(currentPage.value, tp)
  const start = (page - 1) * pageSize.value
  return filteredAssets.value.slice(start, start + pageSize.value)
})

function goToPage(n) {
  const tp = totalPages.value
  if (n < 1) currentPage.value = 1
  else if (n > tp) currentPage.value = tp
  else currentPage.value = n
}

watch([searchQuery, filterCategory, filterStatus], () => { currentPage.value = 1 })
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

const filteredAssets = computed(() => {
  let items = inventoryStore.assets
  if (!authStore.canDeleteInventory) {
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
  const map = { Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', Maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', Retired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Active: 'bg-green-600', Maintenance: 'bg-amber-500', Retired: 'bg-outline' }
  return map[s] || ''
}
</script>
