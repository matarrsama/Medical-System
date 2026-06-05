<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-between px-5 py-4 border-b border-outline-variant dark:border-outline">
      <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Reset Password</h3>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="px-5 py-6 space-y-5">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-label-md font-bold shrink-0">{{ user.initials }}</div>
        <div class="min-w-0">
          <p class="text-body-md font-medium text-on-surface dark:text-inverse-on-surface truncate">{{ user.name }}</p>
          <p class="text-body-sm text-on-surface-variant dark:text-outline truncate">{{ user.email }}</p>
        </div>
      </div>
      <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface space-y-3">
        <div class="flex items-center gap-2 text-body-sm text-on-surface dark:text-inverse-on-surface">
          <span class="material-symbols-outlined text-[18px] text-primary">lock_reset</span>
          <span>A new temporary password has been generated.</span>
        </div>
        <div class="flex items-center gap-2 bg-surface-container-highest rounded-lg px-3.5 py-3">
          <span class="text-body-sm font-mono font-bold text-primary flex-1 select-all break-all">{{ tempPassword }}</span>
          <button @click="copyPassword" class="w-8 h-8 rounded-lg bg-surface-container-low dark:bg-inverse-surface text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shrink-0">
            <span class="material-symbols-outlined text-[18px]">content_copy</span>
          </button>
        </div>
        <div class="flex items-center gap-2 text-body-sm text-on-surface-variant dark:text-outline">
          <span class="material-symbols-outlined text-[18px] text-outline">mail</span>
          <span>Password sent to <strong class="text-on-surface dark:text-inverse-on-surface">{{ user.email }}</strong></span>
        </div>
      </div>
    </div>
    <div class="flex justify-end px-5 py-4 border-t border-outline-variant dark:border-outline">
      <button @click="$emit('close')" class="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors">Done</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuditLog } from '@/composables/useAuditLog'
import { resetPassword } from '@/services/api'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { sendPasswordResetEmail } from '@/services/email'

const ui = useUIStore()
const { logActivity } = useAuditLog()
const user = computed(() => ui.modalData || {})
const tempPassword = ref('Loading...')
const loading = ref(true)

onMounted(async () => {
  try {
    const result = await resetPassword(user.value.uid)
    await logActivity({ action: 'Update', resource: `User ${user.value.name || user.value.uid}`, details: `Password reset` })
    tempPassword.value = result.tempPassword
    sendPasswordResetEmail({ name: user.value.name, email: user.value.email }, result.tempPassword)
  } catch (err) {
    ui.showToast(mapFirebaseError(err, 'Failed to reset password.'), 'error')
    tempPassword.value = 'Error generating password'
  } finally {
    loading.value = false
  }
})

function copyPassword() {
  navigator.clipboard.writeText(tempPassword.value)
  ui.showToast('Password copied to clipboard', 'success')
}
</script>