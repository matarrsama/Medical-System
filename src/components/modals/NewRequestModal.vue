<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">description</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Create New Request</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">Submit an equipment, access, or service request</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex flex-col flex-1 min-h-0">
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <div class="flex items-center gap-3">
          <label class="text-label-md font-label-md text-on-surface-variant">Request ID</label>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-label-sm font-label-sm font-mono">
            <span class="material-symbols-outlined text-[14px]">tag</span>
            {{ requestId }}
          </span>
        </div>

        <div>
          <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Title <span class="text-error">*</span></label>
          <input v-model="form.title" placeholder="e.g. ICU Monitor Calibration" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Type <span class="text-error">*</span></label>
            <select v-model="form.type" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required>
              <option>Equipment</option><option>Access</option><option>License</option><option>Service</option>
            </select>
          </div>
          <div>
            <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Priority <span class="text-error">*</span></label>
            <select v-model="form.priority" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required>
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Department <span class="text-error">*</span></label>
            <select v-model="form.department" :disabled="departmentLocked" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed" required>
              <option disabled value="">Select Department</option>
              <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Location <span class="text-on-surface-variant text-label-sm">(optional)</span></label>
            <input v-model="form.location" placeholder="e.g. Ward 3B, Room 12" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" />
          </div>
        </div>

        <div>
          <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Description</label>
          <textarea v-model="form.description" rows="4" placeholder="Describe what is needed and any relevant details..." class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"></textarea>
        </div>

        <div class="flex items-center gap-6 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
          <div class="flex items-center gap-2">
            <span class="text-label-sm font-label-sm text-on-surface-variant">Status</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Pending
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-label-sm font-label-sm text-on-surface-variant">Requested by</span>
            <span class="text-label-sm font-label-sm text-on-surface">{{ auth.currentUser?.displayName || auth.currentUser?.email || '—' }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
        <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
          Cancel
        </button>
        <button type="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">send</span>
          {{ saving ? 'Submitting...' : 'Submit Request' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { generateId } from '@/utils/generateId'
import { useAuditLog } from '@/composables/useAuditLog'
import { useDepartmentsStore } from '@/stores/departments'
import { useAuthStore } from '@/stores/auth'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { logActivity } = useAuditLog()
const deptStore = useDepartmentsStore()
const authStore = useAuthStore()
const saving = ref(false)

const requestId = ref('')

const departmentLocked = computed(() =>
  !!authStore.departmentHeadOf && !authStore.canManageUsers
)

const form = reactive({
  title: '', type: 'Equipment', priority: 'Medium', department: '', location: '', description: ''
})

async function submit() {
  if (!form.title.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'requests'), {
      requestId: requestId.value,
      title: form.title,
      type: form.type,
      priority: form.priority,
      department: form.department,
      location: form.location || null,
      description: form.description,
      status: 'Pending',
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Request ${requestId.value}`, details: `"${form.title}" (${form.type}, ${form.priority} priority)` })
    toast.success(`Request ${requestId.value} submitted successfully!`)
    emit('close')
  } catch (err) {
    console.error('[NewRequestModal] error creating request:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to submit requests.' : 'Failed to submit request.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const year = new Date().getFullYear()
  requestId.value = generateId(`REQ-${year}-`, 6)
  if (departmentLocked.value) {
    form.department = authStore.departmentHeadOf
  } else if (!form.department) {
    form.department = deptStore.items[0]?.name || ''
  }
})


</script>
