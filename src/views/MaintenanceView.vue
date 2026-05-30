<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Maintenance Schedule</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Plan and track preventive maintenance for hospital equipment.</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-gutter mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
        <div class="text-label-md font-label-md text-on-surface-variant">{{ stat.label }}</div>
        <div class="text-display font-display text-on-surface mt-1">{{ stat.value }}</div>
      </div>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant">
        <h3 class="text-headline-sm font-headline-md text-on-surface">Scheduled Tasks</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium">Equipment</th>
              <th class="p-3 border-b border-outline-variant font-medium">Type</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Location</th>
              <th class="p-3 border-b border-outline-variant font-medium">Scheduled Date</th>
              <th class="p-3 border-b border-outline-variant font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="text-body-sm text-on-surface">
            <tr v-for="task in tasks" :key="task.id" class="hover:bg-surface-container-lowest cursor-pointer border-b border-outline-variant/30 last:border-0">
              <td class="p-3 pl-4 font-medium">{{ task.equipment }}</td>
              <td class="p-3 text-on-surface-variant">{{ task.type }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ task.location }}</td>
              <td class="p-3">{{ task.date }}</td>
              <td class="p-3">
                <span :class="statusClass(task.status)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ task.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { label: 'Scheduled', value: 18 },
  { label: 'In Progress', value: 6 },
  { label: 'Completed', value: 142 },
  { label: 'Overdue', value: 2 }
])

const tasks = ref([
  { id: 1, equipment: 'MRI Scanner - Suite A', type: 'Preventive', location: 'Imaging', date: '2026-06-01', status: 'Scheduled' },
  { id: 2, equipment: 'CT Scanner - Suite B', type: 'Calibration', location: 'Imaging', date: '2026-06-02', status: 'In Progress' },
  { id: 3, equipment: 'Ventilator Bank - ICU', type: 'Safety Check', location: 'ICU', date: '2026-06-03', status: 'Scheduled' },
  { id: 4, equipment: 'UPS Backup - Server Room', type: 'Battery Test', location: 'Infrastructure', date: '2026-05-28', status: 'Overdue' }
])

function statusClass(s) {
  const map = { Scheduled: 'bg-blue-100 text-blue-800', 'In Progress': 'bg-amber-100 text-amber-800', Completed: 'bg-green-100 text-green-800', Overdue: 'bg-error-container/40 text-on-error-container' }
  return map[s] || ''
}
</script>
