<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">description</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">{{ editing ? 'Edit Request' : 'Request Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">{{ request.requestId || request.id }}</p>
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
            <h2 class="text-headline-sm font-headline-md text-on-surface">{{ request.title }}</h2>
          </template>
          <div class="flex items-center gap-3 mt-2">
            <span :class="priorityClass(editing ? editForm.priority : request.priority)" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full" :class="priorityDot(editing ? editForm.priority : request.priority)"></span>
              {{ editing ? editForm.priority : request.priority }}
            </span>
            <span :class="statusClass(editing ? editForm.status : request.status)" class="px-2.5 py-0.5 rounded text-label-sm font-label-sm">{{ editing ? editForm.status : request.status }}</span>
          </div>
        </div>
      </div>

      <div v-if="!editing && authStore.role === 'Hospital Admin'" class="flex items-center gap-2">
        <span class="text-label-sm text-outline font-medium mr-1">Status:</span>
        <button v-for="s in ['Pending', 'Approved', 'Rejected']" :key="s" @click="updateStatus(s)" :class="[s === request.status ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-higher text-on-surface-variant', 'px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all']">{{ s }}</button>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low">
        <div>
          <span class="text-label-sm text-outline font-medium">Request ID</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5 font-mono">{{ request.requestId || request.id }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Type</span>
          <template v-if="editing">
            <select v-model="editForm.type" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Equipment</option><option>Access</option><option>License</option><option>Service</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ request.type || '—' }}</p>
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
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ request.department || '—' }}</p>
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
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ request.priority || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Status</span>
          <template v-if="editing">
            <select v-model="editForm.status" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Pending</option><option>Approved</option><option>Rejected</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ request.status || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Location</span>
          <template v-if="editing">
            <input v-model="editForm.location" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ request.location || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Requested by</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ request.createdByName || request.createdBy || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ formatDate(request.created) }}</p>
        </div>
      </div>

      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant mb-2">Description</h4>
        <template v-if="editing">
          <textarea v-model="editForm.description" rows="4" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
        </template>
        <template v-else>
          <p class="text-body-md text-on-surface bg-surface-container-low rounded-xl p-4 whitespace-pre-wrap">{{ request.description || 'No description provided.' }}</p>
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
        <button @click="deleteRequest" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit Request
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
import { useAuditLog } from '@/composables/useAuditLog'
import { db } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'

const ui = useUIStore()
const authStore = useAuthStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const modalData = computed(() => ui.modalData || {})
const requestData = ref(modalData.value.request || modalData.value)
const request = computed(() => requestData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
const deptStore = useDepartmentsStore()
let unsubRequest = null

const editForm = reactive({
  title: '', type: '', priority: '', status: '', department: '', location: '', description: ''
})

function startEdit() {
  Object.assign(editForm, {
    title: request.value.title || '',
    type: request.value.type || 'Equipment',
    priority: request.value.priority || 'Medium',
    status: request.value.status || 'Pending',
    department: request.value.department || '',
    location: request.value.location || '',
    description: request.value.description || ''
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!editForm.title.trim()) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'requests', request.value.id), {
      title: editForm.title,
      type: editForm.type,
      priority: editForm.priority,
      status: editForm.status,
      department: editForm.department,
      location: editForm.location || null,
      description: editForm.description
    })
    await logActivity({ action: 'Update', resource: `Request ${request.value.requestId || request.value.id}`, details: `Updated "${editForm.title}" (${editForm.status})` })
    await logActivity({ action: 'Update', resource: `Request ${request.value.requestId || request.value.id}`, details: `Updated "${editForm.title}" (${editForm.status})` })
    toast.success(`Request ${request.value.requestId || request.value.id} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[RequestDetailModal] error updating request:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to edit requests.' : 'Failed to update request.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const reqId = requestData.value?.id
  if (reqId) {
    unsubRequest = onSnapshot(doc(db, 'requests', reqId), (snap) => {
      if (snap.exists()) {
        requestData.value = { id: snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsubRequest) unsubRequest()
})

async function updateStatus(status) {
  if (status === request.value.status) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'requests', request.value.id), { status })
    await logActivity({ action: 'Update', resource: `Request ${request.value.requestId || request.value.id}`, details: `Status changed to ${status}` })
    toast.success(`Status updated to ${status}`)
  } catch (err) {
    console.error('[RequestDetailModal] error updating status:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to update requests.' : 'Failed to update status.')
  } finally {
    saving.value = false
  }
}

function deleteRequest() {
  ui.closeModal()
  const req = requestData.value
  ui.openModal('DeleteConfirm', req)
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
  const map = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-green-100 text-green-800', Rejected: 'bg-error-container/40 text-on-error-container', Open: 'bg-surface-container-highest text-on-surface-variant' }
  return map[s] || ''
}
</script>
