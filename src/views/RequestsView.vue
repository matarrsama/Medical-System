<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary font-bold">Requests &amp; Approvals</span>
        </div>
        <h2 class="text-display font-display text-on-surface">Requests</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Track and approve equipment, access, and service requests.</p>
      </div>
      <button @click="ui.openModal('NewRequest')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New Request
      </button>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div class="border-b border-outline-variant">
        <div class="flex">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="activeTab === tab.key ? 'border-b-2 border-primary text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'" class="px-4 py-3 text-label-md font-label-md transition-colors">
            {{ tab.label }}
            <span :class="activeTab === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'" class="ml-2 px-1.5 py-0.5 rounded text-[10px]">{{ tab.count }}</span>
          </button>
        </div>
      </div>
      <div class="border-b border-outline-variant p-4 bg-surface-container-lowest flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container pl-9 pr-3 py-1.5 rounded border border-outline-variant text-body-sm font-body-sm placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors" placeholder="Filter by ID or title..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterDepartment" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
              <option value="">Department: All</option>
              <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
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
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium w-10">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="rounded border-outline-variant text-primary focus:ring-primary" />
              </th>
              <th class="p-3 border-b border-outline-variant font-medium cursor-pointer select-none" @click="toggleSort">Request ID <span class="material-symbols-outlined align-middle text-[14px]" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
              <th class="p-3 border-b border-outline-variant font-medium">Title</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Requester</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant font-medium">Status</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Date</th>
              <th class="p-3 pr-4 border-b border-outline-variant font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface">
            <tr v-for="req in filteredRequests" :key="req.id" class="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/30 last:border-0" @click="openDetail(req)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(req.id)" @change="toggleSelect(req.id)" class="rounded border-outline-variant text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary font-medium">{{ req.requestId || req.id }}</td>
              <td class="p-3 font-medium">{{ req.title }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ req.createdByName || req.requester || '—' }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ req.department }}</td>
              <td class="p-3">
                <span :class="statusClass(req.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(req.status)"></span>
                  {{ req.status }}
                </span>
              </td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ formatDate(req.created) }}</td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(req.id, $event)" class="p-1 rounded hover:bg-surface-container text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === req.id" class="request-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-1' : 'top-full mt-1'">
                  <button @click.stop="openDetail(req)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <button @click.stop="openEdit(req)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                    Edit
                  </button>
                  <div class="border-t border-outline-variant my-1"></div>
                  <button @click.stop="deleteRequest(req)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

const ui = useUIStore()
const auth = useAuthStore()
const activeTab = ref('pending')

const allRequests = ref([])
const cache = useFirestoreCache()
const cached = cache.load('requests')
if (cached) allRequests.value = cached
let unsubscribe = null

onMounted(() => {
  const canViewAll = auth.role && ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(auth.role)
  const q = canViewAll
    ? collection(db, 'requests')
    : query(collection(db, 'requests'), where('department', '==', auth.user?.department || ''))
  unsubscribe = onSnapshot(q, (snapshot) => {
    const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    allRequests.value = mapped
    cache.save('requests', mapped)
  }, (err) => {
    console.error('[RequestsView] snapshot error:', err)
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const tabs = computed(() => [
  { key: 'pending', label: 'Pending', count: allRequests.value.filter(r => r.status === 'Pending' || r.status === 'Open').length },
  { key: 'approved', label: 'Approved', count: allRequests.value.filter(r => r.status === 'Approved').length },
  { key: 'rejected', label: 'Rejected', count: allRequests.value.filter(r => r.status === 'Rejected').length },
  { key: 'all', label: 'All', count: allRequests.value.length }
])

const searchQuery = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')
const sortDir = ref('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const departments = computed(() => {
  const set = new Set()
  allRequests.value.forEach(r => { if (r.department) set.add(r.department) })
  return [...set].sort()
})

const filteredRequests = computed(() => {
  let items = allRequests.value
  if (activeTab.value === 'pending') items = items.filter(r => r.status === 'Pending' || r.status === 'Open')
  else if (activeTab.value === 'approved') items = items.filter(r => r.status === 'Approved')
  else if (activeTab.value === 'rejected') items = items.filter(r => r.status === 'Rejected')
  if (filterDepartment.value) items = items.filter(r => r.department === filterDepartment.value)
  if (filterStatus.value) items = items.filter(r => r.status === filterStatus.value)
  items = [...items].sort((a, b) => {
    const idA = (a.requestId || a.id || '').toLowerCase()
    const idB = (b.requestId || b.id || '').toLowerCase()
    return sortDir.value === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
  })
  const q = searchQuery.value.toLowerCase()
  if (q) items = items.filter(r => (r.requestId || r.id).toLowerCase().includes(q) || (r.title || '').toLowerCase().includes(q))
  return items
})

const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const allSelected = computed(() => filteredRequests.value.length > 0 && filteredRequests.value.every(r => selectedIds.value.has(r.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredRequests.value.map(r => r.id))
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
  if (!e.target.closest('.request-dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

function openDetail(req) {
  openDropdownId.value = null
  ui.openModal('RequestDetail', { request: req, startEdit: false })
}

function openEdit(req) {
  openDropdownId.value = null
  ui.openModal('RequestDetail', { request: req, startEdit: true })
}

function deleteRequest(req) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', req)
}

function deleteSelected() {
  const items = filteredRequests.value.filter(r => selectedIds.value.has(r.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleDateString()
  return String(v)
}

function statusClass(s) {
  const map = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-green-100 text-green-800', Rejected: 'bg-error-container/40 text-on-error-container', Open: 'bg-surface-container-highest text-on-surface-variant' }
  return map[s] || ''
}
function statusDot(s) {
  const map = { Pending: 'bg-amber-500', Approved: 'bg-green-600', Rejected: 'bg-error', Open: 'bg-outline' }
  return map[s] || ''
}
</script>
