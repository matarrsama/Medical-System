<template>
  <div class="p-6 max-w-md mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-on-primary">lock_reset</span>
      </div>
      <div>
        <h3 class="text-headline-sm font-headline-md text-on-surface">Change Your Password</h3>
        <p class="text-body-sm text-on-surface-variant">You must update your temporary password to continue.</p>
      </div>
    </div>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-label-md font-label-md text-on-surface" for="newPassword">New Password <span class="text-error">*</span></label>
        <input
          id="newPassword"
          v-model="newPassword"
          type="password"
          class="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-on-surface-variant"
          placeholder="Enter new password"
          required
          minlength="8"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md font-label-md text-on-surface" for="confirmPassword">Confirm New Password <span class="text-error">*</span></label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          class="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-on-surface-variant"
          placeholder="Confirm new password"
          required
          minlength="8"
        />
      </div>
      <p v-if="error" class="text-body-sm text-error">{{ error }}</p>
      <button
        type="submit"
        :disabled="submitting"
        class="w-full h-10 bg-primary text-on-primary text-label-md font-label-md rounded-lg hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span v-if="submitting" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">key</span>
        {{ submitting ? 'Updating...' : 'Update Password' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { changePassword } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const ui = useUIStore()

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  submitting.value = true
  try {
    await changePassword(auth.user.uid, newPassword.value)
    auth.clearMustChange()
    ui.showToast('Password updated successfully', 'success')
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
