<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">domain</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">{{ editing ? 'Edit Department' : 'Department Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ dept.name }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div v-if="!editing" class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center" :class="colorClass">
          <span class="material-symbols-outlined text-on-primary text-[28px]">domain</span>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">{{ dept.name }}</h2>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ dept.deptId || dept.id }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
          <span class="text-label-sm text-outline font-medium">Total Staff</span>
          <p class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mt-1">{{ totalStaff }}</p>
        </div>
        <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
          <span class="text-label-sm text-outline font-medium">Active</span>
          <p class="text-headline-sm font-headline-md text-green-600 dark:text-green-400 mt-1">{{ activeStaffCount }}</p>
        </div>
        <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
          <span class="text-label-sm text-outline font-medium">On Leave</span>
          <p class="text-headline-sm font-headline-md text-amber-600 dark:text-amber-400 mt-1">{{ onLeaveStaffCount }}</p>
        </div>
        <div v-if="isCriticallyLow" class="p-4 rounded-xl bg-error-container/20 dark:bg-error/10 border border-error/30">
          <span class="text-label-sm text-error font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">warning</span>
            Critical
          </span>
          <p class="text-headline-sm font-headline-md text-error mt-1">{{ activeStaffCount }}</p>
          <p class="text-label-sm text-error mt-0.5">Critically low</p>
        </div>
        <div v-else class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
          <span class="text-label-sm text-outline font-medium">Availability</span>
          <p class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mt-1">{{ availabilityPercent }}%</p>
        </div>
      </div>

      <div v-if="isCriticallyLow" class="px-4 py-3 rounded-lg bg-error-container/20 dark:bg-error/10 border border-error/30 flex items-center gap-3">
        <span class="material-symbols-outlined text-error text-[20px]">warning</span>
        <div>
          <p class="text-label-sm font-label-sm text-error font-medium">Staffing Alert</p>
          <p class="text-body-sm text-on-surface dark:text-inverse-on-surface">Only {{ activeStaffCount }} of {{ totalStaff }} staff are currently active. {{ onLeaveStaffCount }} staff member(s) are on leave.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
        <div>
          <span class="text-label-sm text-outline font-medium">Department Head</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ dept.headName || dept.head || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Location</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ dept.location || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(dept.created) }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created by</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ dept.createdByName || dept.createdBy || '—' }}</p>
        </div>
      </div>

      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-3">Staff Members ({{ totalStaff }})</h4>
        <div class="overflow-x-auto border border-outline-variant dark:border-outline rounded-xl">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-surface-container-low dark:bg-inverse-surface text-on-surface-variant dark:text-outline text-label-sm font-label-sm uppercase tracking-wider">
                <th class="p-3 pl-4 border-b border-outline-variant dark:border-outline font-medium">Name</th>
                <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Role</th>
                <th class="p-3 border-b border-outline-variant dark:border-outline font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface">
              <tr v-for="staff in departmentStaff" :key="staff.uid || staff.id" class="hover:bg-surface-container-lowest dark:hover:bg-inverse-surface transition-colors border-b border-outline-variant/30 dark:border-outline/30 last:border-0">
                <td class="p-3 pl-4 font-medium">{{ staff.name || staff.displayName || '—' }}</td>
                <td class="p-3 text-on-surface-variant dark:text-outline">{{ staff.role || '—' }}</td>
                <td class="p-3">
                  <span v-if="isOnLeave(staff)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    On Leave
                  </span>
                  <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="departmentStaff.length === 0" class="text-body-sm text-on-surface-variant dark:text-outline text-center py-8">No staff members in this department.</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center" :class="colorClass">
          <span class="material-symbols-outlined text-on-primary text-[28px]">domain</span>
        </div>
        <div class="min-w-0 flex-1">
          <input v-model="editForm.name" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-headline-sm font-headline-md bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ dept.deptId || dept.id }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
        <div>
          <span class="text-label-sm text-outline font-medium">Department Head</span>
          <select v-model="editForm.headId" @change="onHeadChange" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
            <option value="">— None —</option>
            <option v-for="u in usersStore.items" :key="u.uid || u.id" :value="u.uid || u.id">{{ u.name || u.email || u.id }}</option>
          </select>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Location</span>
          <input v-model="editForm.location" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
        </div>
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
        <button @click="deleteDept" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
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
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { useAuditLog } from '@/composables/useAuditLog'
import { useUsersStore } from '@/stores/users'
import { setDeptHead } from '@/services/api'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, collection, onSnapshot } from 'firebase/firestore'
import { getDeptColor } from '@/stores/departments'

