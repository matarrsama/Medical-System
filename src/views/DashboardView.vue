<template>
  <div>
    <div class="flex justify-between items-end mb-lg">
      <div>
        <h1 class="text-display font-display text-on-surface">Overview</h1>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Real-time status of hospital ICT infrastructure and service desk operations.</p>
      </div>
      <div class="flex gap-2">
        <span v-if="ui.isOnline" class="bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full border border-outline-variant flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Updates Active
        </span>
        <span v-else class="bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full border border-outline-variant flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-outline-variant"></span> Offline — Cached Data
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
            <span class="material-symbols-outlined text-[14px]" :class="trendColor">{{ trendIcon }}</span> {{ ticketTrend }}% vs last week
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
          <span class="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1">{{ todayTickets }} created today</span>
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
        <div class="flex-1 relative w-full pt-8 pb-4">
          <div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-outline pr-2 w-10 text-right font-label-sm">
            <span>{{ maxCount }}</span>
            <span>{{ Math.round(maxCount * 3 / 4) }}</span>
            <span>{{ Math.round(maxCount / 2) }}</span>
            <span>{{ Math.round(maxCount / 4) }}</span>
            <span>0</span>
          </div>
          <div class="ml-12 flex-1 h-full relative">
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0.5">
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-transparent"></div>
            </div>
            <svg v-if="chartData.length" viewBox="0 0 600 250" class="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#2563eb" stop-opacity="0.02" />
                </linearGradient>
              </defs>
              <path :d="areaPath" fill="url(#areaGrad)" />
              <path :d="linePath" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm" />
              <circle v-for="p in chartData" :key="p.label" :cx="p.x" :cy="p.y" r="4.5" fill="#2563eb" stroke="white" stroke-width="2" class="drop-shadow-sm" />
              <text v-for="p in chartData" :key="'l'+p.label" :x="p.x" :y="238" text-anchor="middle" class="fill-outline font-label-sm" style="font-size: 11px;">{{ p.label }}</text>
              <text v-for="p in chartData" :key="'c'+p.label" :x="p.x" :y="p.y - 14" text-anchor="middle" class="fill-on-surface-variant font-label-sm" style="font-size: 11px;">{{ p.count }}</text>
            </svg>
            <div v-else class="flex items-center justify-center h-full text-on-surface-variant text-body-sm font-body-sm">No ticket data available</div>
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
          <router-link class="text-label-md font-label-md text-primary hover:underline" to="/tickets">View All</router-link>
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
          <div class="relative w-40 h-40 flex items-center justify-center">
            <svg viewBox="0 0 120 120" class="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="16" />
              <circle v-for="seg in donutSegments" :key="seg.label"
                cx="60" cy="60" r="42"
                fill="none"
                :stroke="seg.color"
                stroke-width="16"
                :stroke-dasharray="`${seg.dash} ${circ - seg.dash}`"
                :stroke-dashoffset="seg.offset"
                stroke-linecap="butt"
                class="transition-all duration-500"
              />
            </svg>
            <div class="z-10 bg-surface-container-lowest w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-sm">
              <span class="text-headline-lg font-headline-md text-on-surface leading-none">{{ totalTickets }}</span>
              <span class="text-[10px] text-on-surface-variant uppercase tracking-wider font-label-sm mt-1">Total</span>
            </div>
          </div>
          <div class="w-full mt-8 flex flex-col gap-2">
            <div v-for="cat in ['Hardware', 'Software', 'Network', 'Access']" :key="cat" class="flex items-center justify-between text-body-sm font-body-sm">
              <div class="flex items-center gap-2 text-on-surface"><span class="w-3 h-3 rounded-sm" :class="catColor[cat]"></span> {{ cat }}</div>
              <span class="font-medium">{{ catPct(cat) }}%</span>
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
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const ui = useUIStore()
const auth = useAuthStore()
const cache = useFirestoreCache()
const allTickets = ref([])
const allUsers = ref([])
const cachedTickets = cache.load('dashboard_tickets')
const cachedUsers = cache.load('dashboard_users')
if (cachedTickets) allTickets.value = cachedTickets
if (cachedUsers) allUsers.value = cachedUsers

const myTickets = computed(() =>
  auth.canViewAllTickets || !auth.user?.department
    ? allTickets.value
    : allTickets.value.filter(t => t.department === auth.user.department || t.assignee === auth.user.displayName)
)

let unsubTickets = null
let unsubUsers = null

