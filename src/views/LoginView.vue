<template>
  <div class="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden dark:bg-inverse-surface dark:text-inverse-on-surface">
    <div class="absolute top-4 right-4 z-20"><NetworkIndicator /></div>
    <div class="absolute inset-0 z-0 bg-cover bg-center opacity-60 dark:opacity-30"
      style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuANPLmvud6ArH30TzybHCC6lCHAhBVceD3FnBhntGNVM7LRhBmEOF9f4D6PKtNlUGhhEAuyOLuiMPHFZ66Auiq_PlLb67pjjJhHtgFQ35jdpviw1QG-7fC1wkU3NQ0j8wCaYLu8pihu8dlLrS-iloT35Y_kONZ2YwFnbSd4haPV16Lr44pfFlSHhZoIA1o6s6ZBla8pXgihIB9Jwv0-TULGDBMjSWxY9naIeDfMpkaWjYL-P0qNfBRFXpIjpzEq7gWwd7q8Vu8NQSg')">
    </div>
    <div class="absolute inset-0 z-0 bg-gradient-to-br from-surface-container-high/80 to-surface/90 dark:from-inverse-surface/90 dark:to-inverse-surface/95"></div>
    <div class="relative z-10 w-full max-w-md px-container-padding py-xl mx-auto flex flex-col gap-lg">
      <div class="flex flex-col items-center text-center gap-sm mb-md">
        <div class="w-16 h-16 rounded-lg bg-primary flex items-center justify-center shadow-sm mb-xs">
          <span class="material-symbols-outlined text-on-primary" style="font-size: 32px;">medical_services</span>
        </div>
        <h1 class="text-headline-lg font-headline-lg text-primary dark:text-inverse-primary">{{ hospitalName }}</h1>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline">Enterprise Authentication Portal</p>
      </div>
      <div class="glass-panel rounded-xl shadow-lg p-lg flex flex-col gap-lg">
        <!-- Login form -->
        <template v-if="!showForgotPassword">
          <form @submit.prevent="handleLogin" class="flex flex-col gap-md">
            <div class="flex flex-col gap-xs">
              <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface" for="staff-id">Email Address <span class="text-error">*</span></label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">badge</span>
                <input v-model="email" class="w-full pl-10 pr-3 py-2 bg-surface dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md text-on-surface dark:text-inverse-on-surface placeholder:text-outline-variant transition-colors outline-none h-10" id="staff-id" placeholder="e.g. sarah.chen@hospital.org" type="email" required />
              </div>
            </div>
            <div class="flex flex-col gap-xs">
              <div class="flex justify-between items-center">
                <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface" for="password">Password <span class="text-error">*</span></label>
                <button type="button" @click="showForgotPassword = true" class="text-label-sm font-label-sm text-primary dark:text-inverse-primary hover:underline bg-transparent border-0 p-0 cursor-pointer">Forgot Password?</button>
              </div>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                <input v-model="password" class="w-full pl-10 pr-10 py-2 bg-surface dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md text-on-surface dark:text-inverse-on-surface placeholder:text-outline-variant transition-colors outline-none h-10" id="password" placeholder="••••••••" :type="showPassword ? 'text' : 'password'" required />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors">
                  <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
                </button>
              </div>
            </div>
            <button type="submit" :disabled="anyLoggingIn" class="w-full h-10 bg-primary hover:bg-primary-container text-on-primary text-label-md font-label-md rounded flex items-center justify-center gap-xs transition-colors mt-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              Sign In
              <span v-if="emailLoggingIn" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
              <span v-else class="material-symbols-outlined text-[18px]">login</span>
            </button>
          </form>
          <div class="flex items-center gap-sm">
            <div class="flex-1 h-px bg-outline-variant dark:bg-outline opacity-50"></div>
            <span class="text-label-sm font-label-sm text-outline">OR</span>
            <div class="flex-1 h-px bg-outline-variant dark:bg-outline opacity-50"></div>
          </div>
          <button type="button" @click="handleSSO" :disabled="anyLoggingIn" class="w-full h-10 bg-surface dark:bg-inverse-surface border border-outline-variant dark:border-outline hover:bg-surface-container-low dark:hover:bg-surface-variant text-on-surface dark:text-inverse-on-surface text-label-md font-label-md rounded flex items-center justify-center gap-sm transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <span v-if="ssoLoggingIn" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </template>

        <!-- Forgot password form -->
        <form v-else @submit.prevent="handleForgotPassword" class="flex flex-col gap-md">
          <div class="flex items-center gap-3 mb-sm">
            <span class="material-symbols-outlined text-3xl text-primary">lock_reset</span>
            <div>
              <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Reset Password</h3>
              <p class="text-body-sm text-on-surface-variant dark:text-outline">Enter your email to receive a reset link.</p>
            </div>
          </div>
          <div class="flex flex-col gap-xs">
            <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface" for="reset-email">Email Address <span class="text-error">*</span></label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">badge</span>
              <input v-model="forgotEmail" class="w-full pl-10 pr-3 py-2 bg-surface dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md text-on-surface dark:text-inverse-on-surface placeholder:text-outline-variant transition-colors outline-none h-10" id="reset-email" placeholder="e.g. sarah.chen@hospital.org" type="email" required />
            </div>
          </div>
          <p v-if="resetSent" class="text-body-sm text-success flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">check_circle</span>
            Reset link sent! Check your email <span class="text-on-surface-variant">(check spam folder if not found)</span>
          </p>
          <p v-if="resetError" class="text-body-sm text-error">{{ resetError }}</p>
          <button type="submit" :disabled="resetting" class="w-full h-10 bg-primary hover:bg-primary-container text-on-primary text-label-md font-label-md rounded flex items-center justify-center gap-xs transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <span v-if="resetting" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
            <span v-else class="material-symbols-outlined text-[18px]">send</span>
            {{ resetting ? 'Sending...' : 'Send Reset Link' }}
          </button>
          <button type="button" @click="showForgotPassword = false; resetSent = false; resetError = ''" class="text-label-sm font-label-sm text-primary dark:text-inverse-primary hover:underline bg-transparent border-0 p-0 cursor-pointer text-center">
            Back to Sign In
          </button>
        </form>
      </div>
      <div class="text-center">
        <p class="text-body-sm font-body-sm text-outline-variant flex items-center justify-center gap-xs">
          <span class="material-symbols-outlined text-[16px]">verified_user</span>
          Secure Enterprise Connection
        </p>
      </div>
    </div>
    <button @click="ui.toggleTheme()" class="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface shadow-md hover:bg-surface-container-high transition-colors z-50">
      <span class="material-symbols-outlined">contrast</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { useSettings } from '@/composables/useSettings'
