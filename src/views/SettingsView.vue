<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">My Settings</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Manage your personal preferences and account settings.</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-xl">
      <span class="text-on-surface-variant dark:text-outline">Loading settings...</span>
    </div>

    <template v-else>
      <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm mb-lg">
        <div class="flex items-start gap-5">
          <div class="relative group">
            <div class="w-16 h-16 rounded-full overflow-hidden bg-surface-container-highest dark:bg-white/[0.08] flex-shrink-0 border-2 border-outline-variant dark:border-outline cursor-pointer" @click="triggerAvatarInput">
              <img v-if="profile.avatar" class="w-full h-full object-cover" :src="profile.avatar" alt="Profile" />
              <div v-else class="w-full h-full flex items-center justify-center text-headline-md font-headline-md text-on-surface-variant dark:text-outline">{{ profile.initials }}</div>
              <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" @click="triggerAvatarInput">
                <span class="material-symbols-outlined text-white text-[18px]">photo_camera</span>
              </div>
            </div>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">{{ profile.name }}</h3>
            <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-body-sm text-on-surface-variant dark:text-outline">
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
            <span class="px-2.5 py-0.5 rounded-lg text-label-sm font-label-sm" :class="profile.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'">{{ profile.status }}</span>
            <span class="px-2.5 py-0.5 rounded-lg bg-surface-container-higher dark:bg-white/[0.08] text-label-sm font-label-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">verified_user</span>
              {{ profile.role }}
            </span>
            <span class="text-label-sm text-on-surface-variant dark:text-outline">MFA: {{ profile.mfa === 'push' ? 'Push' : profile.mfa === 'sms' ? 'SMS' : 'App' }}</span>
          </div>
        </div>
        <p class="text-label-sm text-on-surface-variant dark:text-outline mt-4 pt-3 border-t border-outline-variant/30 dark:border-outline/30">Contact administrator to update these details.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-lg">
        <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm">
          <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mb-1">Notifications</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mb-5">Control which alerts you receive.</p>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-body-md font-medium text-on-surface dark:text-inverse-on-surface">Email Notifications</div>
                <div class="text-body-sm text-on-surface-variant dark:text-outline">Receive alerts via email</div>
              </div>
              <button class="w-10 h-5 rounded-full transition-colors" :class="prefs.emailNotifications ? 'bg-primary' : 'bg-outline-variant dark:bg-outline'" @click="toggle('emailNotifications')">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" :class="prefs.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'"></div>
              </button>
            </div>
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-body-md font-medium text-on-surface dark:text-inverse-on-surface">SMS Notifications</div>
                <div class="text-body-sm text-on-surface-variant dark:text-outline">Receive SMS for critical alerts</div>
              </div>
              <button class="w-10 h-5 rounded-full transition-colors" :class="prefs.smsNotifications ? 'bg-primary' : 'bg-outline-variant dark:bg-outline'" @click="toggle('smsNotifications')">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" :class="prefs.smsNotifications ? 'translate-x-5' : 'translate-x-0.5'"></div>
              </button>
            </div>
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-body-md font-medium text-on-surface dark:text-inverse-on-surface">Daily Summary</div>
                <div class="text-body-sm text-on-surface-variant dark:text-outline">Receive daily activity digest</div>
              </div>
              <button class="w-10 h-5 rounded-full transition-colors" :class="prefs.dailySummary ? 'bg-primary' : 'bg-outline-variant dark:bg-outline'" @click="toggle('dailySummary')">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" :class="prefs.dailySummary ? 'translate-x-5' : 'translate-x-0.5'"></div>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm">
          <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mb-1">Account</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mb-5">Security and regional preferences.</p>
          <div class="space-y-4">
            <div>
              <label class="block text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5">MFA Method</label>
              <select v-model="prefs.mfaMethod" @change="saveField('mfaMethod', $event.target.value)" class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all">
                <option value="push">Push Notification</option>
                <option value="sms">SMS Code</option>
                <option value="totp">Authenticator App</option>
              </select>
            </div>
            <div>
              <label class="block text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5">Language</label>
              <select v-model="prefs.language" @change="saveField('language', $event.target.value)" class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all">
                <option value="en">English (US)</option>
                <option value="en-uk">English (UK)</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label class="block text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5">Time Zone</label>
              <select v-model="prefs.timezone" @change="saveField('timezone', $event.target.value)" class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all">
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
            <hr class="border-outline-variant/50 dark:border-outline/50" />
            <div>
              <h4 class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-3">Change Password</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-label-sm text-on-surface-variant dark:text-outline mb-1" for="pw-current">Current Password <span class="text-error">*</span></label>
                  <input id="pw-current" v-model="passwordForm.current" type="password" class="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-outline bg-surface-container-low dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter current password" />
                </div>
                <div>
                  <label class="block text-label-sm text-on-surface-variant dark:text-outline mb-1" for="pw-new">New Password <span class="text-error">*</span></label>
                  <input id="pw-new" v-model="passwordForm.newPassword" type="password" class="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-outline bg-surface-container-low dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface focus:outline-none focus:ring-1 focus:ring-primary" placeholder="At least 8 characters" minlength="8" />
                </div>
                <div>
                  <label class="block text-label-sm text-on-surface-variant dark:text-outline mb-1" for="pw-confirm">Confirm New Password <span class="text-error">*</span></label>
                  <input id="pw-confirm" v-model="passwordForm.confirm" type="password" class="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-outline bg-surface-container-low dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Re-enter new password" minlength="8" />
                </div>
                <p v-if="passwordError" class="text-body-sm text-error">{{ passwordError }}</p>
                <button @click="changePassword" :disabled="pwSubmitting" class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-label-sm font-label-sm rounded-lg hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <span v-if="pwSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  <span v-else class="material-symbols-outlined text-[16px]">key</span>
                  {{ pwSubmitting ? 'Updating…' : 'Update Password' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="saveAll" :disabled="saving" class="px-5 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else>Save Settings</span>
        </button>
      </div>

      <!-- About -->
      <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm mt-lg">
        <div class="flex items-center gap-3 mb-4">
          <img src="/icon.png" alt="" class="w-10 h-10 object-contain rounded-lg" />
          <div>
            <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">About</h3>
            <p class="text-body-sm text-on-surface-variant dark:text-outline">{{ hospitalName }} — Medical Records System</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-higher dark:bg-white/[0.08] text-label-sm font-label-md">
            <span class="material-symbols-outlined text-[16px] text-on-surface-variant dark:text-outline">tag</span>
            Version <strong>{{ appVersion }}</strong>
          </div>
          <button @click="checkForUpdates" :disabled="updateChecking" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm border border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors">
            <span v-if="updateChecking" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            <span v-else class="material-symbols-outlined text-[16px]">system_update</span>
            Check for Updates
          </button>
          <span v-if="updateMessage" class="text-label-sm" :class="updateOk ? 'text-green-600 dark:text-green-400' : 'text-error'">{{ updateMessage }}</span>
        </div>
      </div>

      <div v-if="auth.isSuperAdmin || auth.role === 'Hospital Admin'" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm mt-lg">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Roles Management</h3>
            <p class="text-body-sm text-on-surface-variant dark:text-outline mt-1">Define and manage system roles and their permissions.</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="seedDefaults" :disabled="seeding" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm border border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors">
              <span v-if="seeding" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
              <span v-else class="material-symbols-outlined text-[16px]">auto_awesome</span>
              Seed Defaults
            </button>
            <button @click="openCreateRole" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm bg-primary text-on-primary transition-colors shadow-sm">
              <span class="material-symbols-outlined text-[16px]">add</span>
              Add Role
            </button>
          </div>
        </div>

        <div v-if="rolesLoading" class="flex items-center justify-center py-8">
          <span class="material-symbols-outlined animate-spin text-[24px] text-primary">sync</span>
        </div>

        <div v-else-if="roles.length === 0" class="flex flex-col items-center justify-center py-8 text-on-surface-variant dark:text-outline">
          <span class="material-symbols-outlined text-[48px] mb-2">badge</span>
          <p class="text-body-md font-body-md mb-1">No roles defined yet</p>
          <p class="text-body-sm">Click "Seed Defaults" to populate from defaults.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-outline-variant dark:border-outline">
                <th class="text-left px-3 py-2 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Role</th>
                <th class="text-left px-3 py-2 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Permissions</th>
                <th class="text-center px-3 py-2 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Status</th>
                <th class="text-right px-3 py-2 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in sortedRoles" :key="r.name" class="border-b border-outline-variant/30 dark:border-outline/30 hover:bg-surface-container dark:hover:bg-white/[0.02] transition-colors">
                <td class="px-3 py-2 text-body-sm font-body-md text-on-surface dark:text-inverse-on-surface">{{ r.name }}</td>
                <td class="px-3 py-2">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="p in r._permLabels" :key="p" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-label-xs font-label-xs bg-secondary-container text-on-secondary-container dark:bg-secondary dark:text-on-secondary">{{ p }}</span>
                  </div>
                </td>
                <td class="px-3 py-2 text-center">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-label-xs" :class="r.active !== false ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-outline-variant/50 text-outline dark:bg-white/[0.08]'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="r.active !== false ? 'bg-green-500' : 'bg-outline'"></span>
                    {{ r.active !== false ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-3 py-2 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="openEditRole(r)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors" title="Edit">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button @click="confirmDeleteRole(r)" class="p-1 rounded hover:bg-error-container dark:hover:bg-error-container/30 text-on-surface-variant dark:text-outline hover:text-error transition-colors" title="Delete">
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAuditLog } from '@/composables/useAuditLog'
import { useUIStore } from '@/stores/ui'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { useFirestoreCache } from '@/composables/useFirestoreCache'
import { db, auth as firebaseAuth } from '@/lib/firebase'
import { doc, onSnapshot, updateDoc, collection, setDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { PERMISSIONS, ROLES } from '@/data/roles'
import { useSettings } from '@/composables/useSettings'

const auth = useAuthStore()
const ui = useUIStore()
const { logActivity } = useAuditLog()
const cache = useFirestoreCache()
const { hospitalName } = useSettings()

const loading = ref(true)
const saving = ref(false)
const avatarInput = ref(null)
const passwordForm = reactive({ current: '', newPassword: '', confirm: '' })
const passwordError = ref('')
const pwSubmitting = ref(false)
const appVersion = ref('--')
const updateChecking = ref(false)
const updateMessage = ref('')
const updateOk = ref(false)
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
const roles = ref([])
const rolesLoading = ref(true)
const seeding = ref(false)
let rolesUnsub = null
let unsub = null

function triggerAvatarInput() {
  avatarInput.value?.click()
}

function onAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    ui.showToast('Image must be under 2MB', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    profile.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

let watchUnsub = null

onMounted(() => {
  rolesUnsub = onSnapshot(collection(db, 'roles'), (snap) => {
    roles.value = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      _permLabels: getPermLabels(d.data().permissions)
    }))
    rolesLoading.value = false
  }, () => { rolesLoading.value = false })

  watchUnsub = watch(
    [() => auth.user?.uid, () => auth.loading],
    ([uid, authLoading]) => {
      if (uid) {
        // Try to load cached data for this user immediately
        const cachedData = cache.load('settings_' + uid)
        if (cachedData) {
          Object.assign(profile, {
            name: cachedData.name || '',
            initials: cachedData.initials || '',
            employeeId: cachedData.employeeId || '',
            email: cachedData.email || '',
            title: cachedData.title || '',
            department: cachedData.department || '',
            role: cachedData.role || '',
            status: cachedData.status || '',
            mfa: cachedData.mfa || 'push',
            avatar: cachedData.avatar || ''
          })
          const p = cachedData.preferences || {}
          const defaults = {
            emailNotifications: p.emailNotifications !== false,
            smsNotifications: !!p.smsNotifications,
            dailySummary: p.dailySummary !== false,
            mfaMethod: cachedData.mfa || 'push',
            language: p.language || 'en',
            timezone: p.timezone || 'America/New_York'
          }
          Object.assign(prefs, defaults)
          saved.value = { ...defaults }
          loading.value = false // Bypasses visual flash or loader spinner
        }

        if (unsub) return // already subscribed
        if (!cachedData) {
          loading.value = true
        }

        unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            // Save updated state in the cache for offline-first speed on next visit
            cache.save('settings_' + uid, data)

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
              emailNotifications: p.emailNotifications !== false,
              smsNotifications: !!p.smsNotifications,
              dailySummary: p.dailySummary !== false,
              mfaMethod: data.mfa || 'push',
              language: p.language || 'en',
              timezone: p.timezone || 'America/New_York'
            }
            Object.assign(prefs, defaults)
            saved.value = { ...defaults }
          }
          loading.value = false
        }, (err) => {
          console.error('Error fetching settings:', err)
          loading.value = false
        })
      } else if (!authLoading) {
        loading.value = false
      }
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  if (rolesUnsub) rolesUnsub()
  if (watchUnsub) watchUnsub()
  if (unsub) unsub()
})

