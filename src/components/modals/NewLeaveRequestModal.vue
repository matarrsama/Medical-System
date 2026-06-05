<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary dark:text-inverse-primary text-[22px]">event</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">New Leave Request</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">Submit a leave request for approval</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div v-if="cooldownBlocked" class="mx-6 mt-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-label-sm font-label-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
      <span class="material-symbols-outlined text-[18px] mt-0.5">info</span>
      <span>{{ cooldownMessage }}</span>
    </div>
    <form @submit.prevent="submit" class="flex flex-col flex-1 min-h-0">
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <div class="flex items-center gap-3">
          <label class="text-label-md font-label-md text-on-surface-variant dark:text-outline">Leave ID</label>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary text-label-sm font-label-sm font-mono">
            <span class="material-symbols-outlined text-[14px]">tag</span>
            {{ leaveId }}
          </span>
        </div>

        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Leave Type <span class="text-error">*</span></label>
          <select v-model="form.type" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required>
            <option>Annual</option>
            <option>Sick</option>
            <option>Personal</option>
            <option>Other</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Start Date <span class="text-error">*</span></label>
            <input v-model="form.startDate" type="date" @change="calcDays" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required />
          </div>
          <div>
            <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">End Date <span class="text-error">*</span></label>
            <input v-model="form.endDate" type="date" @change="calcDays" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" required />
          </div>
        </div>

        <div class="flex items-center gap-2 px-3 py-2 bg-surface-container-low dark:bg-inverse-surface rounded-lg border border-outline-variant/50 dark:border-outline">
          <span class="material-symbols-outlined text-[18px] text-primary dark:text-inverse-primary">calendar_month</span>
          <span class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline">Days Requested:</span>
          <span class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface font-bold">{{ daysRequested }}</span>
        </div>

        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Department <span class="text-error">*</span></label>
          <select v-model="form.department" :disabled="departmentLocked" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed" required>
            <option disabled value="">Select Department</option>
            <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
          </select>
        </div>

        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Reason / Description</label>
          <textarea v-model="form.reason" rows="4" placeholder="Provide reason for leave..." class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"></textarea>
        </div>

        <div class="flex items-center gap-6 p-3 bg-surface-container-lowest dark:bg-inverse-surface rounded-lg border border-outline-variant/50 dark:border-outline">
          <div class="flex items-center gap-2">
            <span class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline">Status</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Pending
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-label-sm font-label-sm text-on-surface-variant dark:text-outline">Requested by</span>
            <span class="text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface">{{ authStore.currentUser?.displayName || authStore.currentUser?.email || '—' }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
        <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher dark:hover:bg-white/[0.08] transition-colors">
          Cancel
        </button>
        <button type="submit" :disabled="saving || cooldownBlocked" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">send</span>
          {{ saving ? 'Submitting...' : 'Submit Leave Request' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { sendLeaveSubmittedNotification } from '@/services/email'
import { generateId } from '@/utils/generateId'
import { useAuditLog } from '@/composables/useAuditLog'
import { useDepartmentsStore } from '@/stores/departments'
import { useAuthStore } from '@/stores/auth'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, getDoc, doc as fDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { logActivity } = useAuditLog()
const deptStore = useDepartmentsStore()
const authStore = useAuthStore()
const saving = ref(false)

const leaveId = ref('')
const daysRequested = ref(0)

const departmentLocked = computed(() =>
  !authStore.canManageUsers
)

const form = reactive({
  type: 'Annual', startDate: '', endDate: '', department: '', reason: ''
})

const cooldownBlocked = ref(false)
const cooldownMessage = ref('')

function calcDays() {
  if (!form.startDate || !form.endDate) { daysRequested.value = 0; return }
  const start = new Date(form.startDate)
  const end = new Date(form.endDate)
  if (end < start) { daysRequested.value = 0; return }
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
  daysRequested.value = diff
}

async function checkCooldown() {
  const uid = authStore.user?.uid
  if (!uid) return
  try {
    const configSnap = await getDoc(fDoc(db, 'settings', 'leaveConfig'))
    const config = configSnap.exists() ? configSnap.data() : { approvalIntervalDays: 0, rejectionIntervalDays: 0 }
    const leavesSnap = await getDocs(query(
      collection(db, 'leaveRequests'),
      where('createdBy', '==', uid),
      where('status', 'in', ['Approved', 'Rejected']),
      orderBy('statusChangedAt', 'desc'),
      limit(1)
    ))
    if (leavesSnap.empty) return
    const lastLeave = { id: leavesSnap.docs[0].id, ...leavesSnap.docs[0].data() }
    const now = Date.now()
    if (lastLeave.status === 'Approved' && lastLeave.approvedAt && config.approvalIntervalDays > 0) {
      const refDate = new Date(lastLeave.approvedAt).getTime()
      const cooldown = config.approvalIntervalDays * 24 * 60 * 60 * 1000
      if (now - refDate < cooldown) {
        const daysLeft = Math.ceil((cooldown - (now - refDate)) / (24 * 60 * 60 * 1000))
        cooldownBlocked.value = true
        cooldownMessage.value = `You cannot request leave yet. Your last approved leave (${lastLeave.leaveId || lastLeave.id}) is within the ${config.approvalIntervalDays}-day cooldown. ${daysLeft} day(s) remaining.`
        return
      }
    }
    if (lastLeave.status === 'Rejected' && lastLeave.statusChangedAt && config.rejectionIntervalDays > 0) {
      const refDate = new Date(lastLeave.statusChangedAt).getTime()
      const cooldown = config.rejectionIntervalDays * 24 * 60 * 60 * 1000
      if (now - refDate < cooldown) {
        const daysLeft = Math.ceil((cooldown - (now - refDate)) / (24 * 60 * 60 * 1000))
        cooldownBlocked.value = true
        cooldownMessage.value = `You cannot request leave yet. Your last rejected leave (${lastLeave.leaveId || lastLeave.id}) is within the ${config.rejectionIntervalDays}-day cooldown. ${daysLeft} day(s) remaining.`
      }
    }
  } catch (e) {
    console.error('[NewLeaveRequestModal] cooldown check error:', e)
  }
}

async function submit() {
  if (cooldownBlocked.value) return
  if (!form.startDate || !form.endDate) return
  if (daysRequested.value < 1) return
  saving.value = true
  try {
    await addDoc(collection(db, 'leaveRequests'), {
      leaveId: leaveId.value,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      daysRequested: daysRequested.value,
      department: form.department,
      reason: form.reason || '',
      status: 'Pending',
      approvedBy: null,
      approvedAt: null,
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Leave ${leaveId.value}`, details: `${form.type} leave, ${daysRequested.value} days` })
    toast.success(`Leave request ${leaveId.value} submitted successfully!`)
    sendLeaveSubmittedNotification({ type: form.type, startDate: form.startDate, endDate: form.endDate }, { name: auth.currentUser?.displayName || 'Staff', email: auth.currentUser?.email })
    emit('close')
  } catch (err) {
    console.error('[NewLeaveRequestModal] error creating leave:', err)
    toast.error(mapFirebaseError(err, 'Failed to submit leave request.'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const year = new Date().getFullYear()
  leaveId.value = generateId(`LV-${year}-`, 6)
  form.department = authStore.user?.department || authStore.departmentHeadOf || deptStore.items[0]?.name || ''
  await checkCooldown()
})
</script>
