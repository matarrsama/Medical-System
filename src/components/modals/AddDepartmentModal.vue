<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">domain</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Add Department</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">Register a new hospital department</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <div>
        <label class="text-label-md font-label-md text-on-surface">Department Name <span class="text-error">*</span></label>
        <input v-model="form.name" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Department Head</label>
          <input v-model="form.head" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Location</label>
          <input v-model="form.location" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
      </div>
    </form>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
        Cancel
      </button>
      <button @click="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">add</span>
        Add Department
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { logActivity } = useAuditLog()

const form = reactive({ name: '', head: '', location: '' })
const saving = ref(false)

async function submit() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'departments'), {
      name: form.name,
      head: form.head || null,
      location: form.location || null,
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Department ${form.name}`, details: `Head: ${form.head || '—'}, Location: ${form.location || '—'}` })
    toast.success('Department added successfully!')
    emit('close')
  } catch (err) {
    console.error('[AddDepartmentModal] error adding department:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to add departments.' : 'Failed to add department.')
  } finally {
    saving.value = false
  }
}
</script>