function toggle(key) {
  prefs[key] = !prefs[key]
}

const PERM_MAP = Object.fromEntries(PERMISSIONS.map(p => [p.id, p.label]))

const sortedRoles = computed(() =>
  [...roles.value].sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
)

function getPermLabels(perms) {
  if (!perms) return []
  return Object.entries(perms)
    .filter(([, v]) => v === true)
    .map(([k]) => PERM_MAP[k] || k)
}

async function syncRoleConfig() {
  const roleDocs = await getDocs(collection(db, 'roles'))
  const groups = {}
  for (const perm of PERMISSIONS) {
    groups[perm.id] = []
  }
  for (const d of roleDocs.docs) {
    const data = d.data()
    if (data.active === false) continue
    const perms = data.permissions || {}
    for (const perm of PERMISSIONS) {
      if (perms[perm.id] === true) {
        groups[perm.id].push(data.name)
      }
    }
  }
  await setDoc(doc(db, 'config', 'rolePermissions'), groups)
}

function openCreateRole() {
  ui.openModal('RoleForm', { mode: 'create' })
}

function openEditRole(role) {
  ui.openModal('RoleForm', { mode: 'edit', role })
}

async function confirmDeleteRole(role) {
  if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
  try {
    await deleteDoc(doc(db, 'roles', role.name))
    await syncRoleConfig()
    ui.showToast(`Role "${role.name}" deleted`, 'success')
  } catch (err) {
    ui.showToast('Failed to delete role', 'error')
  }
}

