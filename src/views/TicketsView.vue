<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg space-y-4 sm:space-y-0">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1">
          <span>Service Desk</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary dark:text-inverse-primary font-bold">Active Tickets</span>
        </div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Tickets</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Manage and resolve hospital ICT service requests and incidents.</p>
      </div>
        <div class="flex items-center space-x-3">
          <button @click="ui.openModal('NewTicket')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg shadow-sm hover:bg-primary-container transition-colors flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Ticket
          </button>
          <div class="flex bg-surface-container dark:bg-white/[0.08] border border-outline-variant dark:border-outline rounded-lg p-0.5">
            <button @click="viewMode = 'table'" :class="viewMode === 'table' ? 'bg-surface dark:bg-white/[0.12] border border-outline dark:border-outline shadow-sm text-on-surface dark:text-inverse-on-surface' : 'text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-inverse-on-surface'" class="p-1.5 rounded-md flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined" style="font-size: 18px;">table_rows</span>
            </button>
            <button @click="viewMode = 'kanban'" :class="viewMode === 'kanban' ? 'bg-surface dark:bg-white/[0.12] border border-outline dark:border-outline shadow-sm text-on-surface dark:text-inverse-on-surface' : 'text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-inverse-on-surface'" class="p-1.5 rounded-md flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined" style="font-size: 18px;">view_kanban</span>
            </button>
            <button @click="viewMode = 'calendar'" :class="viewMode === 'calendar' ? 'bg-surface dark:bg-white/[0.12] border border-outline dark:border-outline shadow-sm text-on-surface dark:text-inverse-on-surface' : 'text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-inverse-on-surface'" class="p-1.5 rounded-md flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined" style="font-size: 18px;">calendar_month</span>
            </button>
          </div>
      </div>
    </div>
    <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container dark:bg-inverse-surface pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-on-surface-variant dark:placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors" placeholder="Filter by subject or ID..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterCategory" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Category: All</option>
              <option>Network</option>
              <option>Hardware</option>
              <option>Software</option>
              <option>Access</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterPriority" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Priority: All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest dark:focus:bg-inverse-surface transition-colors cursor-pointer">
              <option value="">Status: All</option>
              <option>Open</option>
              <option>Assigned</option>
              <option>In Progress</option>
              <option>Resolved</option>
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
      <div v-if="viewMode === 'table'" class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low dark:bg-inverse-surface text-on-surface-variant dark:text-outline text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant dark:border-outline font-medium w-10">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary" />
              </th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium cursor-pointer select-none" @click="toggleSort">Ticket ID <span class="material-symbols-outlined align-middle" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Title</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Priority</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden md:table-cell">Status</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden lg:table-cell">Assignee</th>
              <th class="p-3 border-b border-outline-variant dark:border-outline font-medium hidden lg:table-cell">Created</th>
              <th class="p-3 pr-4 border-b border-outline-variant dark:border-outline font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface">
            <tr v-for="ticket in paginatedTickets" :key="ticket.id" class="hover:bg-surface-container-lowest dark:hover:bg-inverse-surface transition-colors group cursor-pointer border-b border-outline-variant/30 dark:border-outline/30 last:border-0" @click="openTicketDetail(ticket)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(ticket.id)" @change="toggleSelect(ticket.id)" class="rounded border-outline-variant dark:border-outline text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary dark:text-inverse-primary font-medium">{{ ticket.ticketId || ticket.id }}</td>
              <td class="p-3 font-medium">{{ ticket.title }}</td>
              <td class="p-3 hidden md:table-cell">
                <span :class="priorityClass(ticket.priority)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="priorityDot(ticket.priority)"></span>
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="p-3 hidden md:table-cell">
                <span :class="statusClass(ticket.status)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ ticket.status }}</span>
              </td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant dark:text-outline">{{ ticket.assignee }}</td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant dark:text-outline">{{ formatDate(ticket.created) }}</td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(ticket.id, $event)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === ticket.id" class="ticket-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-1' : 'top-full mt-1'">
                  <button @click.stop="openTicketDetail(ticket)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <button @click.stop="openTicketEdit(ticket)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                    Edit
                  </button>
                  <button @click.stop="openTicketAssign(ticket)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">person_add</span>
                    Assign
                  </button>
                  <div class="border-t border-outline-variant dark:border-outline my-1"></div>
                  <button @click.stop="deleteTicket(ticket)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-error text-left">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="viewMode === 'kanban'" class="flex-1 overflow-x-auto p-4">
        <div class="flex gap-4 h-full min-w-[700px]">
          <div v-for="status in ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']" :key="status" class="flex-1 min-w-[200px] bg-surface-container-low dark:bg-inverse-surface rounded-lg p-3">
            <h3 class="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant dark:text-outline mb-3 pb-2 border-b border-outline-variant/30 dark:border-outline/30">{{ status }} ({{ ticketsByStatus[status]?.length || 0 }})</h3>
            <div class="space-y-2">
              <div v-for="ticket in ticketsByStatus[status] || []" :key="ticket.id" @click="openTicketDetail(ticket)" class="bg-surface-container-lowest dark:bg-inverse-surface rounded-lg p-3 border border-outline-variant dark:border-outline cursor-pointer hover:shadow-sm transition-shadow">
                <div class="text-label-sm font-label-sm text-primary dark:text-inverse-primary mb-1">{{ ticket.ticketId || ticket.id }}</div>
                <div class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface mb-2 line-clamp-2">{{ ticket.title }}</div>
                <div class="flex items-center gap-2">
                  <span :class="priorityClass(ticket.priority)" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-label-sm font-label-sm">
                    <span class="w-1.5 h-1.5 rounded-full" :class="priorityDot(ticket.priority)"></span>
                    {{ ticket.priority }}
                  </span>
                </div>
                <div v-if="ticket.assignee" class="mt-2 text-label-sm font-label-sm text-on-surface-variant dark:text-outline truncate">{{ ticket.assignee }}</div>
              </div>
              <div v-if="!(ticketsByStatus[status]?.length)" class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline text-center py-8">No tickets</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex-1 p-4 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <button @click="prevMonth" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
            <span class="material-symbols-outlined" style="font-size: 20px;">chevron_left</span>
          </button>
          <h2 class="text-title-sm font-title-sm text-on-surface dark:text-inverse-on-surface">{{ monthLabel }}</h2>
          <button @click="nextMonth" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
            <span class="material-symbols-outlined" style="font-size: 20px;">chevron_right</span>
          </button>
        </div>
        <div class="grid grid-cols-7 gap-px bg-outline-variant/20 rounded-lg overflow-hidden">
          <div v-for="day in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="day" class="bg-surface-container-lowest dark:bg-inverse-surface text-center text-label-sm font-label-sm text-on-surface-variant dark:text-outline py-2">{{ day }}</div>
          <div v-for="day in calendarDays" :key="day.date" class="bg-surface-container-lowest dark:bg-inverse-surface min-h-[90px] p-1.5" :class="day.isToday ? 'ring-2 ring-primary ring-inset' : ''">
            <div class="text-label-sm font-label-sm mb-1" :class="day.isCurrentMonth ? 'text-on-surface dark:text-inverse-on-surface' : 'text-on-surface-variant/40 dark:text-outline/40'">{{ day.day }}</div>
            <div class="space-y-0.5">
              <div v-for="ticket in day.tickets.slice(0, 3)" :key="ticket.id" @click="openTicketDetail(ticket)" class="text-label-sm font-label-sm truncate rounded px-1 py-0.5 cursor-pointer hover:opacity-80" :class="statusBg(ticket.status)">{{ ticket.ticketId || ticket.id }}</div>
              <div v-if="day.tickets.length > 3" class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline px-1">{{ '+' + (day.tickets.length - 3) + ' more' }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-inverse-surface flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline">Showing {{ paginatedTickets.length }} of {{ filteredTickets.length }} tickets</div>
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
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
const route = useRoute()
const router = useRouter()
const ticketsStore = useTicketsStore()
const ui = useUIStore()
const auth = useAuthStore()
const searchQuery = ref(route.query.q || '')
console.log('[TicketsView] searchQuery initialized to:', searchQuery.value)

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

