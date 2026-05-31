<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary font-bold">Procurement</span>
        </div>
        <h2 class="text-display font-display text-on-surface">Procurement &amp; Vendor Management</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage purchase orders, vendor contracts, and requisitions.</p>
      </div>
      <button @click="ui.openModal('NewPurchaseOrder')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New Purchase Order
      </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      <div class="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div class="border-b border-outline-variant p-4 bg-surface-container-lowest flex flex-wrap gap-3 items-center justify-between">
          <div class="flex flex-wrap gap-3 items-center flex-1">
            <div class="relative w-full sm:w-56">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-size: 18px;">search</span>
              <input v-model="searchQuery" class="w-full bg-surface-container pl-9 pr-3 py-1.5 rounded border border-outline-variant text-body-sm font-body-sm placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors" placeholder="Filter by PO or vendor..." type="text" />
            </div>
            <div class="relative hidden sm:block">
              <select v-model="filterStatus" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
                <option value="">Status: All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Delivered</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors shadow-sm">
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
                <th class="p-3 border-b border-outline-variant font-medium cursor-pointer select-none" @click="toggleSort">PO Number <span class="material-symbols-outlined align-middle" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
                <th class="p-3 border-b border-outline-variant font-medium">Vendor</th>
                <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Amount</th>
                <th class="p-3 border-b border-outline-variant font-medium">Status</th>
                <th class="p-3 pr-4 border-b border-outline-variant font-medium w-10"></th>
              </tr>
            </thead>
            <tbody class="text-body-sm font-body-sm text-on-surface">
              <tr v-for="po in filteredOrders" :key="po.id" class="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/30 last:border-0" @click="openDetail(po)">
                <td class="p-3 pl-4" @click.stop>
                  <input type="checkbox" :checked="selectedIds.has(po.id)" @change="toggleSelect(po.id)" class="rounded border-outline-variant text-primary focus:ring-primary" />
                </td>
                <td class="p-3 text-primary font-medium font-mono">{{ po.poNumber || po.id }}</td>
                <td class="p-3 font-medium">{{ po.vendor }}</td>
                <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ formatCurrency(po.amount) }}</td>
                <td class="p-3">
                  <span :class="statusClass(po.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(po.status)"></span>
                    {{ po.status }}
                  </span>
                </td>
                <td class="p-3 pr-4 relative" @click.stop>
                  <button @click.stop="toggleDropdown(po.id, $event)" class="p-1 rounded hover:bg-surface-container text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
                    <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                  </button>
                  <div v-if="openDropdownId === po.id" class="po-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
                    <button @click.stop="openDetail(po)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                      View Details
                    </button>
                    <button @click.stop="openEdit(po)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                    <div class="border-t border-outline-variant my-1"></div>
                    <button @click.stop="deletePO(po)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg">
        <h3 class="text-headline-sm font-headline-md text-on-surface mb-4">Top Vendors</h3>
        <div v-if="vendors.length === 0" class="text-body-md text-on-surface-variant text-center py-8">No vendors yet.</div>
        <div v-else class="space-y-3">
          <div v-for="vendor in vendors" :key="vendor.name" class="flex items-center justify-between p-3 bg-surface-container rounded-lg">
            <div>
              <div class="text-body-md font-medium text-on-surface">{{ vendor.name }}</div>
              <div class="text-label-sm text-on-surface-variant">{{ vendor.contracts || vendor.email || '—' }}</div>
            </div>
            <span class="text-label-sm font-label-sm text-primary">{{ vendor.status || 'Active' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useSettings } from '@/composables/useSettings'
import { usePurchaseOrdersStore } from '@/stores/purchaseOrders'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'

const ui = useUIStore()
const poStore = usePurchaseOrdersStore()
const { formatCurrency } = useSettings()

const searchQuery = ref('')
const filterStatus = ref('')
const sortDir = ref('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const filteredOrders = computed(() => {
  const items = poStore.orders.filter(po => {
    const q = searchQuery.value.toLowerCase()
    if (q && !(po.poNumber || po.id).toLowerCase().includes(q) && !(po.vendor || '').toLowerCase().includes(q)) return false
    if (filterStatus.value && po.status !== filterStatus.value) return false
    return true
  })
  return [...items].sort((a, b) => {
    const idA = (a.poNumber || a.id || '').toLowerCase()
    const idB = (b.poNumber || b.id || '').toLowerCase()
    return sortDir.value === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
  })
})

const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const allSelected = computed(() => filteredOrders.value.length > 0 && filteredOrders.value.every(po => selectedIds.value.has(po.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredOrders.value.map(po => po.id))
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
  if (!e.target.closest('.po-dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

function openDetail(po) {
  openDropdownId.value = null
  ui.openModal('PurchaseOrderDetail', { order: po, startEdit: false })
}

function openEdit(po) {
  openDropdownId.value = null
  ui.openModal('PurchaseOrderDetail', { order: po, startEdit: true })
}

function deletePO(po) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', po)
}

function deleteSelected() {
  const items = filteredOrders.value.filter(po => selectedIds.value.has(po.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function statusClass(s) {
  const map = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-blue-100 text-blue-800', Delivered: 'bg-green-100 text-green-800' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Pending: 'bg-amber-500', Approved: 'bg-blue-600', Delivered: 'bg-green-600' }
  return map[s] || ''
}

const vendors = ref([])
let unsubVendors = null

onMounted(() => {
  const qV = query(collection(db, 'vendors'))
  unsubVendors = onSnapshot(qV, (snap) => {
    vendors.value = snap.docs.map(doc => {
      const { slug, ...rest } = doc.data()
      return rest
    })
  }, () => {})
})

onUnmounted(() => {
  if (unsubVendors) unsubVendors()
})
</script>
