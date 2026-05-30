<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Inventory &amp; Assets</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Track and manage hospital ICT assets and equipment.</p>
      </div>
      <button @click="ui.openModal('AddInventory')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Inventory
      </button>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 flex-wrap">
          <div class="relative w-full sm:w-56">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full pl-9 pr-3 py-1.5 rounded border border-outline-variant text-body-sm bg-surface-container focus:ring-1 focus:ring-primary" placeholder="Search assets..." type="text" />
          </div>
          <select v-model="filterCategory" class="border border-outline-variant rounded px-3 py-1.5 text-body-sm bg-surface-container">
            <option value="">All Categories</option>
            <option>Desktop</option>
            <option>Network</option>
            <option>Printer</option>
            <option>Server</option>
          </select>
          <select v-model="filterStatus" class="border border-outline-variant rounded px-3 py-1.5 text-body-sm bg-surface-container">
            <option value="">All Status</option>
            <option>Active</option>
            <option>Maintenance</option>
            <option>Retired</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium">Asset Tag</th>
              <th class="p-3 border-b border-outline-variant font-medium">Name</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Category</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant font-medium">Status</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Purchase Date</th>
            </tr>
          </thead>
          <tbody class="text-body-sm text-on-surface">
            <tr v-for="asset in filteredAssets" :key="asset.tag" class="hover:bg-surface-container-lowest cursor-pointer border-b border-outline-variant/30 last:border-0">
              <td class="p-3 pl-4 text-primary font-medium">{{ asset.tag }}</td>
              <td class="p-3 font-medium">{{ asset.name }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ asset.category }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ asset.department }}</td>
              <td class="p-3">
                <span :class="statusClass(asset.status)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ asset.status }}</span>
              </td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ asset.purchaseDate }}</td>
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
import { useInventoryStore } from '@/stores/inventory'

const ui = useUIStore()
const inventoryStore = useInventoryStore()
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

const filteredAssets = computed(() => {
  return inventoryStore.assets.filter(a => {
    if (searchQuery.value && !a.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && !a.tag.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (filterCategory.value && a.category !== filterCategory.value) return false
    if (filterStatus.value && a.status !== filterStatus.value) return false
    return true
  })
})

function statusClass(s) {
  const map = { Active: 'bg-green-100 text-green-800', Maintenance: 'bg-amber-100 text-amber-800', Retired: 'bg-gray-100 text-gray-600' }
  return map[s] || ''
}
</script>