const selectedIds = ref(new Set())
const openDropdownId = ref(null)
const dropdownUp = ref(false)

const allSelected = computed(() => filteredTickets.value.length > 0 && filteredTickets.value.every(t => selectedIds.value.has(t.id)))

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredTickets.value.map(t => t.id))
  }
}

function deleteSelected() {
  const tickets = filteredTickets.value.filter(t => selectedIds.value.has(t.id))
  selectedIds.value = new Set()
  ui.openModal('DeleteConfirm', tickets)
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
  if (!e.target.closest('.ticket-dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  ticketsStore.startListening(auth.canViewAllTickets ? null : auth.user?.department)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  ticketsStore.stopListening()
})

function openTicketDetail(ticket) {
  openDropdownId.value = null
  ui.openModal('TicketDetail', { ticket, startEdit: false })
}

function openTicketEdit(ticket) {
  openDropdownId.value = null
  ui.openModal('TicketDetail', { ticket, startEdit: true })
}

function openTicketAssign(ticket) {
  openDropdownId.value = null
  ui.openModal('TicketDetail', { ticket, startEdit: true })
}

function deleteTicket(ticket) {
  openDropdownId.value = null
  ui.openModal('DeleteConfirm', ticket)
}

const filterCategory = ref('')
const filterPriority = ref('')
const filterStatus = ref('')
const sortDir = ref('asc')
const viewMode = ref('table')
const currentPage = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => Math.ceil(filteredTickets.value.length / pageSize.value) || 1)

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

