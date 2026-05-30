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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const tasks = ref([])
let unsubscribe = null

const stats = computed(() => {
  const total = tasks.value.length
  const scheduled = tasks.value.filter(t => t.status === 'Scheduled').length
  const inProgress = tasks.value.filter(t => t.status === 'In Progress').length
  const completed = tasks.value.filter(t => t.status === 'Completed').length
  const overdue = tasks.value.filter(t => t.status === 'Overdue').length
  return [
    { label: 'Scheduled', value: scheduled },
    { label: 'In Progress', value: inProgress },
    { label: 'Completed', value: completed },
    { label: 'Overdue', value: overdue }
  ]
})

function statusClass(s) {
  const map = { Scheduled: 'bg-blue-100 text-blue-800', 'In Progress': 'bg-amber-100 text-amber-800', Completed: 'bg-green-100 text-green-800', Overdue: 'bg-error-container/40 text-on-error-container' }
  return map[s] || ''
}

onMounted(() => {
  const q = query(collection(db, 'maintenanceTasks'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    tasks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
