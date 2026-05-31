<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">summarize</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">New Report</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">ID: {{ reportId || 'Generating…' }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <div>
        <label class="text-label-md font-label-md text-on-surface">Report Title <span class="text-error">*</span></label>
        <input v-model="form.title" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required />
      </div>
      <div>
        <label class="text-label-md font-label-md text-on-surface">Description</label>
        <textarea v-model="form.description" rows="3" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Report Type</label>
          <select v-model="form.type" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
            <option>Tickets</option>
            <option>Inventory</option>
            <option>Maintenance</option>
            <option>Equipment</option>
            <option>Procurement</option>
            <option>Custom</option>
          </select>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Status</label>
          <select v-model="form.status" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
            <option>Active</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
        </div>
      </div>
      <div>
        <label class="text-label-md font-label-md text-on-surface">Icon</label>
        <select v-model="form.icon" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
          <option value="bar_chart">Bar Chart</option>
          <option value="pie_chart">Pie Chart</option>
          <option value="show_chart">Line Chart</option>
          <option value="table_chart">Table</option>
          <option value="summarize">Summary</option>
          <option value="assessment">Assessment</option>
          <option value="dashboard">Dashboard</option>
          <option value="analytics">Analytics</option>
        </select>
      </div>
    </form>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
        Cancel
      </button>
      <button @click="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">add</span>
        Add Report
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useCounter } from '@/composables/useCounter'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { nextVal } = useCounter()
const { logActivity } = useAuditLog()
const saving = ref(false)
const reportId = ref('')

const form = reactive({
  title: '', description: '', type: 'Tickets', status: 'Active', icon: 'summarize'
})

onMounted(async () => {
  try {
    const year = new Date().getFullYear()
    reportId.value = await nextVal(`reportId_${year}`, { prefix: `RPT-${year}-`, pad: 3, starting: 1 })
  } catch (err) {
    console.warn('[AddReportModal] counter unavailable, using client-side ID:', err)
    reportId.value = `RPT-${new Date().getFullYear()}-${Date.now().toString(36).slice(-3).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
  }
})

async function submit() {
  if (!form.title.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'reports'), {
      reportId: reportId.value,
      title: form.title,
      description: form.description || null,
      type: form.type,
      status: form.status,
      icon: form.icon,
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp(),
      updated: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Report ${reportId.value}`, details: `Created "${form.title}"` })
    toast.success(`Report ${reportId.value} created successfully!`)
    emit('close')
  } catch (err) {
    console.error('[AddReportModal] error creating report:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to create reports.' : 'Failed to create report.')
  } finally {
    saving.value = false
  }
}
</script>