const paginatedTickets = computed(() => {
  const tp = totalPages.value
  const page = Math.min(currentPage.value, tp)
  const start = (page - 1) * pageSize.value
  return filteredTickets.value.slice(start, start + pageSize.value)
})

function goToPage(n) {
  const tp = totalPages.value
  if (n < 1) currentPage.value = 1
  else if (n > tp) currentPage.value = tp
  else currentPage.value = n
}

watch([searchQuery, filterCategory, filterPriority, filterStatus], () => { currentPage.value = 1 })

const ticketsByStatus = computed(() => {
  const groups = {}
  for (const s of ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']) groups[s] = []
  for (const t of filteredTickets.value) {
    const status = t.status || 'Open'
    if (groups[status]) groups[status].push(t)
  }
  return groups
})

const calendarMonth = ref(new Date())

const monthLabel = computed(() =>
  calendarMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const ticketsByDate = computed(() => {
  const map = {}
  for (const t of filteredTickets.value) {
    let dateStr
    if (t.created?.toDate) dateStr = t.created.toDate().toISOString().slice(0, 10)
    else if (t.created) dateStr = new Date(t.created).toISOString().slice(0, 10)
    else continue
    if (!map[dateStr]) map[dateStr] = []
    map[dateStr].push(t)
  }
  return map
})

const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const totalCells = Math.ceil((startPad + totalDays) / 7) * 7
  const today = new Date().toISOString().slice(0, 10)
  const days = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startPad + 1
    const date = new Date(year, month, dayNum)
    const dateStr = date.toISOString().slice(0, 10)
    days.push({
      date: dateStr,
      day: date.getDate(),
      isCurrentMonth: dayNum >= 1 && dayNum <= totalDays,
      isToday: dateStr === today,
      tickets: ticketsByDate.value[dateStr] || []
    })
  }
  return days
})

function prevMonth() { const d = new Date(calendarMonth.value); d.setMonth(d.getMonth() - 1); calendarMonth.value = d }
function nextMonth() { const d = new Date(calendarMonth.value); d.setMonth(d.getMonth() + 1); calendarMonth.value = d }

function statusBg(s) {
  const map = { 'Open': 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline', 'Assigned': 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline', 'In Progress': 'bg-primary-container/40 text-on-primary-container dark:bg-primary-container/20 dark:text-primary', 'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 'Closed': 'bg-outline/20 text-on-surface-variant dark:bg-white/[0.05] dark:text-outline' }
  return map[s] || 'bg-surface-container-highest dark:bg-white/[0.08]'
}

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const filteredTickets = computed(() => {
  const userName = auth.user?.displayName
  const items = ticketsStore.tickets.filter(t => {
    if (!auth.canViewAllTickets && auth.user?.department && t.department !== auth.user.department && t.assignee !== userName) return false
    const q = searchQuery.value.toLowerCase()
    if (q && !(t.ticketId || t.id).toLowerCase().includes(q) && !(t.title || '').toLowerCase().includes(q)) return false
    if (filterCategory.value && t.category !== filterCategory.value) return false
    if (filterPriority.value && t.priority?.toLowerCase() !== filterPriority.value.toLowerCase()) return false
    if (filterStatus.value && t.status !== filterStatus.value) return false
    return true
  })
  return [...items].sort((a, b) => {
    const aMine = a.assignee === userName ? 1 : 0
    const bMine = b.assignee === userName ? 1 : 0
    if (aMine !== bMine) return bMine - aMine
    const idA = (a.ticketId || a.id || '').toLowerCase()
    const idB = (b.ticketId || b.id || '').toLowerCase()
    return sortDir.value === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
  })
})

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleDateString()
  return String(v)
}

function priorityClass(p) {
  const map = { critical: 'bg-error-container/40 text-on-error-container dark:bg-error/15 dark:text-error', high: 'bg-tertiary-container/20 text-tertiary dark:bg-tertiary/15 dark:text-tertiary', medium: 'bg-surface-container-highest text-on-surface-variant dark:bg-white/[0.08] dark:text-outline', low: 'bg-surface-container text-on-surface-variant dark:bg-white/[0.05] dark:text-outline' }
  return map[p?.toLowerCase()] || ''
}
function priorityDot(p) {
  const map = { critical: 'bg-error', high: 'bg-tertiary', medium: 'bg-primary', low: 'bg-outline' }
  return map[p?.toLowerCase()] || ''
}
function statusClass(s) {
  const map = { 'Open': 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline', 'In Progress': 'bg-primary-container/40 text-on-primary-container dark:bg-primary-container/20 dark:text-primary', 'Assigned': 'bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline', 'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 'Closed': 'bg-outline/20 text-on-surface-variant dark:bg-white/[0.05] dark:text-outline' }
  return map[s] || ''
}
</script>
