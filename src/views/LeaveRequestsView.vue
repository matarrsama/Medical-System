<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1">
          <span>Operations</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary dark:text-inverse-primary font-bold">Leave Requests</span>
        </div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Leave Requests</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Submit and manage leave requests.</p>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="auth.canConfigureLeaves" @click="openSettings" class="text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-inverse-on-surface p-2 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors" title="Leave Settings">
          <span class="material-symbols-outlined text-[20px]">settings</span>
        </button>
        <button v-if="!cooldownBlocked" @click="openNewLeave" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">add</span>
          New Leave Request
        </button>
        <button v-else disabled class="bg-surface-container dark:bg-white/[0.08] text-on-surface-variant dark:text-outline text-label-md font-label-md px-4 py-2 rounded-lg cursor-not-allowed flex items-center gap-2" :title="cooldownMessage">
          <span class="material-symbols-outlined text-[18px]">lock</span>
          Cooldown Active
        </button>
      </div>
    </div>
    <div v-if="cooldownBlocked" class="mb-lg px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-label-sm font-label-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
      <span class="material-symbols-outlined text-[18px]">info</span>
      {{ cooldownMessage }}
    </div>
    <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant dark:border-outline">
        <div class="flex">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="activeTab === tab.key ? 'border-b-2 border-primary text-primary dark:text-inverse-primary font-bold' : 'text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-inverse-on-surface hover:bg-surface-container-low dark:hover:bg-inverse-surface'" class="px-4 py-3 text-label-md font-label-md transition-colors">
            {{ tab.label }}
            <span :class="activeTab === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-container dark:bg-white/[0.08] text-on-surface-variant dark:text-outline'" class="ml-2 px-1.5 py-0.5 rounded text-[10px]">{{ tab.count }}</span>
          </button>
        </div>
      </div>
      <div class="border-b border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container dark:bg-inverse-surface pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-on-surface-variant dark:placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors" placeholder="Filter by ID or type..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterType" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Type: All</option>
              <option>Annual</option>
              <option>Sick</option>
              <option>Personal</option>
              <option>Other</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="auth.canDeleteLeaves && selectedIds.size > 0" @click="deleteSelected" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-error bg-error transition-colors shadow-sm">
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
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium cursor-pointer select-none" @click="toggleSort">Leave ID <span class="material-symbols-outlined align-middle text-[14px]" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Type</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Requester</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Dates</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Days</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Status</th>
              <th class="p-3 pr-4 border-b border-outline-variant dark:border-outline font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface">
            <tr v-for="lv in paginatedLeaves" :key="lv.id" class="hover:bg-surface-container-lowest dark:hover:bg-inverse-surface transition-colors group cursor-pointer border-b border-outline-variant/30 dark:border-outline/30 last:border-0" @click="openDetail(lv)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(lv.id)" @change="toggleSelect(lv.id)" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary dark:text-inverse-primary font-medium">{{ lv.leaveId || lv.id }}</td>
              <td class="p-3 font-medium">{{ lv.type }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant dark:text-outline">{{ lv.createdByName || '—' }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant dark:text-outline">{{ formatDate(lv.startDate) }} – {{ formatDate(lv.endDate) }}</td>
              <td class="p-3 font-medium">{{ lv.daysRequested || '—' }}</td>
              <td class="p-3">
                <span :class="statusClass(lv.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(lv.status)"></span>
                  {{ lv.status }}
                </span>
              </td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(lv.id, $event)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === lv.id" class="leave-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-1' : 'top-full mt-1'">
                  <button @click.stop="openDetail(lv)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <template v-if="auth.isSuperAdmin || (lv.createdBy === auth.user?.uid && lv.status === 'Pending')">
                    <button @click.stop="openEdit(lv)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                      <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                      Edit
                    </button>
                  </template>
                  <template v-if="auth.canDeleteLeaves">
                    <div class="border-t border-outline-variant dark:border-outline my-1"></div>
                    <button @click.stop="deleteLeave(lv)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
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
        <div class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline">Showing {{ paginatedLeaves.length }} of {{ filteredLeaves.length }} leave requests</div>
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
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, getDoc, doc as fDoc } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

const ui = useUIStore()
const auth = useAuthStore()
const toast = useToast()
const activeTab = ref('pending')

const allLeaves = ref([])
const cache = useFirestoreCache()
const cached = cache.load('leaveRequests')
if (cached) allLeaves.value = cached

const leaveConfig = ref({ approvalIntervalDays: 0, rejectionIntervalDays: 0 })
const cooldownBlocked = ref(false)
const cooldownMessage = ref('')

