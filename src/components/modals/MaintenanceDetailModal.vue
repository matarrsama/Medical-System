<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">build</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">{{ editing ? 'Edit Maintenance' : 'Maintenance Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ task.maintenanceId || task.id }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div v-if="!editing && canUpdateStatus" class="flex items-center gap-2 mb-2">
        <span class="text-label-sm text-outline font-medium mr-1">Status:</span>
        <button v-for="s in ['Scheduled', 'In Progress', 'Completed']" :key="s" @click="updateStatus(s)" :class="[s === task.status ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-higher text-on-surface-variant dark:text-outline', 'px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all']">{{ s }}</button>
      </div>
      <div class="flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <template v-if="editing">
            <input v-model="editForm.equipment" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-headline-sm font-headline-md bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <h2 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">{{ task.equipment }}</h2>
          </template>
          <div class="flex items-center gap-3 mt-2">
            <span :class="typeClass(editing ? editForm.type : task.type)" class="px-2.5 py-0.5 rounded text-label-sm font-label-sm">{{ editing ? editForm.type : task.type }}</span>
            <span :class="statusClass(editing ? editForm.status : task.status)" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(editing ? editForm.status : task.status)"></span>
              {{ editing ? editForm.status : task.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
        <div>
          <span class="text-label-sm text-outline font-medium">Maintenance ID</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5 font-mono">{{ task.maintenanceId || task.id }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Type</span>
          <template v-if="editing">
            <select v-model="editForm.type" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option>Preventive</option><option>Corrective</option><option>Inspection</option><option>Calibration</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ task.type || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Equipment</span>
          <template v-if="editing">
            <input v-model="editForm.equipment" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ task.equipment || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Department</span>
          <template v-if="editing">
            <select v-model="editForm.department" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ task.department || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Status</span>
          <template v-if="editing">
            <select v-model="editForm.status" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option>Scheduled</option><option>In Progress</option><option>Completed</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ task.status || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Location</span>
          <template v-if="editing">
            <input v-model="editForm.location" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ task.location || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Scheduled Date</span>
          <template v-if="editing">
            <input v-model="editForm.scheduledDate" type="date" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ task.scheduledDate || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created by</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ task.createdByName || task.createdBy || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(task.created) }}</p>
        </div>
      </div>

      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-2">Description</h4>
        <template v-if="editing">
          <textarea v-model="editForm.description" rows="4" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
        </template>
        <template v-else>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface bg-surface-container-low dark:bg-inverse-surface rounded-xl p-4 whitespace-pre-wrap">{{ task.description || 'No description provided.' }}</p>
        </template>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
      <template v-if="editing">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
          Cancel
        </button>
        <button @click="save" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </template>
      <template v-else>
        <button v-if="authStore.canDeleteMaintenance" @click="deleteTask" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button v-if="authStore.canEditMaintenance" @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit
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
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { useDepartmentsStore } from '@/stores/departments'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'

const ui = useUIStore()
const authStore = useAuthStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const modalData = computed(() => ui.modalData || {})
const taskData = ref(modalData.value.task || modalData.value)
const task = computed(() => taskData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
const deptStore = useDepartmentsStore()
let unsubTask = null

const canManage = computed(() => authStore.canDeleteMaintenance || authStore.canEditMaintenance)
const canUpdateStatus = computed(() => authStore.canUpdateMaintenanceStatus || !!authStore.departmentHeadOf)

const editForm = reactive({
  equipment: '', type: '', status: '', department: '', location: '', scheduledDate: '', description: ''
})

function startEdit() {
  Object.assign(editForm, {
    equipment: task.value.equipment || '',
    type: task.value.type || 'Preventive',
    status: task.value.status || 'Scheduled',
    department: task.value.department || '',
    location: task.value.location || '',
    scheduledDate: task.value.scheduledDate || '',
    description: task.value.description || ''
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!editForm.equipment.trim()) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'maintenanceTasks', task.value.id), {
      equipment: editForm.equipment,
      type: editForm.type,
      status: editForm.status,
      department: editForm.department,
      location: editForm.location,
      scheduledDate: editForm.scheduledDate,
      description: editForm.description
    })
        await logActivity({ action: 'Update', resource: `Maintenance ${task.value.maintenanceId || task.value.id}`, details: `Updated for ${editForm.equipment}` })
    toast.success(`Maintenance ${task.value.maintenanceId || task.value.id} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[MaintenanceDetailModal] error updating task:', err)
    toast.error(mapFirebaseError(err, 'Failed to update maintenance task.'))
  } finally {
    saving.value = false
  }
}

async function updateStatus(status) {
  saving.value = true
  try {
    await updateDoc(doc(db, 'maintenanceTasks', task.value.id), { status })
    await logActivity({ action: 'Update', resource: `Maintenance ${task.value.maintenanceId || task.value.id}`, details: `Status changed to ${status}` })
    toast.success(`Maintenance status updated to ${status}!`)
  } catch (err) {
    console.error('[MaintenanceDetailModal] error updating status:', err)
    toast.error('Failed to update maintenance status.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const taskId = taskData.value?.id
  if (taskId) {
    unsubTask = onSnapshot(doc(db, 'maintenanceTasks', taskId), (snap) => {
      if (snap.exists()) {
        taskData.value = { id: snap.id, maintenanceId: snap.data().maintenanceId || snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsubTask) unsubTask()
})

function deleteTask() {
  ui.closeModal()
  ui.openModal('DeleteConfirm', taskData.value)
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleString()
  return String(v)
}

function typeClass(t) {
  const map = { Preventive: 'bg-surface-container-highest text-on-surface-variant dark:text-outline', Corrective: 'bg-tertiary-container/20 text-tertiary', Inspection: 'bg-primary-container/30 text-primary dark:bg-primary-container/40 dark:text-inverse-primary', Calibration: 'bg-surface-container text-on-surface-variant dark:text-outline' }
  return map[t] || ''
}

function statusClass(s) {
  const map = { Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', 'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Scheduled: 'bg-blue-600', 'In Progress': 'bg-amber-500', Completed: 'bg-green-600' }
  return map[s] || ''
}
</script>
