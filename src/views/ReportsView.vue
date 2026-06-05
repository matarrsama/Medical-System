<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary dark:text-inverse-primary font-bold">Reports</span>
        </div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Reports &amp; Analytics</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Generate and view system reports and analytics.</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="ui.openModal('ExportReports')" class="bg-surface-container-highest dark:bg-white/[0.08] text-on-surface dark:text-inverse-on-surface text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.12] transition-colors shadow-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Export
        </button>
        <button @click="ui.openModal('AddReport')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Add Report
        </button>
      </div>
    </div>

    <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container dark:bg-inverse-surface pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-on-surface-variant dark:placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors" placeholder="Search by title or ID..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterType" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Type: All</option>
              <option>Tickets</option>
              <option>Inventory</option>
              <option>Maintenance</option>
              <option>Equipment</option>
              <option>Procurement</option>
              <option>Custom</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Archived</option>
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter p-4">
        <div v-for="item in filteredItems" :key="item.id" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm hover:shadow-md transition-shadow group relative cursor-pointer" @click="openDetail(item)">
          <div class="absolute top-3 left-3 z-10" @click.stop>
            <input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': selectedIds.has(item.id) }" />
          </div>
          <div class="absolute top-3 right-3 z-10" @click.stop>
            <button @click.stop="toggleDropdown(item.id, $event)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline opacity-0 group-hover:opacity-100 transition-all">
              <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
            </button>
            <div v-if="openDropdownId === item.id" class="report-dropdown absolute right-0 z-50 w-44 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-2' : 'top-full mt-2'">
              <button @click.stop="openDetail(item)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                View Details
              </button>
              <button @click.stop="openEdit(item)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                Edit
              </button>
              <div class="border-t border-outline-variant dark:border-outline my-1"></div>
              <button @click.stop="deleteItem(item)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
                <span class="material-symbols-outlined text-[16px]">delete</span>
                Delete
              </button>
            </div>
          </div>
          <div class="p-lg">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="iconBg(item.icon)">
                <span class="material-symbols-outlined text-on-primary">{{ item.icon || 'summarize' }}</span>
              </div>
              <div class="min-w-0">
                <h3 class="text-body-md font-bold text-on-surface dark:text-inverse-on-surface truncate">{{ item.title }}</h3>
                <p class="text-label-sm text-on-surface-variant dark:text-outline truncate">{{ item.reportId }}</p>
              </div>
            </div>
            <p class="text-body-sm text-on-surface-variant dark:text-outline line-clamp-2 mb-3">{{ item.description || '—' }}</p>
            <div class="flex items-center justify-between text-label-sm text-on-surface-variant dark:text-outline mt-4 pt-3 border-t border-outline-variant/30 dark:border-outline/30">
              <span :class="typeClass(item.type)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ item.type }}</span>
              <span :class="statusClass(item.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(item.status)"></span>
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-16 text-on-surface-variant dark:text-outline">
        <span class="material-symbols-outlined text-[48px] mb-4">summarize</span>
        <p class="text-body-sm font-body-sm">No reports found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useReportsStore } from '@/stores/reports'

const ui = useUIStore()
const reportsStore = useReportsStore()

const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const filteredItems = computed(() => {
  const items = reportsStore.items.filter(item => {
    const q = searchQuery.value.toLowerCase()
    if (q && !(item.reportId || item.id || '').toLowerCase().includes(q) && !(item.title || '').toLowerCase().includes(q)) return false
    if (filterType.value && item.type !== filterType.value) return false
    if (filterStatus.value && item.status !== filterStatus.value) return false
    return true
  })
  return items
})

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
  if (!e.target.closest('.report-dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

function openDetail(item) {
  openDropdownId.value = null
  ui.openModal('ReportDetail', { report: item, startEdit: false })
}

function openEdit(item) {
  openDropdownId.value = null
  ui.openModal('ReportDetail', { report: item, startEdit: true })
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

function iconBg(icon) {
  const map = {
    bar_chart: 'bg-primary', pie_chart: 'bg-tertiary', show_chart: 'bg-secondary',
    table_chart: 'bg-cyan-600', summarize: 'bg-surface-variant text-on-surface dark:bg-white/[0.08] dark:text-outline',
    assessment: 'bg-amber-600', dashboard: 'bg-purple-600', analytics: 'bg-orange-600'
  }
  return map[icon] || 'bg-primary'
}

function typeClass(t) {
  const map = { Tickets: 'bg-primary-container/30 text-primary dark:text-inverse-primary', Inventory: 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline', Maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', Equipment: 'bg-tertiary-container/20 text-tertiary dark:text-inverse-primary', Procurement: 'bg-secondary-container/30 text-secondary dark:text-inverse-primary', Custom: 'bg-surface-container dark:bg-white/[0.05] text-on-surface-variant dark:text-outline' }
  return map[t] || ''
}

function statusClass(s) {
  const map = { Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', Draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', Archived: 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Active: 'bg-green-600', Draft: 'bg-amber-500', Archived: 'bg-on-surface-variant/50' }
  return map[s] || ''
}
</script>