async function checkCooldown() {
  if (auth.isSuperAdmin || auth.canApproveLeaves || auth.canRejectLeaves) return
  const uid = auth.user?.uid
  if (!uid) return
  try {
    const configSnap = await getDoc(fDoc(db, 'settings', 'leaveConfig'))
    const config = configSnap.exists() ? configSnap.data() : { approvalIntervalDays: 0, rejectionIntervalDays: 0 }
    leaveConfig.value = config
    const userLeaves = allLeaves.value.filter(l => l.createdBy === uid)
    let blocked = false
    let msg = ''
    const now = Date.now()
    for (const lv of userLeaves) {
      if (lv.status === 'Approved' && lv.approvedAt && config.approvalIntervalDays > 0) {
        const refDate = new Date(lv.approvedAt).getTime()
        const cooldown = config.approvalIntervalDays * 24 * 60 * 60 * 1000
        if (now - refDate < cooldown) {
          const daysLeft = Math.ceil((cooldown - (now - refDate)) / (24 * 60 * 60 * 1000))
          blocked = true
          msg = `You cannot request leave yet. Your last approved leave (${lv.leaveId || lv.id}) is within the ${config.approvalIntervalDays}-day cooldown period. ${daysLeft} day(s) remaining.`
          break
        }
      }
      if (lv.status === 'Rejected' && lv.statusChangedAt && config.rejectionIntervalDays > 0) {
        const refDate = new Date(lv.statusChangedAt).getTime()
        const cooldown = config.rejectionIntervalDays * 24 * 60 * 60 * 1000
        if (now - refDate < cooldown) {
          const daysLeft = Math.ceil((cooldown - (now - refDate)) / (24 * 60 * 60 * 1000))
          blocked = true
          msg = `You cannot request leave yet. Your last rejected leave (${lv.leaveId || lv.id}) is within the ${config.rejectionIntervalDays}-day cooldown period. ${daysLeft} day(s) remaining.`
          break
        }
      }
    }
    cooldownBlocked.value = blocked
    cooldownMessage.value = msg
  } catch (e) {
    console.error('[LeaveRequestsView] cooldown check error:', e)
  }
}

function getLeaveQuery() {
  if (auth.canViewAllLeaves) {
    return collection(db, 'leaveRequests')
  } else if (auth.departmentHeadOf) {
    return query(collection(db, 'leaveRequests'), where('department', '==', auth.departmentHeadOf))
  } else {
    return query(collection(db, 'leaveRequests'), where('createdBy', '==', auth.user?.uid || ''))
  }
}

let retryTimer = null
async function loadLeaves() {
  const q = getLeaveQuery()
  try {
    const snapshot = await getDocs(q)
    allLeaves.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    cache.save('leaveRequests', allLeaves.value)
    checkCooldown()
  } catch (err) {
    console.warn('[LeaveRequestsView] failed to load leaves:', err)
  }
}

onMounted(async () => {
  await loadLeaves()
  checkCooldown()
})

onUnmounted(() => {
  if (retryTimer) clearTimeout(retryTimer)
})

const tabs = computed(() => [
  { key: 'pending', label: 'Pending', count: allLeaves.value.filter(r => r.status === 'Pending').length },
  { key: 'approved', label: 'Approved', count: allLeaves.value.filter(r => r.status === 'Approved').length },
  { key: 'rejected', label: 'Rejected', count: allLeaves.value.filter(r => r.status === 'Rejected').length },
  { key: 'all', label: 'All', count: allLeaves.value.length }
])

const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const sortDir = ref('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const currentPage = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => Math.ceil(filteredLeaves.value.length / pageSize.value) || 1)

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

const paginatedLeaves = computed(() => {
  const tp = totalPages.value
  const page = Math.min(currentPage.value, tp)
  const start = (page - 1) * pageSize.value
  return filteredLeaves.value.slice(start, start + pageSize.value)
})

function goToPage(n) {
  const tp = totalPages.value
  if (n < 1) currentPage.value = 1
  else if (n > tp) currentPage.value = tp
  else currentPage.value = n
}

watch([searchQuery, filterType, filterStatus, activeTab], () => { currentPage.value = 1 })

const filteredLeaves = computed(() => {
  let items = allLeaves.value
  if (activeTab.value === 'pending') items = items.filter(r => r.status === 'Pending')
  else if (activeTab.value === 'approved') items = items.filter(r => r.status === 'Approved')
  else if (activeTab.value === 'rejected') items = items.filter(r => r.status === 'Rejected')
  if (filterType.value) items = items.filter(r => r.type === filterType.value)
  if (filterStatus.value) items = items.filter(r => r.status === filterStatus.value)
  items = [...items].sort((a, b) => {
    const idA = (a.leaveId || a.id || '').toLowerCase()
    const idB = (b.leaveId || b.id || '').toLowerCase()
    return sortDir.value === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
  })
  const q = searchQuery.value.toLowerCase()
  if (q) items = items.filter(r => (r.leaveId || r.id).toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q))
  return items
})

const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const allSelected = computed(() => filteredLeaves.value.length > 0 && filteredLeaves.value.every(r => selectedIds.value.has(r.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredLeaves.value.map(r => r.id))
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
  if (!e.target.closest('.leave-dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

function openNewLeave() {
  if (cooldownBlocked.value) return
  ui.openModal('NewLeaveRequest')
}

function openSettings() {
  ui.openModal('LeaveSettings')
}

function openDetail(lv) {
  openDropdownId.value = null
  ui.openModal('LeaveDetail', { leave: lv, startEdit: false })
}

function openEdit(lv) {
  openDropdownId.value = null
  ui.openModal('LeaveDetail', { leave: lv, startEdit: true })
}

function deleteLeave(lv) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', lv)
}

function deleteSelected() {
  const items = filteredLeaves.value.filter(r => selectedIds.value.has(r.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', items)
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleDateString()
  return String(v)
}

function statusClass(s) {
  const map = { Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', Rejected: 'bg-error-container/40 text-on-error-container dark:bg-error/15 dark:text-error' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Pending: 'bg-amber-500', Approved: 'bg-green-600', Rejected: 'bg-error' }
  return map[s] || ''
}
</script>
