<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg space-y-4 sm:space-y-0">
      <div>
        <div class="flex items-center space-x-2 text-label-md font-label-md text-on-surface-variant mb-1">
          <span>Service Desk</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span class="text-primary font-bold">Active Tickets</span>
        </div>
        <h2 class="text-display font-display text-on-surface">Tickets</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage and resolve hospital ICT service requests and incidents.</p>
      </div>
      <div class="flex items-center space-x-3">
        <div class="flex bg-surface-container border border-outline-variant rounded-lg p-0.5">
          <button class="bg-surface border border-outline shadow-sm text-on-surface p-1.5 rounded-md flex items-center justify-center">
            <span class="material-symbols-outlined" style="font-size: 18px;">table_rows</span>
          </button>
          <button class="text-on-surface-variant hover:text-on-surface p-1.5 rounded-md flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined" style="font-size: 18px;">view_kanban</span>
          </button>
          <button class="text-on-surface-variant hover:text-on-surface p-1.5 rounded-md flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined" style="font-size: 18px;">calendar_month</span>
          </button>
        </div>
        <button class="lg:hidden bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded shadow-sm hover:bg-primary-container transition-colors items-center flex">
          <span class="material-symbols-outlined mr-1" style="font-size: 16px;">add</span> New
        </button>
      </div>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
      <div class="border-b border-outline-variant p-4 bg-surface-container-lowest flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container pl-9 pr-3 py-1.5 rounded border border-outline-variant text-body-sm font-body-sm placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors" placeholder="Filter by subject or ID..." type="text" />
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterCategory" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
              <option value="">Category: All</option>
              <option>Network</option>
              <option>Hardware</option>
              <option>Software</option>
              <option>Access</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterPriority" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
              <option value="">Priority: All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div class="relative hidden sm:block">
            <select v-model="filterStatus" class="appearance-none bg-surface-container border border-outline-variant rounded pl-3 pr-8 py-1.5 text-body-sm font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer">
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
          <button class="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface px-2 py-1 rounded transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined" style="font-size: 16px;">filter_list</span> More
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
              <th class="p-3 border-b border-outline-variant font-medium cursor-pointer select-none" @click="toggleSort">Ticket ID <span class="material-symbols-outlined align-middle" style="font-size: 14px;">{{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></th>
              <th class="p-3 border-b border-outline-variant font-medium">Title</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Priority</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Status</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Assignee</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Created</th>
              <th class="p-3 pr-4 border-b border-outline-variant font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface">
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/30 last:border-0" @click="openTicketDetail(ticket)">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(ticket.id)" @change="toggleSelect(ticket.id)" class="rounded border-outline-variant text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary font-medium">{{ ticket.ticketId || ticket.id }}</td>
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
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ ticket.assignee }}</td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ formatDate(ticket.created) }}</td>
              <td class="p-3 pr-4 relative" @click.stop>
                <button @click.stop="toggleDropdown(ticket.id, $event)" class="p-1 rounded hover:bg-surface-container text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openDropdownId === ticket.id" class="ticket-dropdown absolute right-4 z-50 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1" :class="dropdownUp ? 'bottom-full mb-1' : 'top-full mt-1'">
                  <button @click.stop="openTicketDetail(ticket)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">info</span>
                    View Details
                  </button>
                  <button @click.stop="openTicketEdit(ticket)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                    Edit
                  </button>
                  <button @click.stop="openTicketAssign(ticket)" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-label-sm font-label-sm text-on-surface text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">person_add</span>
                    Assign
                  </button>
                  <div class="border-t border-outline-variant my-1"></div>
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
      <div class="border-t border-outline-variant p-4 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-body-sm font-body-sm text-on-surface-variant">Showing {{ filteredTickets.length }} of {{ ticketsStore.tickets.length }} tickets</div>
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-sm font-label-sm transition-colors">Previous</button>
          <button class="px-3 py-1 rounded bg-primary text-on-primary text-label-sm font-label-sm">1</button>
          <button class="px-2 py-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-sm font-label-sm transition-colors">2</button>
          <button class="px-2 py-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-sm font-label-sm transition-colors">3</button>
          <button class="px-2 py-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-sm font-label-sm transition-colors">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import { useUIStore } from '@/stores/ui'
const route = useRoute()
const ticketsStore = useTicketsStore()
const ui = useUIStore()
const searchQuery = ref(route.query.q || '')
console.log('[TicketsView] searchQuery initialized to:', searchQuery.value)

watch(() => route.query.q, (q) => {
  console.log('[TicketsView] route.query.q changed to:', q)
  searchQuery.value = q || ''
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

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

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

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const filteredTickets = computed(() => {
  const items = ticketsStore.tickets.filter(t => {
    const q = searchQuery.value.toLowerCase()
    if (q && !(t.ticketId || t.id).toLowerCase().includes(q) && !(t.title || '').toLowerCase().includes(q)) return false
    if (filterCategory.value && t.category !== filterCategory.value) return false
    if (filterPriority.value && t.priority?.toLowerCase() !== filterPriority.value.toLowerCase()) return false
    if (filterStatus.value && t.status !== filterStatus.value) return false
    return true
  })
  return [...items].sort((a, b) => {
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
  const map = { critical: 'bg-error-container/40 text-on-error-container', high: 'bg-tertiary-container/20 text-tertiary', medium: 'bg-surface-container-highest text-on-surface-variant', low: 'bg-surface-container text-on-surface-variant' }
  return map[p?.toLowerCase()] || ''
}
function priorityDot(p) {
  const map = { critical: 'bg-error', high: 'bg-tertiary', medium: 'bg-primary', low: 'bg-outline' }
  return map[p?.toLowerCase()] || ''
}
function statusClass(s) {
  const map = { 'Open': 'bg-surface-container-highest text-on-surface-variant', 'In Progress': 'bg-primary-container/40 text-on-primary-container', 'Assigned': 'bg-surface-container-highest text-on-surface-variant', 'Resolved': 'bg-green-100 text-green-800', 'Closed': 'bg-outline/20 text-on-surface-variant' }
  return map[s] || ''
}
</script>
