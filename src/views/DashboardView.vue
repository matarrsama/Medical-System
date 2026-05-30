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
          <h3 class="text-display font-display text-on-surface leading-none mb-1">24</h3>
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
          <h3 class="text-display font-display text-on-surface leading-none mb-1">5</h3>
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
          <h3 class="text-display font-display text-on-surface leading-none mb-1">12</h3>
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
          <h3 class="text-display font-display text-tertiary leading-none mb-1">3</h3>
          <p class="text-label-md font-label-md text-on-surface-variant">SLA Near Breach</p>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col min-h-[300px]">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-headline-sm font-headline-md text-on-surface">Average Resolution Time</h3>
            <p class="text-body-sm font-body-sm text-on-surface-variant">Past 7 days across all priorities</p>
          </div>
          <button class="p-1.5 rounded hover:bg-surface-container transition-colors text-on-surface-variant">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        <div class="flex-1 relative w-full flex items-end pt-8 pb-4">
          <div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-outline pr-2 w-8 text-right font-label-sm">
            <span>4h</span><span>3h</span><span>2h</span><span>1h</span><span>0h</span>
          </div>
          <div class="ml-8 flex-1 h-full relative border-l border-b border-outline-variant/50 flex items-end justify-between px-2">
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-outline-variant/20"></div>
              <div class="w-full h-px bg-transparent"></div>
            </div>
            <div v-for="bar in resolutionTime" :key="bar.day" class="w-2 rounded-t relative group" :class="bar.color" :style="{ height: bar.height }">
              <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container text-xs px-1 rounded opacity-0 group-hover:opacity-100">{{ bar.label }}</span>
            </div>
            <div class="absolute -bottom-6 left-0 right-0 flex justify-between px-2 text-[10px] text-outline font-label-sm">
              <span v-for="day in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="day">{{ day }}</span>
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
              <span class="text-headline-lg font-headline-md text-on-surface leading-none">142</span>
              <span class="text-[10px] text-on-surface-variant uppercase tracking-wider font-label-sm mt-1">Total</span>
            </div>
          </div>
          <div class="w-full mt-8 flex flex-col gap-2">
            <div class="flex items-center justify-between text-body-sm font-body-sm">
              <div class="flex items-center gap-2 text-on-surface"><span class="w-3 h-3 rounded-sm bg-primary-container"></span> Hardware/Devices</div>
              <span class="font-medium">45%</span>
            </div>
            <div class="flex items-center justify-between text-body-sm font-body-sm">
              <div class="flex items-center gap-2 text-on-surface"><span class="w-3 h-3 rounded-sm bg-secondary"></span> Software/Apps</div>
              <span class="font-medium">35%</span>
            </div>
            <div class="flex items-center justify-between text-body-sm font-body-sm">
              <div class="flex items-center gap-2 text-on-surface"><span class="w-3 h-3 rounded-sm bg-outline-variant"></span> Network/Infra</div>
              <span class="font-medium">20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const resolutionTime = [
  { day: 'Mon', height: '40%', color: 'bg-primary', label: '1.6h' },
  { day: 'Tue', height: '60%', color: 'bg-primary', label: '2.4h' },
  { day: 'Wed', height: '35%', color: 'bg-primary', label: '1.4h' },
  { day: 'Thu', height: '80%', color: 'bg-error', label: '3.2h' },
  { day: 'Fri', height: '50%', color: 'bg-primary', label: '2.0h' },
  { day: 'Sat', height: '20%', color: 'bg-primary', label: '0.8h' },
  { day: 'Sun', height: '30%', color: 'bg-primary', label: '1.2h' }
]

const incidents = [
  { id: 'INC-9042', summary: 'Radiology PACS Server Offline', department: 'Imaging', time: '10:14 AM', status: 'Investigating' },
  { id: 'INC-9038', summary: 'EHR Login Timeout Errors', department: 'ER', time: '09:45 AM', status: 'Assigned' },
  { id: 'INC-9012', summary: 'Network Switch Failure - Floor 3', department: 'Infrastructure', time: 'Yesterday', status: 'Pending Vendor' },
  { id: 'INC-8995', summary: 'Pharmacy Dispensing App Crash', department: 'Pharmacy', time: 'Yesterday', status: 'Resolved' }
]

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
