<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary dark:text-inverse-primary text-[22px]">event</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">{{ editing ? 'Edit Leave Request' : 'Leave Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ leave.leaveId || leave.id }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3 mt-2">
            <span :class="statusClass(leave.status)" class="px-2.5 py-0.5 rounded text-label-sm font-label-sm">{{ editing ? editForm.status : leave.status }}</span>
          </div>
        </div>
      </div>

      <div v-if="!editing && (authStore.canApproveLeaves || authStore.canRejectLeaves)" class="flex items-center gap-2">
        <span class="text-label-sm text-outline font-medium mr-1">Status:</span>
        <button v-for="s in ['Pending', 'Approved', 'Rejected']" :key="s" @click="updateStatus(s)" :class="[s === leave.status ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-higher text-on-surface-variant dark:text-outline dark:hover:bg-white/[0.08]', 'px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all']">{{ s === 'Approved' ? 'Approve' : s === 'Rejected' ? 'Reject' : s }}</button>
      </div>
      <div v-if="showApprovalWarning" class="px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-3">
        <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">warning</span>
        <p class="flex-1 text-body-sm text-amber-800 dark:text-amber-200">{{ approvalWarningMessage }}</p>
        <button @click="confirmApproval" class="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-label-sm whitespace-nowrap">Approve Anyway</button>
        <button @click="showApprovalWarning = false" class="px-3 py-1.5 rounded-lg bg-surface-container dark:bg-white/[0.08] text-on-surface-variant dark:text-outline text-label-sm font-label-sm whitespace-nowrap">Cancel</button>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
        <div>
          <span class="text-label-sm text-outline font-medium">Leave ID</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5 font-mono">{{ leave.leaveId || leave.id }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Type</span>
          <template v-if="editing">
            <select v-model="editForm.type" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option>Annual</option><option>Sick</option><option>Personal</option><option>Other</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ leave.type || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Start Date</span>
          <template v-if="editing">
            <input v-model="editForm.startDate" type="date" @change="recalcDays" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(leave.startDate) }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">End Date</span>
          <template v-if="editing">
            <input v-model="editForm.endDate" type="date" @change="recalcDays" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(leave.endDate) }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Days Requested</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ editing ? editDays : (leave.daysRequested || '—') }}</p>
        </div>
        <div v-if="daysRemaining !== null">
          <span class="text-label-sm text-outline font-medium">Days Remaining</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5" :class="daysRemaining <= 3 ? 'text-error' : 'text-green-600 dark:text-green-400'">{{ daysRemaining }} day{{ daysRemaining === 1 ? '' : 's' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Department</span>
          <template v-if="editing">
            <select v-model="editForm.department" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ leave.department || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Status</span>
          <template v-if="editing">
            <select v-model="editForm.status" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option>Pending</option><option>Approved</option><option>Rejected</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ leave.status || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Requested by</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ leave.createdByName || leave.createdBy || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(leave.created) }}</p>
        </div>
        <div v-if="leave.approvedBy">
          <span class="text-label-sm text-outline font-medium">Approved by</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ leave.approvedBy }}</p>
        </div>
        <div v-if="leave.approvedAt">
          <span class="text-label-sm text-outline font-medium">Approved at</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(leave.approvedAt) }}</p>
        </div>
      </div>

      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-2">Reason</h4>
        <template v-if="editing">
          <textarea v-model="editForm.reason" rows="4" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
        </template>
        <template v-else>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface bg-surface-container-low dark:bg-white/[0.05] rounded-xl p-4 whitespace-pre-wrap">{{ leave.reason || 'No reason provided.' }}</p>
        </template>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
      <template v-if="editing">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher dark:hover:bg-white/[0.08] transition-colors">
          Cancel
        </button>
        <button @click="save" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </template>
      <template v-else>
        <button @click="deleteLeave" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 dark:hover:bg-error-container/10 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher dark:hover:bg-white/[0.08] transition-colors">
          Close
        </button>
        <button v-if="canEdit" @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit Leave
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
import { db } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore'
import { sendLeaveNotification } from '@/services/email'

const ui = useUIStore()
const authStore = useAuthStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const modalData = computed(() => ui.modalData || {})
const leaveRef = ref(modalData.value.leave || modalData.value)

