import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref([
    { id: 'INC-9042', title: 'Radiology PACS Server Offline', department: 'Imaging', priority: 'critical', status: 'Investigating', assignee: 'John S.', created: '2026-05-30' },
    { id: 'INC-9038', title: 'EHR Login Timeout Errors', department: 'ER', priority: 'high', status: 'Assigned', assignee: 'Maria G.', created: '2026-05-30' },
    { id: 'INC-9012', title: 'Network Switch Failure - Floor 3', department: 'Infrastructure', priority: 'high', status: 'Pending Vendor', assignee: 'David K.', created: '2026-05-29' },
    { id: 'INC-8995', title: 'Pharmacy Dispensing App Crash', department: 'Pharmacy', priority: 'medium', status: 'Resolved', assignee: 'Lisa M.', created: '2026-05-29' }
  ])

  return { tickets }
})
