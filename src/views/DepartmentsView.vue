<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Departments</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage hospital departments, contacts, and configurations.</p>
      </div>
      <button @click="ui.openModal('AddDepartment')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Department
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
      <div v-for="dept in departments" :key="dept.name" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg" :class="dept.colorClass + ' flex items-center justify-center'">
            <span class="material-symbols-outlined text-on-primary">{{ dept.icon }}</span>
          </div>
          <div>
            <h3 class="text-body-md font-bold text-on-surface">{{ dept.name }}</h3>
            <p class="text-label-sm text-on-surface-variant">{{ dept.head }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between text-label-sm text-on-surface-variant mt-4 pt-3 border-t border-outline-variant/30">
          <span>{{ dept.staffCount }} staff</span>
          <span>{{ dept.devices }} devices</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'

const ui = useUIStore()
const departments = ref([])
let unsubscribe = null

const colorMap = {
  'Emergency Room': 'bg-error',
  'Imaging & Radiology': 'bg-primary',
  'Pharmacy': 'bg-tertiary',
  'Infrastructure': 'bg-secondary',
  'Administration': 'bg-surface-variant text-on-surface',
  'Pathology Lab': 'bg-primary-container',
  'Finance': 'bg-pink-500',
  'ICT': 'bg-cyan-600',
  'Maternity': 'bg-rose-500',
  'LAB': 'bg-amber-600',
  'Super Admin': 'bg-purple-600',
  'Procurement': 'bg-orange-600',
  'Human Resources': 'bg-teal-600'
}

onMounted(() => {
  const q = query(collection(db, 'departments'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    departments.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, colorClass: colorMap[data.name] || 'bg-primary' }
    })
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
