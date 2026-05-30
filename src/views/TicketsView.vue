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
              <option>Software (EMR)</option>
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
                <input type="checkbox" class="rounded border-outline-variant text-primary focus:ring-primary" />
              </th>
              <th class="p-3 border-b border-outline-variant font-medium">Ticket ID</th>
              <th class="p-3 border-b border-outline-variant font-medium">Title</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Priority</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Status</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Assignee</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Created</th>
              <th class="p-3 pr-4 border-b border-outline-variant font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface">
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/30 last:border-0" @click="ui.openModal('NewTicket')">
              <td class="p-3 pl-4" @click.stop>
                <input type="checkbox" class="rounded border-outline-variant text-primary focus:ring-primary" />
              </td>
              <td class="p-3 text-primary font-medium">{{ ticket.id }}</td>
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
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ ticket.created }}</td>
              <td class="p-3 pr-4" @click.stop>
                <button class="p-1 rounded hover:bg-surface-container text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
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
import { ref, computed } from 'vue'
import { useTicketsStore } from '@/stores/tickets'
import { useUIStore } from '@/stores/ui'

const ticketsStore = useTicketsStore()
const ui = useUIStore()
const searchQuery = ref('')
const filterCategory = ref('')
const filterPriority = ref('')
const filterStatus = ref('')

const filteredTickets = computed(() => {
  return ticketsStore.tickets.filter(t => {
    if (searchQuery.value && !t.id.toLowerCase().includes(searchQuery.value.toLowerCase()) && !t.title.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (filterPriority.value && t.priority !== filterPriority.value.toLowerCase()) return false
    if (filterStatus.value && t.status !== filterStatus.value) return false
    return true
  })
})

function priorityClass(p) {
  const map = { critical: 'bg-error-container/40 text-on-error-container', high: 'bg-tertiary-container/20 text-tertiary', medium: 'bg-surface-container-highest text-on-surface-variant', low: 'bg-surface-container text-on-surface-variant' }
  return map[p] || ''
}
function priorityDot(p) {
  const map = { critical: 'bg-error', high: 'bg-tertiary', medium: 'bg-primary', low: 'bg-outline' }
  return map[p] || ''
}
function statusClass(s) {
  const map = { 'Investigating': 'bg-error-container/40 text-on-error-container', 'Assigned': 'bg-surface-container-highest text-on-surface-variant', 'Pending Vendor': 'bg-tertiary-container/20 text-tertiary', 'Resolved': 'bg-green-100 text-green-800' }
  return map[s] || ''
}
</script>