async function seedDefaults() {
  seeding.value = true
  try {
    const batch = []
    for (const r of ROLES) {
      const perms = {}
      if (['sys_admin'].includes(r.id)) {
        PERMISSIONS.forEach(p => { perms[p.id] = true })
      }
      if (['hospital_admin', 'ict_officer'].includes(r.id)) {
        perms.canCreateUsers = true
        perms.canEditUsers = true
        perms.canSuspendUsers = true
        perms.canDeleteUsers = true
        perms.canResetUserPasswords = true
        perms.canCreateDepartments = true
        perms.canEditDepartments = true
        perms.canDeleteDepartments = true
        perms.canViewAllTickets = true
        perms.canCreateTickets = true
        perms.canEditTickets = true
        perms.canDeleteTickets = true
        perms.canUpdateTicketStatus = true
        perms.canViewAllLeaves = true
        perms.canDeleteLeaves = true
        perms.canCreateInventory = true
        perms.canEditInventory = true
        perms.canDeleteInventory = true
        perms.canChangeInventoryStatus = true
        perms.canCreateMaintenance = true
        perms.canEditMaintenance = true
        perms.canDeleteMaintenance = true
        perms.canUpdateMaintenanceStatus = true
        perms.canCreateEquipment = true
        perms.canEditEquipment = true
        perms.canDeleteEquipment = true
        perms.canCreatePO = true
        perms.canEditPO = true
        perms.canDeletePO = true
        perms.canChooseDepartment = true
        perms.canManageServiceRequests = true
        if (r.id === 'hospital_admin') {
          perms.canApproveLeaves = true
          perms.canRejectLeaves = true
          perms.canConfigureLeaves = true
          perms.canUpdatePOStatus = true
          perms.canManageRoles = true
        }
      }
      batch.push(setDoc(doc(db, 'roles', r.label), {
        name: r.label,
        level: r.id === 'sys_admin' ? 4 : r.id === 'ict_officer' ? 3 : r.id === 'hospital_admin' ? 3 : 1,
        active: true,
        permissions: perms
      }))
    }
    await Promise.all(batch)
    await syncRoleConfig()
    ui.showToast('Default roles seeded', 'success')
  } catch (err) {
    ui.showToast('Failed to seed roles', 'error')
  } finally {
    seeding.value = false
  }
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
    const updateData = {
      mfa: prefs.mfaMethod,
      avatar: profile.avatar,
      preferences: {
        emailNotifications: prefs.emailNotifications,
        smsNotifications: prefs.smsNotifications,
        dailySummary: prefs.dailySummary,
        language: prefs.language,
        timezone: prefs.timezone
      }
    }
    await updateDoc(doc(db, 'users', auth.user.uid), updateData)
    await logActivity({ action: 'Update', resource: 'User Settings', details: `Updated account and notification preferences` })
    saved.value = { ...prefs }
    ui.showToast('Settings saved', 'success')
  } catch (err) {
    ui.showToast(`Save failed: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  passwordError.value = ''
  if (!passwordForm.current) { passwordError.value = 'Current password is required'; return }
  if (passwordForm.newPassword.length < 8) { passwordError.value = 'New password must be at least 8 characters'; return }
  if (passwordForm.newPassword !== passwordForm.confirm) { passwordError.value = 'Passwords do not match'; return }

  pwSubmitting.value = true
  try {
    const credential = EmailAuthProvider.credential(firebaseAuth.currentUser.email, passwordForm.current)
    await reauthenticateWithCredential(firebaseAuth.currentUser, credential)
    await updatePassword(firebaseAuth.currentUser, passwordForm.newPassword)
    await logActivity({ action: 'Update', resource: 'Password', details: 'Changed own password' })
    ui.showToast('Password updated successfully', 'success')
    passwordForm.current = ''
    passwordForm.newPassword = ''
    passwordForm.confirm = ''
  } catch (err) {
    const msg = mapFirebaseError(err, 'Failed to update password.')
    passwordError.value = msg
    ui.showToast(msg, 'error')
  } finally {
    pwSubmitting.value = false
  }
}

onMounted(async () => {
  if (window.electronAPI?.getAppVersion) {
    try {
      appVersion.value = await window.electronAPI.getAppVersion()
    } catch {}
  }
  // The existing onMounted code still runs below
})

async function checkForUpdates() {
  if (!window.electronAPI?.checkForUpdates) {
    updateMessage.value = 'Updates only available in the desktop app'
    updateOk.value = false
    return
  }
  updateChecking.value = true
  updateMessage.value = 'Checking...'
  try {
    const result = await window.electronAPI.checkForUpdates()
    if (result.available) {
      updateMessage.value = 'Update v' + result.version + ' is downloading'
      updateOk.value = true
    } else if (result.error) {
      updateMessage.value = result.error
      updateOk.value = false
    } else {
      updateMessage.value = 'You\u2019re on the latest version'
      updateOk.value = true
    }
  } catch (err) {
    updateMessage.value = err.message || 'Update check failed'
    updateOk.value = false
  } finally {
    setTimeout(() => { updateChecking.value = false }, 3000)
  }
}
</script>