onMounted(() => {
  const ticketsQuery = auth.canViewAllTickets || !auth.user?.department
    ? query(collection(db, 'tickets'))
    : query(collection(db, 'tickets'), where('department', '==', auth.user.department))
  unsubTickets = onSnapshot(
    ticketsQuery,
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

const openTickets = computed(() => myTickets.value.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length)
const criticalTickets = computed(() => myTickets.value.filter(t => t.priority === 'critical').length)
const totalTickets = computed(() => myTickets.value.length)
const assignedTechs = computed(() => allUsers.value.length)
const slaBreach = computed(() => myTickets.value.filter(t => t.priority === 'critical' && t.status !== 'Resolved' && t.status !== 'Closed').length)

function toDate(ts) {
  return ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null
}

const todayStart = computed(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
const thisWeekStart = computed(() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d })
const lastWeekStart = computed(() => { const d = new Date(thisWeekStart.value); d.setDate(d.getDate() - 7); return d })

const todayTickets = computed(() =>
  myTickets.value.filter(t => { const d = toDate(t.created); return d && d >= todayStart.value }).length
)

const thisWeekTickets = computed(() =>
  myTickets.value.filter(t => { const d = toDate(t.created); return d && d >= thisWeekStart.value }).length
)

const lastWeekTickets = computed(() =>
  myTickets.value.filter(t => { const d = toDate(t.created); return d && d >= lastWeekStart.value && d < thisWeekStart.value }).length
)

const ticketTrend = computed(() => {
  if (!lastWeekTickets.value) return thisWeekTickets.value > 0 ? 100 : 0
  return Math.round((thisWeekTickets.value - lastWeekTickets.value) / lastWeekTickets.value * 100)
})

const trendIcon = computed(() => ticketTrend.value >= 0 ? 'arrow_upward' : 'arrow_downward')
const trendColor = computed(() => ticketTrend.value > 0 ? 'text-error' : 'text-green-600')

function catPct(cat) {
  const total = myTickets.value.length || 1
  const count = myTickets.value.filter(t => (t.category || '') === cat).length
  return Math.round(count / total * 100)
}

const catColor = {
  Hardware: 'bg-primary-container',
  Software: 'bg-secondary',
  Network: 'bg-outline-variant',
  Access: 'bg-tertiary-container'
}

const catColorHex = {
  Hardware: '#2563eb',
  Software: '#4b41e1',
  Network: '#c3c6d7',
  Access: '#bc4800'
}

const circ = 2 * Math.PI * 42

const donutSegments = computed(() => {
  const total = myTickets.value.length || 1
  const categories = ['Hardware', 'Software', 'Network', 'Access']
  let cumulative = 0
  return categories.map(label => {
    const count = myTickets.value.filter(t => (t.category || '') === label).length
    const fraction = count / total
    const dash = fraction * circ
    const seg = { label, color: catColorHex[label], dash, offset: cumulative === 0 ? 0 : -cumulative }
    cumulative += dash
    return seg
  })
})

const incidents = computed(() =>
  myTickets.value
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

const statusOrder = ['Open', 'Assigned', 'Investigating', 'Pending Vendor', 'Resolved', 'Closed']

const statusCounts = computed(() => {
  const counts = {}
  for (const t of myTickets.value) {
    const s = t.status || 'Open'
    counts[s] = (counts[s] || 0) + 1
  }
  return counts
})

const maxCount = computed(() => {
  const vals = Object.values(statusCounts.value)
  return vals.length ? Math.max(...vals) : 1
})

const chartData = computed(() => {
  const w = 530, h = 190, l = 50, t = 20
  const entries = statusOrder.filter(s => statusCounts.value[s] !== undefined)
  const n = entries.length
  if (!n) return []
  const spacing = n > 1 ? w / (n - 1) : 0
  return entries.map((label, i) => ({
    label,
    count: statusCounts.value[label] || 0,
    x: l + i * spacing,
    y: t + (1 - (statusCounts.value[label] || 0) / maxCount.value) * h
  }))
})

const linePath = computed(() => {
  const pts = chartData.value
  if (pts.length < 2) return ''
  return smoothPath(pts)
})

const areaPath = computed(() => {
  const pts = chartData.value
  if (pts.length < 2) return ''
  const bottom = 210
  return `${smoothPath(pts)} L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`
})

function smoothPath(points) {
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2]
    const tension = 0.3
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

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
