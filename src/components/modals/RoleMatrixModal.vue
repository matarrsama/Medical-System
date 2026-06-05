<template>
  <div>
    <div class="flex items-center justify-between p-4 border-b border-outline-variant dark:border-outline">
      <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Role Matrix</h3>
      <button @click="$emit('close')" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="overflow-x-auto p-4">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline uppercase tracking-wider">
            <th class="p-2 border-b border-outline-variant dark:border-outline">Role</th>
            <th class="p-2 border-b border-outline-variant dark:border-outline">Tickets</th>
            <th class="p-2 border-b border-outline-variant dark:border-outline">Inventory</th>
            <th class="p-2 border-b border-outline-variant dark:border-outline">Users</th>
            <th class="p-2 border-b border-outline-variant dark:border-outline">Reports</th>
            <th class="p-2 border-b border-outline-variant dark:border-outline">Settings</th>
          </tr>
        </thead>
        <tbody class="text-body-sm text-on-surface dark:text-inverse-on-surface">
          <tr v-for="row in matrix" :key="row.role" class="border-b border-outline-variant dark:border-outline/30">
            <td class="p-2 font-medium">{{ row.role }}</td>
            <td class="p-2"><span :class="badgeClass(row.tickets)">{{ row.tickets }}</span></td>
            <td class="p-2"><span :class="badgeClass(row.inventory)">{{ row.inventory }}</span></td>
            <td class="p-2"><span :class="badgeClass(row.users)">{{ row.users }}</span></td>
            <td class="p-2"><span :class="badgeClass(row.reports)">{{ row.reports }}</span></td>
            <td class="p-2"><span :class="badgeClass(row.settings)">{{ row.settings }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-end p-4 border-t border-outline-variant dark:border-outline">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant dark:border-outline rounded text-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08]">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineEmits(['close'])

const matrix = ref([
  { role: 'Sys Administrator', tickets: 'Full', inventory: 'Full', users: 'Full', reports: 'Full', settings: 'Full' },
  { role: 'ICT Officer', tickets: 'Full', inventory: 'Edit', users: 'Edit', reports: 'View', settings: 'View' },
  { role: 'Physician', tickets: 'Create', inventory: 'View', users: 'View', reports: 'View', settings: 'None' },
  { role: 'Nurse', tickets: 'Create', inventory: 'View', users: 'View', reports: 'None', settings: 'None' },
  { role: 'Viewer', tickets: 'View', inventory: 'View', users: 'View', reports: 'View', settings: 'None' },
  { role: 'Accounting', tickets: 'Create', inventory: 'View', users: 'View', reports: 'Full', settings: 'None' },
  { role: 'Procurement', tickets: 'Create', inventory: 'Edit', users: 'View', reports: 'View', settings: 'None' },
  { role: 'Hospital Admin', tickets: 'Full', inventory: 'Full', users: 'Edit', reports: 'Full', settings: 'View' },
  { role: 'Lab Technician', tickets: 'Create', inventory: 'View', users: 'View', reports: 'None', settings: 'None' },
  { role: 'Pharmacist', tickets: 'Create', inventory: 'View', users: 'View', reports: 'None', settings: 'None' },
  { role: 'Doctor', tickets: 'Create', inventory: 'View', users: 'View', reports: 'View', settings: 'None' }
])

function badgeClass(val) {
  if (val === 'Full') return 'px-2 py-0.5 rounded text-label-sm bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
  if (val === 'Edit' || val === 'Create') return 'px-2 py-0.5 rounded text-label-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
  if (val === 'View') return 'px-2 py-0.5 rounded text-label-sm bg-surface-container text-on-surface-variant dark:text-outline'
  return 'px-2 py-0.5 rounded text-label-sm bg-surface-container text-on-surface-variant dark:text-outline'
}
</script>
