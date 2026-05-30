<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Reports &amp; Analytics</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Generate and view system reports and analytics.</p>
      </div>
      <button class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">download</span>
        Export
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
      <div v-for="report in reports" :key="report.title" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">{{ report.icon }}</span>
          </div>
          <div>
            <h3 class="text-body-md font-bold text-on-surface">{{ report.title }}</h3>
            <p class="text-label-sm text-on-surface-variant">{{ report.description }}</p>
          </div>
        </div>
        <div class="text-label-sm text-on-surface-variant mt-2">Updated {{ report.updated }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()
const reports = ref([])
let unsubscribe = null

onMounted(() => {
  const q = query(collection(db, 'reports'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    reports.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
