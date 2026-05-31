<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">confirmation_number</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Create New Ticket</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">Fill in the details below to log a new service ticket</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      <div class="flex items-center gap-3">
        <label class="text-label-md font-label-md text-on-surface-variant">Ticket ID</label>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-label-sm font-label-sm font-mono">
          <span class="material-symbols-outlined text-[14px]">tag</span>
          {{ ticketId }}
        </span>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Title <span class="text-error">*</span></label>
        <input v-model="form.title" placeholder="e.g. PACS Server Offline" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Priority</label>
          <select v-model="form.priority" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors">
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Category</label>
          <select v-model="form.category" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors">
            <option>Network</option><option>Hardware</option><option>Software</option><option>Access</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Department</label>
          <select v-model="form.department" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors">
            <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Assign to <span class="text-on-surface-variant text-label-sm">(optional)</span></label>
          <select v-model="form.assignee" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors">
            <option value="">— Unassigned —</option>
            <option v-for="u in usersStore.items" :key="u.id" :value="u.name || u.email || u.id">{{ u.name || u.email || u.id }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface mb-1.5 block">Description</label>
        <textarea v-model="form.description" rows="4" placeholder="Describe the issue in detail..." class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"></textarea>
      </div>

      <div class="flex items-center gap-6 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
        <div class="flex items-center gap-2">
          <span class="text-label-sm font-label-sm text-on-surface-variant">Status</span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-label-sm font-label-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-outline"></span>
            Open
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-label-sm font-label-sm text-on-surface-variant">Created by</span>
          <span class="text-label-sm font-label-sm text-on-surface">{{ auth.currentUser?.displayName || auth.currentUser?.email || '—' }}</span>
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
        Create Ticket
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useCounter } from '@/composables/useCounter'
import { useAuditLog } from '@/composables/useAuditLog'
import { useDepartmentsStore } from '@/stores/departments'
import { useUsersStore } from '@/stores/users'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { nextVal } = useCounter()
const { logActivity } = useAuditLog()
const saving = ref(false)
const deptStore = useDepartmentsStore()
const usersStore = useUsersStore()

const ticketId = ref('')

const form = reactive({
  title: '', priority: 'Medium', category: 'Network', description: '', department: 'ER', assignee: ''
})

async function submit() {
  if (!form.title.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'tickets'), {
      ticketId: ticketId.value,
      title: form.title,
      priority: form.priority,
      category: form.category,
      description: form.description,
      department: form.department,
      assignee: form.assignee,
      status: 'Open',
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Ticket ${ticketId.value}`, details: `"${form.title}" (${form.priority} priority, ${form.category})` })
    toast.success(`Ticket ${ticketId.value} created successfully!`)
    emit('close')
  } catch (err) {
    console.error('[NewTicketModal] error creating ticket:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to create tickets.' : 'Failed to create ticket.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    ticketId.value = await nextVal('ticketId', { prefix: 'INC-', pad: 4, starting: 9043 })
  } catch (err) {
    console.warn('[NewTicketModal] counter unavailable, using client-side ID:', err)
    ticketId.value = `INC-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
  }
})
</script>
