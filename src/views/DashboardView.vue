<template>
  <div>
    <div class="flex justify-between items-end mb-lg">
      <div>
        <h1 class="text-display font-display text-on-surface">Overview</h1>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Real-time status of hospital ICT infrastructure and service desk operations.</p>
      </div>
      <div class="flex gap-2">
        <span class="bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full border border-outline-variant flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-green-500"></span> Live Updates Active
        </span>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-gutter mb-lg">
      <div class="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-surface-container rounded-lg text-primary">
            <span class="material-symbols-outlined">folder_open</span>
          </div>
          <span class="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] text-green-600">arrow_downward</span> 12% vs last week
          </span>
        </div>
        <div>
          <h3 class="text-display font-display text-on-surface leading-none mb-1">{{ openTickets }}</h3>
          <p class="text-label-md font-label-md text-on-surface-variant">Open Tickets</p>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border-l-4 border-l-error border-y border-y-outline-variant border-r border-r-outline-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-error-container text-on-error-container rounded-lg">
            <span class="material-symbols-outlined icon-fill">warning</span>
          </div>
          <span class="text-label-sm font-label-sm text-error flex items-center gap-1 bg-error-container/50 px-2 py-0.5 rounded-full">Action Required</span>
        </div>
        <div>
          <h3 class="text-display font-display text-on-surface leading-none mb-1">{{ criticalTickets }}</h3>
          <p class="text-label-md font-label-md text-on-surface-variant">Critical Tickets</p>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-surface-container rounded-lg text-primary">
            <span class="material-symbols-outlined">support_agent</span>
          </div>
          <span class="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1">Shift 1 Active</span>
        </div>
        <div>
          <h3 class="text-display font-display text-on-surface leading-none mb-1">{{ assignedTechs }}</h3>
          <p class="text-label-md font-label-md text-on-surface-variant">Assigned Technicians</p>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-tertiary-container/10 to-transparent"></div>
        <div class="relative z-10 flex justify-between items-start mb-4">
          <div class="p-2 bg-tertiary-container/20 text-tertiary rounded-lg">
            <span class="material-symbols-outlined">timer</span>
          </div>
        </div>
        <div class="relative z-10">
          <h3 class="text-display font-display text-tertiary leading-none mb-1">{{ slaBreach }}</h3>
          <p class="text-label-md font-label-md text-on-surface-variant">SLA Near Breach</p>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col min-h-[300px]">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-headline-sm font-headline-md text-on-surface">Tickets by Status</h3>
            <p class="text-body-sm font-body-sm text-on-surface-variant">Distribution across all tickets</p>
          </div>
        </div>
        <div class="flex-1 relative w-full flex items-end pt-8 pb-4">
          <div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-outline pr-2 w-8 text-right font-label-sm">
            <span>{{ maxStatus }}</span><span>{{ Math.round(maxStatus * 3 / 4) }}</span><span>{{ Math.round(maxStatus / 2) }}</span><span>{{ Math.round(maxStatus / 4) }}</span><span>0</span>
          </div>
          <div class="ml-8 flex-1 h-full relative border-l border-b border-outline-variant/50 flex items-end justify-between px-4">
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-transparent"></div>
            </div>
            <div v-for="bar in statusBars" :key="bar.label" class="flex flex-col items-center gap-1 w-14">
              <span class="text-label-xs font-label-sm text-on-surface-variant">{{ bar.count }}</span>
              <div class="w-full rounded-t transition-all duration-300" :class="bar.color" :style="{ height: bar.height }"></div>
              <span class="text-[10px] text-outline font-label-sm text-center truncate w-full">{{ bar.label }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col">
        <h3 class="text-headline-sm font-headline-md text-on-surface mb-4">Quick Actions</h3>
        <div class="flex flex-col gap-sm flex-1">
          <button class="flex items-center gap-3 p-3 rounded-lg bg-surface-container hover:bg-surface-container-high border border-transparent hover:border-outline-variant transition-all text-left group">
            <div class="p-2 bg-surface-container-highest rounded text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <div class="text-body-md font-label-md text-on-surface">Provision User Account</div>
              <div class="text-body-sm text-on-surface-variant">Active Directory &amp; EHR access</div>
            </div>
          </button>
          <button class="flex items-center gap-3 p-3 rounded-lg bg-surface-container hover:bg-surface-container-high border border-transparent hover:border-outline-variant transition-all text-left group">
            <div class="p-2 bg-surface-container-highest rounded text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-[20px]">router</span>
            </div>
            <div>
              <div class="text-body-md font-label-md text-on-surface">Network Diagnostic</div>
              <div class="text-body-sm text-on-surface-variant">Run ping &amp; traceroute tools</div>
            </div>
          </button>
          <button class="flex items-center gap-3 p-3 rounded-lg bg-surface-container hover:bg-surface-container-high border border-transparent hover:border-outline-variant transition-all text-left group">
            <div class="p-2 bg-error-container text-on-error-container rounded group-hover:bg-error group-hover:text-on-error transition-colors">
              <span class="material-symbols-outlined text-[20px]">campaign</span>
            </div>
            <div>
              <div class="text-body-md font-label-md text-on-surface">Broadcast Outage</div>
              <div class="text-body-sm text-on-surface-variant">Send P1 alert to all staff</div>
            </div>
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-gutter">
      <div class="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
        <div class="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 class="text-headline-sm font-headline-md text-on-surface">Recent Critical Incidents</h3>
          <a class="text-label-md font-label-md text-primary hover:underline" href="#">View All</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
                <th class="p-4 border-b border-outline-variant font-medium">Ticket ID</th>
                <th class="p-4 border-b border-outline-variant font-medium">Issue Summary</th>
                <th class="p-4 border-b border-outline-variant font-medium">Department</th>
                <th class="p-4 border-b border-outline-variant font-medium">Time Logged</th>
                <th class="p-4 border-b border-outline-variant font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="text-body-sm font-body-sm text-on-surface">
              <tr v-for="incident in incidents" :key="incident.id" class="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/30 last:border-0">
                <td class="p-4 text-primary font-medium">{{ incident.id }}</td>
                <td class="p-4">{{ incident.summary }}</td>
                <td class="p-4 text-on-surface-variant">{{ incident.department }}</td>
                <td class="p-4 text-on-surface-variant">{{ incident.time }}</td>
                <td class="p-4">
                  <span :class="statusClass(incident.status)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-label-sm font-label-md">
                    <span :class="statusDot(incident.status)" class="w-1.5 h-1.5 rounded-full"></span> {{ incident.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col">
        <h3 class="text-headline-sm font-headline-md text-on-surface mb-6">Categories</h3>
        <div class="flex-1 flex flex-col items-center justify-center relative">
          <div class="w-40 h-40 rounded-full border-[16px] border-surface-container flex items-center justify-center relative shadow-inner" style="border-top-color: #2563eb; border-right-color: #4b41e1; border-bottom-color: #c3c6d7; border-left-color: #2563eb; transform: rotate(45deg);">
            <div class="w-full h-full rounded-full bg-surface-container-lowest absolute inset-0 -m-[16px] border-[16px] border-transparent" style="clip-path: polygon(50% 50%, 100% 0, 100% 100%, 0 100%); border-color: transparent;"></div>
            <div class="transform -rotate-45 text-center z-10 bg-surface-container-lowest w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-sm">
              <span class="text-headline-lg font-headline-md text-on-surface leading-none">{{ totalTickets }}</span>
              <span class="text-[10px] text-on-surface-variant uppercase tracking-wider font-label-sm mt-1">Total</span>
            </div>
          </div>
          <div class="w-full mt-8 flex flex-col gap-2">
            <div class="flex items-center justify-between text-body-sm font-body-sm">
              <div class="flex items-center gap-2 text-on-surface"><span class="w-3 h-3 rounded-sm bg-primary-container"></span> Hardware/Devices</div>
              <span class="font-medium">{{ catPct('hardware') }}%</span>
            </div>
            <div class="flex items-center justify-between text-body-sm font-body-sm">
              <div class="flex items-center gap-2 text-on-surface"><span class="w-3 h-3 rounded-sm bg-secondary"></span> Software/Apps</div>
              <span class="font-medium">{{ catPct('software') }}%</span>
            </div>
            <div class="flex items-center justify-between text-body-sm font-body-sm">
              <div class="flex items-center gap-2 text-on-surface"><span class="w-3 h-3 rounded-sm bg-outline-variant"></span> Network/Infra</div>
              <span class="font-medium">{{ catPct('network') }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

const cache = useFirestoreCache()
const allTickets = ref([])
const allUsers = ref([])
const cachedTickets = cache.load('dashboard_tickets')
const cachedUsers = cache.load('dashboard_users')
if (cachedTickets) allTickets.value = cachedTickets
if (cachedUsers) allUsers.value = cachedUsers

let unsubTickets = null
let unsubUsers = null

onMounted(() => {
  unsubTickets = onSnapshot(
    query(collection(db, 'tickets'), orderBy('created', 'desc')),
    (snap) => {
      const mapped = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      allTickets.value = mapped
      cache.save('dashboard_tickets', mapped)
    },
    () => {}
  )
  unsubUsers = onSnapshot(
    query(collection(db, 'users'), where('role', 'in', ['ICT Officer', 'Sys Administrator'])),
    (snap) => {
      const mapped = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      allUsers.value = mapped
      cache.save('dashboard_users', mapped)
    },
    () => {}
  )
})

onUnmounted(() => {
  if (unsubTickets) unsubTickets()
  if (unsubUsers) unsubUsers()
})

const openTickets = computed(() => allTickets.value.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length)
const criticalTickets = computed(() => allTickets.value.filter(t => t.priority === 'critical').length)
const totalTickets = computed(() => allTickets.value.length)
const assignedTechs = computed(() => allUsers.value.length)
const slaBreach = computed(() => allTickets.value.filter(t => t.priority === 'critical' && t.status !== 'Resolved' && t.status !== 'Closed').length)

function catPct(cat) {
  const total = allTickets.value.length || 1
  const count = allTickets.value.filter(t => {
    const title = (t.title || '').toLowerCase()
    if (cat === 'hardware') return title.includes('server') || title.includes('switch') || title.includes('workstation') || title.includes('printer') || title.includes('device')
    if (cat === 'software') return title.includes('login') || title.includes('app') || title.includes('software') || title.includes('ehr') || title.includes('crash')
    if (cat === 'network') return title.includes('network') || title.includes('vpn') || title.includes('connectivity') || title.includes('router')
    return false
  }).length
  return Math.round(count / total * 100)
}

const incidents = computed(() =>
  allTickets.value
    .filter(t => t.priority === 'critical' || t.priority === 'high')
    .slice(0, 5)
    .map(t => ({
      id: t.id || t.ticketId,
      summary: t.title,
      department: t.department,
      time: t.created || '',
      status: t.status
    }))
)

const statusColors = {
  'Investigating': 'bg-error',
  'Assigned': 'bg-primary',
  'Pending Vendor': 'bg-tertiary',
  'Resolved': 'bg-green-500',
  'Closed': 'bg-outline-variant',
  'Open': 'bg-primary-container'
}

const statusBars = computed(() => {
  const counts = {}
  for (const t of allTickets.value) {
    const s = t.status || 'Open'
    counts[s] = (counts[s] || 0) + 1
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(([, c]) => c), 1)
  return entries.map(([label, count]) => ({
    label,
    count,
    height: Math.max((count / max) * 100, 8) + '%',
    color: statusColors[label] || 'bg-primary-container'
  }))
})

const maxStatus = computed(() => {
  if (!statusBars.value.length) return 0
  return Math.max(...statusBars.value.map(b => b.count))
})

function statusClass(status) {
  const map = {
    'Investigating': 'bg-error-container/40 text-on-error-container',
    'Assigned': 'bg-surface-container-highest text-on-surface-variant',
    'Pending Vendor': 'bg-tertiary-container/20 text-tertiary',
    'Resolved': 'bg-green-100 text-green-800'
  }
  return map[status] || ''
}

function statusDot(status) {
  const map = {
    'Investigating': 'bg-error',
    'Assigned': 'bg-primary',
    'Pending Vendor': 'bg-tertiary',
    'Resolved': 'bg-green-600'
  }
  return map[status] || ''
}
</script>