import { useAuditLog } from '@/composables/useAuditLog'
import { GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { auth as firebaseAuth } from '@/lib/firebase'
import NetworkIndicator from '@/components/NetworkIndicator.vue'

const router = useRouter()
const auth = useAuthStore()
const ui = useUIStore()
const toast = useToast()
const { hospitalName } = useSettings()
const { logActivity } = useAuditLog()

const email = ref('')
const password = ref('')
const emailLoggingIn = ref(false)
const ssoLoggingIn = ref(false)
const anyLoggingIn = computed(() => emailLoggingIn.value || ssoLoggingIn.value)
const showPassword = ref(false)
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const resetting = ref(false)
const resetSent = ref(false)
const resetError = ref('')

async function handleLogin() {
  emailLoggingIn.value = true
  try {
    await auth.login(email.value, password.value)
    await logActivity({ action: 'Login', resource: 'System', details: `Successful login from ${email.value}` })
    toast.success('Authentication Successful! Logging in...')
    setTimeout(() => router.push('/dashboard'), 1000)
  } catch (err) {
    const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password.'
      : err.code === 'auth/user-not-found' ? 'No account found with this email.'
      : err.code === 'auth/wrong-password' ? 'Incorrect password.'
      : err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
      : err.code === 'auth/user-disabled' ? 'This account has been disabled.'
      : err.code === 'auth/invalid-email' ? 'Invalid email format.'
      : err.message
    toast.error(msg)
  } finally {
    emailLoggingIn.value = false
  }
}

async function handleSSO() {
  ssoLoggingIn.value = true
  try {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(firebaseAuth, provider)
    await logActivity({ action: 'Login', resource: 'System', details: `Successful SSO login` })
    toast.success('SSO Authorized. Logging in...')
    setTimeout(() => router.push('/dashboard'), 1000)
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      toast.error(err.message)
    }
  } finally {
    ssoLoggingIn.value = false
  }
}

async function handleForgotPassword() {
  resetError.value = ''
  resetSent.value = false
  resetting.value = true
  try {
    await sendPasswordResetEmail(firebaseAuth, forgotEmail.value)
    resetSent.value = true
    toast.success('Password reset email sent! Check your inbox.')
  } catch (err) {
    console.error('[ForgotPassword]', err.code, err.message)
    resetError.value = err.code === 'auth/user-not-found'
      ? 'No account found with this email address.'
      : err.code === 'auth/too-many-requests'
        ? 'Too many requests. Please try again later.'
        : err.code === 'auth/invalid-email'
          ? 'Invalid email address.'
          : err.message
  } finally {
    resetting.value = false
  }
}
</script>