const ui = useUIStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const usersStore = useUsersStore()
const modalData = computed(() => ui.modalData || {})
const deptData = ref(modalData.value.department || modalData.value)
const dept = computed(() => deptData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
let unsub = null
let unsubUsers = null
let unsubLeaveReqs = null

const colorClass = computed(() => getDeptColor(dept.value.name))

const editForm = reactive({
  name: '', headId: '', headName: '', location: ''
})

const allUsers = ref([])
const allLeaveRequests = ref([])

const departmentStaff = computed(() =>
  allUsers.value.filter(u => u.department === dept.value.name)
)

const activeApprovedLeaves = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allLeaveRequests.value.filter(l => {
    if (l.status !== 'Approved') return false
    const start = l.startDate ? (typeof l.startDate === 'string' ? l.startDate : (l.startDate?.toDate ? l.startDate.toDate().toISOString().split('T')[0] : '')) : ''
    const end = l.endDate ? (typeof l.endDate === 'string' ? l.endDate : (l.endDate?.toDate ? l.endDate.toDate().toISOString().split('T')[0] : '')) : ''
    if (!start || !end) return false
    return today >= start && today <= end
  })
})

function isOnLeave(staff) {
  const uid = staff.uid || staff.id
  return activeApprovedLeaves.value.some(l => l.createdBy === uid)
}

const totalStaff = computed(() => departmentStaff.value.length)
const onLeaveStaffCount = computed(() => departmentStaff.value.filter(s => isOnLeave(s)).length)
const activeStaffCount = computed(() => totalStaff.value - onLeaveStaffCount.value)

const isCriticallyLow = computed(() => {
  if (totalStaff.value === 0) return false
  return activeStaffCount.value / totalStaff.value < 0.3 || activeStaffCount.value < 2
})

const availabilityPercent = computed(() => {
  if (totalStaff.value === 0) return 0
  return Math.round(activeStaffCount.value / totalStaff.value * 100)
})

function startEdit() {
  Object.assign(editForm, {
    name: dept.value.name || '',
    headId: dept.value.headId || '',
    headName: dept.value.headName || '',
    location: dept.value.location || ''
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function onHeadChange() {
  const user = usersStore.items.find(u => (u.uid || u.id) === editForm.headId)
  editForm.headName = user ? (user.name || user.email || '') : ''
}

async function save() {
  if (!editForm.name.trim()) return
  saving.value = true
  try {
    const oldHeadId = dept.value.headId
    const newHeadId = editForm.headId

    await updateDoc(doc(db, 'departments', dept.value.id), {
      name: editForm.name,
      headId: newHeadId || null,
      headName: editForm.headName || null,
      head: editForm.headName || null,
      location: editForm.location
    })

    if (oldHeadId && oldHeadId !== newHeadId) {
      await setDeptHead(oldHeadId, null).catch(() => {})
    }
    if (newHeadId && newHeadId !== oldHeadId) {
      await setDeptHead(newHeadId, editForm.name).catch(() => {})
    }

    await logActivity({ action: 'Update', resource: `Department ${editForm.name}`, details: `Updated department info` })
    toast.success(`Department ${editForm.name} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[DepartmentDetailModal] error updating department:', err)
    toast.error(mapFirebaseError(err, 'Failed to update department.'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const id = deptData.value?.id
  if (id) {
    unsub = onSnapshot(doc(db, 'departments', id), (snap) => {
      if (snap.exists()) {
        deptData.value = { id: snap.id, deptId: snap.id, ...snap.data(), colorClass: getDeptColor(snap.data().name) }
      }
    })
  }
  unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
    allUsers.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, () => {})
  unsubLeaveReqs = onSnapshot(collection(db, 'leaveRequests'), (snap) => {
    allLeaveRequests.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, () => {})
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsub) unsub()
  if (unsubUsers) unsubUsers()
  if (unsubLeaveReqs) unsubLeaveReqs()
})

function deleteDept() {
  ui.closeModal()
  ui.openModal('DeleteConfirm', deptData.value)
}

function formatDate(v) {
  if (!v) return ''
  let d
  if (v?.toDate) {
    d = v.toDate()
  } else if (typeof v === 'string') {
    d = new Date(v)
  } else {
    return String(v)
  }
  if (isNaN(d.getTime())) return String(v)
  if (typeof v === 'string' && v.includes('T')) {
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString()
}
</script>
