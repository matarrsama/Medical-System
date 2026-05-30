<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">My Settings</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage your personal preferences and account settings.</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-xl">
      <span class="text-on-surface-variant">Loading settings...</span>
    </div>

    <template v-else>
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm mb-lg">
        <div class="flex items-start gap-5">
          <div class="w-16 h-16 rounded-full overflow-hidden bg-surface-container-highest flex-shrink-0 border-2 border-outline-variant">
            <img v-if="profile.avatar" class="w-full h-full object-cover" :src="profile.avatar" alt="Profile" />
            <div v-else class="w-full h-full flex items-center justify-center text-headline-md font-headline-md text-on-surface-variant">{{ profile.initials }}</div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-headline-sm font-headline-md text-on-surface">{{ profile.name }}</h3>
            <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-body-sm text-on-surface-variant">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">badge</span>
                {{ profile.employeeId }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">email</span>
                {{ profile.email }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">work</span>
                {{ profile.title }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">domain</span>
                {{ profile.department }}
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-2 items-end">
            <span class="px-2.5 py-0.5 rounded-lg text-label-sm font-label-sm" :class="profile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'">{{ profile.status }}</span>
            <span class="px-2.5 py-0.5 rounded-lg bg-surface-container-higher text-label-sm font-label-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">verified_user</span>
              {{ profile.role }}
            </span>
            <span class="text-label-sm text-on-surface-variant">MFA: {{ profile.mfa === 'push' ? 'Push' : profile.mfa === 'sms' ? 'SMS' : 'App' }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-lg">
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 class="text-headline-sm font-headline-md text-on-surface mb-1">Notifications</h3>
          <p class="text-body-sm text-on-surface-variant mb-5">Control which alerts you receive.</p>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-body-md font-medium text-on-surface">Email Notifications</div>
                <div class="text-body-sm text-on-surface-variant">Receive alerts via email</div>
              </div>
              <button class="w-10 h-5 rounded-full transition-colors" :class="prefs.emailNotifications ? 'bg-primary' : 'bg-outline-variant'" @click="toggle('emailNotifications')">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" :class="prefs.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'"></div>
              </button>
            </div>
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-body-md font-medium text-on-surface">SMS Notifications</div>
                <div class="text-body-sm text-on-surface-variant">Receive SMS for critical alerts</div>
              </div>
              <button class="w-10 h-5 rounded-full transition-colors" :class="prefs.smsNotifications ? 'bg-primary' : 'bg-outline-variant'" @click="toggle('smsNotifications')">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" :class="prefs.smsNotifications ? 'translate-x-5' : 'translate-x-0.5'"></div>
              </button>
            </div>
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-body-md font-medium text-on-surface">Daily Summary</div>
                <div class="text-body-sm text-on-surface-variant">Receive daily activity digest</div>
              </div>
              <button class="w-10 h-5 rounded-full transition-colors" :class="prefs.dailySummary ? 'bg-primary' : 'bg-outline-variant'" @click="toggle('dailySummary')">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" :class="prefs.dailySummary ? 'translate-x-5' : 'translate-x-0.5'"></div>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 class="text-headline-sm font-headline-md text-on-surface mb-1">Account</h3>
          <p class="text-body-sm text-on-surface-variant mb-5">Security and regional preferences.</p>
          <div class="space-y-4">
            <div>
              <label class="block text-label-md font-label-md text-on-surface mb-1.5">MFA Method</label>
              <select v-model="prefs.mfaMethod" @change="saveField('mfaMethod', $event.target.value)" class="w-full appearance-none bg-surface-container-highest border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary transition-all">
                <option value="push">Push Notification</option>
                <option value="sms">SMS Code</option>
                <option value="totp">Authenticator App</option>
              </select>
            </div>
            <div>
              <label class="block text-label-md font-label-md text-on-surface mb-1.5">Language</label>
              <select v-model="prefs.language" @change="saveField('language', $event.target.value)" class="w-full appearance-none bg-surface-container-highest border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary transition-all">
                <option value="en">English (US)</option>
                <option value="en-uk">English (UK)</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label class="block text-label-md font-label-md text-on-surface mb-1.5">Time Zone</label>
              <select v-model="prefs.timezone" @change="saveField('timezone', $event.target.value)" class="w-full appearance-none bg-surface-container-highest border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary transition-all">
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Africa/Nairobi">Africa/Nairobi</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="resetToSaved" class="px-4 py-2 border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors">Reset</button>
        <button @click="saveAll" :disabled="saving" class="px-5 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else>Save Settings</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

const auth = useAuthStore()
const ui = useUIStore()

const loading = ref(true)
const saving = ref(false)
const profile = reactive({
  name: '', initials: '', employeeId: '', email: '', title: '', department: '',
  role: '', status: '', mfa: 'push', avatar: ''
})
const prefs = reactive({
  emailNotifications: true,
  smsNotifications: false,
  dailySummary: true,
  mfaMethod: 'push',
  language: 'en',
  timezone: 'America/New_York'
})
const saved = ref(null)
let unsub = null

onMounted(() => {
  if (!auth.user?.uid) {
    loading.value = false
    return
  }

  unsub = onSnapshot(doc(db, 'users', auth.user.uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data()
      Object.assign(profile, {
        name: data.name || '',
        initials: data.initials || '',
        employeeId: data.employeeId || '',
        email: data.email || '',
        title: data.title || '',
        department: data.department || '',
        role: data.role || '',
        status: data.status || '',
        mfa: data.mfa || 'push',
        avatar: data.avatar || ''
      })
      const p = data.preferences || {}
      const defaults = {
        emailNotifications: true,
        smsNotifications: false,
        dailySummary: true,
        mfaMethod: data.mfa || 'push',
        language: p.language || 'en',
        timezone: p.timezone || 'America/New_York'
      }
      Object.assign(prefs, defaults)
      saved.value = { ...defaults }
    }
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsub) unsub()
})

function toggle(key) {
  prefs[key] = !prefs[key]
}

function resetToSaved() {
  if (saved.value) Object.assign(prefs, saved.value)
  ui.showToast('Reset to last saved values', 'info')
}

async function saveField(key, value) {
  prefs[key] = value
  await saveAll()
}

async function saveAll() {
  if (!auth.user?.uid || saving.value) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'users', auth.user.uid), {
      mfa: prefs.mfaMethod,
      preferences: {
        emailNotifications: prefs.emailNotifications,
        smsNotifications: prefs.smsNotifications,
        dailySummary: prefs.dailySummary,
        language: prefs.language,
        timezone: prefs.timezone
      }
    })
    saved.value = { ...prefs }
    ui.showToast('Settings saved', 'success')
  } catch (err) {
    ui.showToast(`Save failed: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}
</script>