async function getLeaveCreatorEmail() {
  const uid = leaveRef.value?.createdBy
  if (!uid) return null
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
    if (!snap.empty) return snap.docs[0].data().email
  } catch {}
  return null
}
const leave = computed(() => leaveRef.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
const deptStore = useDepartmentsStore()
let unsubLeave = null

const editForm = reactive({
  type: '', startDate: '', endDate: '', status: '', department: '', reason: ''
})

const editDays = ref(0)

const canEdit = computed(() => {
  if (authStore.isSuperAdmin) return true
  return leave.value.createdBy === authStore.user?.uid && leave.value.status === 'Pending'
})

const daysRemaining = computed(() => {
  if (leave.value.status !== 'Approved') return null
  const endDate = leave.value.endDate
  if (!endDate) return null
  const end = typeof endDate === 'string' ? new Date(endDate) : (endDate.toDate ? endDate.toDate() : new Date(endDate))
  const now = new Date()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff : 0
})

const showApprovalWarning = ref(false)
const approvalWarningMessage = ref('')

function recalcDays() {
  if (!editForm.startDate || !editForm.endDate) { editDays.value = 0; return }
  const start = new Date(editForm.startDate)
  const end = new Date(editForm.endDate)
  if (end < start) { editDays.value = 0; return }
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
  editDays.value = diff
}

function startEdit() {
  Object.assign(editForm, {
    type: leave.value.type || 'Annual',
    startDate: leave.value.startDate || '',
    endDate: leave.value.endDate || '',
    status: leave.value.status || 'Pending',
    department: leave.value.department || '',
    reason: leave.value.reason || ''
  })
  recalcDays()
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!canEdit.value) { toast.error('You no longer have permission to edit this request.'); return }
  saving.value = true
  try {
    const changed = editForm.status !== leave.value.status
    const payload = {
      type: editForm.type,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      daysRequested: editDays.value,
      status: editForm.status,
      department: editForm.department,
      reason: editForm.reason,
      ...(changed ? {
        statusChangedAt: new Date().toISOString(),
        approvedBy: editForm.status === 'Approved' ? authStore.currentUser?.displayName || authStore.currentUser?.email || null : (editForm.status === 'Rejected' ? null : leave.value.approvedBy),
        approvedAt: editForm.status === 'Approved' ? new Date().toISOString() : null
      } : {})
    }
    await updateDoc(doc(db, 'leaveRequests', leave.value.id), payload)
    await logActivity({ action: 'Update', resource: `Leave ${leave.value.leaveId || leave.value.id}`, details: `Updated "${editForm.type}" (${editForm.status})` })
    toast.success(`Leave ${leave.value.leaveId || leave.value.id} updated successfully!`)
    editing.value = false
    if (changed && (editForm.status === 'Approved' || editForm.status === 'Rejected')) {
      const email = await getLeaveCreatorEmail()
      if (email) {
        sendLeaveNotification(leave.value, { name: leave.value.createdByName || 'Staff', email }, editForm.status === 'Approved' ? 'approved' : 'rejected')
      }
    }
  } catch (err) {
    console.error('[LeaveDetailModal] error updating leave:', err)
    toast.error(mapFirebaseError(err, 'Failed to update leave request.'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const id = leaveRef.value?.id
  if (id) {
    unsubLeave = onSnapshot(doc(db, 'leaveRequests', id), (snap) => {
      if (snap.exists()) {
        leaveRef.value = { id: snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsubLeave) unsubLeave()
})

async function updateStatus(status) {
  if (status === leave.value.status) return
  if (status === 'Approved') {
    const warning = await checkDepartmentLeaveWarning()
    if (warning) {
      approvalWarningMessage.value = warning
      showApprovalWarning.value = true
      return
    }
  }
  await confirmUpdateStatus(status)
}

async function confirmUpdateStatus(status) {
  saving.value = true
  try {
    await updateDoc(doc(db, 'leaveRequests', leave.value.id), {
      status,
      statusChangedAt: new Date().toISOString(),
      approvedBy: status === 'Approved' ? authStore.currentUser?.displayName || authStore.currentUser?.email || null : null,
      approvedAt: status === 'Approved' ? new Date().toISOString() : null
    })
    await logActivity({ action: 'Update', resource: `Leave ${leave.value.leaveId || leave.value.id}`, details: `Status changed to ${status}` })
    toast.success(`Status updated to ${status}`)
    if (status === 'Approved' || status === 'Rejected') {
      const email = await getLeaveCreatorEmail()
      if (email) {
        sendLeaveNotification(leave.value, { name: leave.value.createdByName || 'Staff', email }, status === 'Approved' ? 'approved' : 'rejected')
      }
    }
  } catch (err) {
    console.error('[LeaveDetailModal] error updating status:', err)
    toast.error(mapFirebaseError(err, 'Failed to update status.'))
  } finally {
    saving.value = false
    showApprovalWarning.value = false
  }
}

async function checkDepartmentLeaveWarning() {
  const dept = leave.value.department
  if (!dept) return null
  try {
    const q = query(collection(db, 'leaveRequests'), where('status', '==', 'Approved'))
    const snap = await getDocs(q)
    const today = new Date().toISOString().split('T')[0]
    const onLeaveStaff = new Set()
    for (const docSnap of snap.docs) {
      const d = docSnap.data()
      if (d.department !== dept || d.createdBy === leave.value.createdBy) continue
      const start = d.startDate ? (typeof d.startDate === 'string' ? d.startDate : (d.startDate?.toDate ? d.startDate.toDate().toISOString().split('T')[0] : '')) : ''
      const end = d.endDate ? (typeof d.endDate === 'string' ? d.endDate : (d.endDate?.toDate ? d.endDate.toDate().toISOString().split('T')[0] : '')) : ''
      if (start && end && today >= start && today <= end) {
        onLeaveStaff.add(d.createdBy)
      }
    }
    if (onLeaveStaff.size >= 2) {
      return `${onLeaveStaff.size} staff member(s) from ${dept} are currently on approved leave. Are you sure you want to approve another?`
    }
    if (onLeaveStaff.size >= 1) {
      return `1 staff member from ${dept} is currently on approved leave. Please confirm you want to approve another.`
    }
    return null
  } catch (e) {
    console.error('[LeaveDetailModal] warning check error:', e)
    return null
  }
}

function confirmApproval() {
  confirmUpdateStatus('Approved')
}

function deleteLeave() {
  ui.closeModal()
  const item = leaveRef.value
  ui.openModal('DeleteConfirm', item)
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

function statusClass(s) {
  const map = { Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', Approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', Rejected: 'bg-error-container/40 text-on-error-container dark:bg-error/15 dark:text-error' }
  return map[s] || ''
}
</script>
