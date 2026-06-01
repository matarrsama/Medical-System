<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">confirmation_number</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">{{ editing ? 'Edit Ticket' : 'Ticket Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">{{ ticket.ticketId || ticket.id }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <template v-if="editing">
            <input v-model="editForm.title" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-headline-sm font-headline-md bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <h2 class="text-headline-sm font-headline-md text-on-surface">{{ ticket.title }}</h2>
          </template>
          <div class="flex items-center gap-3 mt-2">
            <span :class="priorityClass(editing ? editForm.priority : ticket.priority)" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full" :class="priorityDot(editing ? editForm.priority : ticket.priority)"></span>
              {{ editing ? editForm.priority : ticket.priority }}
            </span>
            <span :class="statusClass(editing ? editForm.status : ticket.status)" class="px-2.5 py-0.5 rounded text-label-sm font-label-sm">{{ editing ? editForm.status : ticket.status }}</span>
          </div>
        </div>
      </div>

      <div v-if="!editing && authStore.canViewAllTickets" class="flex items-center gap-2">
        <span class="text-label-sm text-outline font-medium mr-1">Status:</span>
        <button v-for="s in ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']" :key="s" @click="updateStatus(s)" :class="[s === ticket.status ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-higher text-on-surface-variant', 'px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all']">{{ s }}</button>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low">
        <div>
          <span class="text-label-sm text-outline font-medium">Ticket ID</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5 font-mono">{{ ticket.ticketId || ticket.id }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Category</span>
          <template v-if="editing">
            <select v-model="editForm.category" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Network</option><option>Hardware</option><option>Software</option><option>Access</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ ticket.category || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Department</span>
          <template v-if="editing">
            <select v-model="editForm.department" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ ticket.department || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Priority</span>
          <template v-if="editing">
            <select v-model="editForm.priority" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ ticket.priority || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Status</span>
          <template v-if="editing">
            <select v-model="editForm.status" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Open</option><option>Assigned</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ ticket.status || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Assignee</span>
          <template v-if="editing">
            <select v-model="editForm.assignee" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option value="">— Unassigned —</option>
              <option v-for="u in usersStore.items" :key="u.id" :value="u.name || u.email || u.id">{{ u.name || u.email || u.id }}</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ ticket.assignee || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created by</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ ticket.createdByName || ticket.createdBy || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ formatDate(ticket.created) }}</p>
        </div>
      </div>

      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant mb-2">Description</h4>
        <template v-if="editing">
          <textarea v-model="editForm.description" rows="4" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
        </template>
        <template v-else>
          <p class="text-body-md text-on-surface bg-surface-container-low rounded-xl p-4 whitespace-pre-wrap">{{ ticket.description || 'No description provided.' }}</p>
        </template>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <template v-if="editing">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
          Cancel
        </button>
        <button @click="save" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </template>
      <template v-else>
        <button @click="deleteTicket" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit Ticket
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useDepartmentsStore } from '@/stores/departments'
import { useUsersStore } from '@/stores/users'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'

const ui = useUIStore()
const authStore = useAuthStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const modalData = computed(() => ui.modalData || {})
const ticketData = ref(modalData.value.ticket || modalData.value)
const ticket = computed(() => ticketData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
const deptStore = useDepartmentsStore()
const usersStore = useUsersStore()
let unsubTicket = null

const editForm = reactive({
  title: '', priority: '', status: '', category: '', department: '', assignee: '', description: ''
})

function startEdit() {
  Object.assign(editForm, {
    title: ticket.value.title || '',
    priority: ticket.value.priority || 'Medium',
    status: ticket.value.status || 'Open',
    category: ticket.value.category || 'Network',
    department: ticket.value.department || '',
    assignee: ticket.value.assignee || '',
    description: ticket.value.description || ''
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!editForm.title.trim()) return
  saving.value = true
  const status = editForm.assignee ? 'Assigned' : editForm.status
  try {
    await updateDoc(doc(db, 'tickets', ticket.value.id), {
      title: editForm.title,
      priority: editForm.priority,
      status,
      category: editForm.category,
      department: editForm.department,
      assignee: editForm.assignee,
      description: editForm.description
    })
    await logActivity({ action: 'Update', resource: `Ticket ${ticket.value.ticketId || ticket.value.id}`, details: `Updated "${editForm.title}" (${editForm.status})` })
    toast.success(`Ticket ${ticket.value.ticketId || ticket.value.id} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[TicketDetailModal] error updating ticket:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to edit tickets.' : 'Failed to update ticket.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const ticketId = ticketData.value?.id
  if (ticketId) {
    unsubTicket = onSnapshot(doc(db, 'tickets', ticketId), (snap) => {
      if (snap.exists()) {
        ticketData.value = { id: snap.id, ticketId: snap.data().ticketId || snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsubTicket) unsubTicket()
})

async function updateStatus(status) {
  if (status === ticket.value.status) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'tickets', ticket.value.id), { status })
    await logActivity({ action: 'Update', resource: `Ticket ${ticket.value.ticketId || ticket.value.id}`, details: `Status changed to ${status}` })
    toast.success(`Status updated to ${status}`)
  } catch (err) {
    console.error('[TicketDetailModal] error updating status:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to update tickets.' : 'Failed to update status.')
  } finally {
    saving.value = false
  }
}

function deleteTicket() {
  ui.closeModal()
  const ticket = ticketData.value
  ui.openModal('DeleteConfirm', ticket)
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleString()
  return String(v)
}

function priorityClass(p) {
  const map = { critical: 'bg-error-container/40 text-on-error-container', high: 'bg-tertiary-container/20 text-tertiary', medium: 'bg-surface-container-highest text-on-surface-variant', low: 'bg-surface-container text-on-surface-variant' }
  return map[p?.toLowerCase()] || ''
}
function priorityDot(p) {
  const map = { critical: 'bg-error', high: 'bg-tertiary', medium: 'bg-primary', low: 'bg-outline' }
  return map[p?.toLowerCase()] || ''
}
function statusClass(s) {
  const map = { 'Open': 'bg-surface-container-highest text-on-surface-variant', 'In Progress': 'bg-primary-container/40 text-on-primary-container', 'Assigned': 'bg-surface-container-highest text-on-surface-variant', 'Resolved': 'bg-green-100 text-green-800', 'Closed': 'bg-outline/20 text-on-surface-variant' }
  return map[s] || ''
}
</script>
