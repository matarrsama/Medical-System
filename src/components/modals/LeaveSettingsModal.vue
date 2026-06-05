<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary dark:text-inverse-primary text-[22px]">settings</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">Leave Settings</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">Configure cooldown intervals between leave requests</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="save" class="p-6 space-y-6">
      <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface space-y-5">
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Approval Interval (days)</label>
          <p class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline mb-2">After a leave is approved, the staff must wait this many days before requesting again. Set to 0 for no restriction.</p>
          <input v-model.number="form.approvalIntervalDays" type="number" min="0" step="1" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" />
        </div>
        <div class="border-t border-outline-variant/30 dark:border-outline/30 pt-5">
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5 block">Rejection Interval (days)</label>
          <p class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline mb-2">After a leave is rejected, the staff must wait this many days before requesting again. Set to 0 for no restriction.</p>
          <input v-model.number="form.rejectionIntervalDays" type="number" min="0" step="1" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors" />
        </div>
      </div>

      <div v-if="form.approvalIntervalDays > 0 || form.rejectionIntervalDays > 0" class="px-4 py-3 rounded-lg bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/50 dark:border-outline text-label-sm text-on-surface-variant dark:text-outline flex items-start gap-2">
        <span class="material-symbols-outlined text-[18px] mt-0.5">info</span>
        <div>
          <p class="font-medium">Active restrictions:</p>
          <ul class="list-disc list-inside mt-1 space-y-0.5">
            <li v-if="form.approvalIntervalDays > 0">{{ form.approvalIntervalDays }} day(s) after approval</li>
            <li v-if="form.rejectionIntervalDays > 0">{{ form.rejectionIntervalDays }} day(s) after rejection</li>
          </ul>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant dark:border-outline">
        <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher dark:hover:bg-white/[0.08] transition-colors">
          Cancel
        </button>
        <button type="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const saving = ref(false)

const form = reactive({
  approvalIntervalDays: 0,
  rejectionIntervalDays: 0
})

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'leaveConfig'))
    if (snap.exists()) {
      const data = snap.data()
      form.approvalIntervalDays = data.approvalIntervalDays || 0
      form.rejectionIntervalDays = data.rejectionIntervalDays || 0
    }
  } catch (e) {
    console.error('[LeaveSettingsModal] error loading config:', e)
  }
})

async function save() {
  saving.value = true
  try {
    await setDoc(doc(db, 'settings', 'leaveConfig'), {
      approvalIntervalDays: Math.max(0, Math.floor(form.approvalIntervalDays)),
      rejectionIntervalDays: Math.max(0, Math.floor(form.rejectionIntervalDays))
    })
    toast.success('Leave settings saved successfully!')
    emit('close')
  } catch (err) {
    console.error('[LeaveSettingsModal] error saving config:', err)
    toast.error(mapFirebaseError(err, 'Failed to save leave settings.'))
  } finally {
    saving.value = false
  }
}
</script>
