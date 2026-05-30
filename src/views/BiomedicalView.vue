<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Biomedical Equipment</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Track specialized hospital medical equipment and compliance.</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-gutter mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
        <div class="text-label-md font-label-md text-on-surface-variant">{{ stat.label }}</div>
        <div class="text-display font-display text-on-surface mt-1">{{ stat.value }}</div>
      </div>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex justify-between items-center">
        <h3 class="text-headline-sm font-headline-md text-on-surface">Equipment Registry</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium">Equipment ID</th>
              <th class="p-3 border-b border-outline-variant font-medium">Name</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant font-medium">Status</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Last Calibration</th>
            </tr>
          </thead>
          <tbody class="text-body-sm text-on-surface">
            <tr v-for="item in equipment" :key="item.id" class="hover:bg-surface-container-lowest cursor-pointer border-b border-outline-variant/30 last:border-0">
              <td class="p-3 pl-4 text-primary font-medium">{{ item.id }}</td>
              <td class="p-3 font-medium">{{ item.name }}</td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ item.department }}</td>
              <td class="p-3">
                <span :class="statusClass(item.status)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ item.status }}</span>
              </td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ item.lastCalibration }}</td>
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
const equipment = ref([])
let unsubscribe = null

const stats = computed(() => {
  const total = equipment.value.length
  const operational = equipment.value.filter(e => e.status === 'Operational').length
  const needsCal = equipment.value.filter(e => e.status === 'Needs Calibration').length
  const outOfService = equipment.value.filter(e => e.status === 'Out of Service').length
  return [
    { label: 'Total Equipment', value: total },
    { label: 'Operational', value: operational },
    { label: 'Needs Calibration', value: needsCal },
    { label: 'Out of Service', value: outOfService }
  ]
})

function statusClass(s) {
  const map = { Operational: 'bg-green-100 text-green-800', 'Needs Calibration': 'bg-amber-100 text-amber-800', 'Out of Service': 'bg-error-container/40 text-on-error-container' }
  return map[s] || ''
}

onMounted(() => {
  const q = query(collection(db, 'equipment'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    equipment.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
