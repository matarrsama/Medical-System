<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary dark:text-inverse-primary text-[22px]">confirmation_number</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">Create New Ticket</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">Fill in the details below to log a new service ticket</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      <div class="flex items-center gap-3">
        <label class="text-label-md font-label-md text-on-surface-variant dark:text-outline">Ticket ID</label>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary text-label-sm font-label-sm font-mono">
          <span class="material-symbols-outlined text-[14px]">tag</span>
          {{ ticketId }}
        </span>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Title <span class="text-error">*</span></label>
        <input v-model="form.title" placeholder="e.g. PACS Server Offline" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Priority <span class="text-error">*</span></label>
          <select v-model="form.priority" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required>
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Category <span class="text-error">*</span></label>
          <select v-model="form.category" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required>
            <option>Network</option><option>Hardware</option><option>Software</option><option>Access</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Department <span class="text-error">*</span></label>
          <select v-if="canChooseDepartment" v-model="form.department" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required>
            <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
          </select>
          <div v-else class="flex items-center gap-2 px-3 py-2.5 border border-outline-variant/50 dark:border-outline rounded-lg bg-surface-container dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface font-medium">
            <span class="material-symbols-outlined text-[16px] text-outline">business</span>
            {{ form.department }}
          </div>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Assign to <span class="text-on-surface-variant dark:text-outline text-label-sm">(optional)</span></label>
          <select v-model="form.assignee" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors">
            <option value="">— Unassigned —</option>
            <option v-for="u in usersStore.items" :key="u.id" :value="u.name || u.email || u.id">{{ u.name || u.email || u.id }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Description</label>
        <textarea v-model="form.description" rows="4" placeholder="Describe the issue in detail..." class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"></textarea>
      </div>

      <div class="flex items-center gap-6 p-3 bg-surface-container-lowest dark:bg-inverse-surface rounded-lg border border-outline-variant/50 dark:border-outline">
        <div class="flex items-center gap-2">
          <span class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline">Status</span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest dark:bg-white/[0.08] text-on-surface-variant dark:text-outline text-label-sm font-label-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-outline"></span>
            Open
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline">Created by</span>
          <span class="text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface">{{ auth.currentUser?.displayName || auth.currentUser?.email || '—' }}</span>
        </div>
      </div>
    </form>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
      <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher dark:hover:bg-white/[0.08] transition-colors">
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
import { reactive, ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { generateId } from '@/utils/generateId'
import { useAuditLog } from '@/composables/useAuditLog'
import { useDepartmentsStore } from '@/stores/departments'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore'
import { sendTicketCreatedNotification } from '@/services/email'
import { notifyTicketCreated } from '@/services/notifications'

const emit = defineEmits(['close'])
const toast = useToast()
const authStore = useAuthStore()
const { logActivity } = useAuditLog()
const saving = ref(false)
const deptStore = useDepartmentsStore()
const usersStore = useUsersStore()

const canChooseDepartment = computed(() => authStore.canChooseDepartment)

const ticketId = ref('')

const form = reactive({
  title: '', priority: 'Medium', category: 'Network', description: '', department: '', assignee: ''
})

onMounted(async () => {
  ticketId.value = generateId('INC-', 8)
  if (!canChooseDepartment.value && authStore.user?.uid) {
    const userSnap = await getDoc(doc(db, 'users', authStore.user.uid))
    if (userSnap.exists()) {
      form.department = userSnap.data().department || ''
    }
  }
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
      status: form.assignee ? 'Assigned' : 'Open',
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Ticket ${ticketId.value}`, details: `"${form.title}" (${form.priority} priority, ${form.category})` })
    toast.success(`Ticket ${ticketId.value} created successfully!`)
    const assigneeUser = usersStore.items.find(u => u.email === form.assignee || (u.name || u.email || u.id) === form.assignee)
    sendTicketCreatedNotification({ ticketId: ticketId.value, title: form.title, priority: form.priority, category: form.category, status: form.assignee ? 'Assigned' : 'Open', assignee: form.assignee }, form.department, assigneeUser?.email)
    notifyTicketCreated({ ticketId: ticketId.value, title: form.title, priority: form.priority, category: form.category, status: form.assignee ? 'Assigned' : 'Open', assignee: form.assignee }, form.department, assigneeUser?.email)
    emit('close')
  } catch (err) {
    console.error('[NewTicketModal] error creating ticket:', err)
    toast.error(mapFirebaseError(err, 'Failed to create ticket.'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  ticketId.value = generateId('INC-', 8)
})
</script>
