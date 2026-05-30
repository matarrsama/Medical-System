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
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium">Request ID</th>
              <th class="p-3 border-b border-outline-variant font-medium">Title</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Requester</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant font-medium">Status</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface">
            <tr v-for="req in filteredRequests" :key="req.id" class="hover:bg-surface-container-lowest transition-colors cursor-pointer border-b border-outline-variant/30 last:border-0">
              <td class="p-3 pl-4 text-primary font-medium">{{ req.id }}</td>
              <td class="p-3 font-medium">{{ req.title }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ req.requester }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ req.department }}</td>
              <td class="p-3">
                <span :class="statusClass(req.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(req.status)"></span>
                  {{ req.status }}
                </span>
              </td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ req.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()
const activeTab = ref('pending')

const tabs = [
  { key: 'pending', label: 'Pending', count: 12 },
  { key: 'approved', label: 'Approved', count: 48 },
  { key: 'rejected', label: 'Rejected', count: 3 }
]

const allRequests = ref([
  { id: 'REQ-2026-001', title: 'MRI Scanner Maintenance Contract Renewal', requester: 'Dr. Sarah Chen', department: 'Imaging', status: 'Pending', date: '2026-05-28' },
  { id: 'REQ-2026-002', title: 'Additional Workstation for Pharmacy', requester: 'Mark Thompson', department: 'Pharmacy', status: 'Approved', date: '2026-05-27' },
  { id: 'REQ-2026-003', title: 'VPN Access for Remote Pathologist', requester: 'Dr. James Wilson', department: 'Pathology', status: 'Pending', date: '2026-05-26' },
  { id: 'REQ-2026-004', title: 'Server Rack UPS Replacement', requester: 'Ahmed Al-Rashid', department: 'Infrastructure', status: 'Rejected', date: '2026-05-25' },
  { id: 'REQ-2026-005', title: 'EHR Software License Upgrade (10 seats)', requester: 'Lisa Thompson', department: 'Admin', status: 'Pending', date: '2026-05-24' }
])

const filteredRequests = computed(() => {
  const statusMap = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
  return allRequests.value.filter(r => r.status === statusMap[activeTab.value])
})

function statusClass(s) {
  const map = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-green-100 text-green-800', Rejected: 'bg-error-container/40 text-on-error-container' }
  return map[s] || ''
}
function statusDot(s) {
  const map = { Pending: 'bg-amber-500', Approved: 'bg-green-600', Rejected: 'bg-error' }
  return map[s] || ''
}
</script>
