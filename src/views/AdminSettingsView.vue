<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Admin Settings</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Manage system-wide configuration and preferences.</p>
      </div>
      <div class="flex items-center gap-2 mt-3 sm:mt-0">
        <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-label-sm font-label-sm">
          <span class="material-symbols-outlined text-[14px]">admin_panel_settings</span>
          Sys Admin Only
        </span>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-lg">
      <div v-for="section in sections" :key="section.title" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm">
        <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface mb-1">{{ section.title }}</h3>
        <p class="text-body-sm text-on-surface-variant dark:text-outline mb-5">{{ section.description }}</p>
        <div class="space-y-4">
          <div v-for="item in section.items" :key="item.label" class="pb-4 border-b border-outline-variant/30 dark:border-outline/30 last:border-0 last:pb-0">
            <label class="block text-label-md font-label-md text-on-surface dark:text-inverse-on-surface mb-1.5">{{ item.label }}</label>
            <p class="text-body-sm text-on-surface-variant dark:text-outline mb-2.5">{{ item.description }}</p>
            <input v-if="item.type === 'text'" v-model="item.value" class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all" type="text" />
            <select v-else-if="item.type === 'select'" v-model="item.value" class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all">
              <option v-for="opt in item.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <div v-else-if="item.type === 'toggle'" class="flex items-center gap-3">
              <button class="w-10 h-5 rounded-full transition-colors relative" :class="item.value ? 'bg-primary' : 'bg-outline-variant dark:bg-outline'" @click="item.value = !item.value">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5" :class="item.value ? 'left-5' : 'left-0.5'"></div>
              </button>
              <span class="text-body-sm text-on-surface dark:text-inverse-on-surface">{{ item.value ? 'Enabled' : 'Disabled' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end gap-3">
      <button @click="reset" class="px-4 py-2 border border-outline-variant dark:border-outline rounded-lg text-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors">Reset to Defaults</button>
      <button @click="save" :disabled="saving" class="px-5 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else>Save Settings</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useSettings } from '@/composables/useSettings'
import { useAuditLog } from '@/composables/useAuditLog'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const ui = useUIStore()
const { logActivity } = useAuditLog()
const saving = ref(false)
const { saveSettings } = useSettings()

const defaults = {
  hospitalName: 'Medical Records System',
  displayName: 'ICT Admin Console',
  timeZone: 'America/New_York',
  language: 'English (US)',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD ($)',
  sessionTimeout: '30',
  passwordMinLength: '12',
  mfaRequired: true,
  accountLockout: true,
  emailAlerts: true,
  smsAlerts: false,
  dailySummary: true,
  adSync: 'Connected',
  ehrIntegration: 'Connected',
  siemExport: false,
  maintenanceMode: false
}

function buildSections(overrides = {}) {
  const v = (key, fallback) => overrides[key] ?? fallback
  const item = (key, label, desc, type, extra) => ({ key, label, description: desc, type, value: v(key, defaults[key]), ...extra })
  return [
    {
      title: 'General',
      description: 'Basic system identification and regional preferences.',
      items: [
        item('hospitalName', 'Hospital Name', 'Display name for the system', 'text'),

        item('timeZone', 'Time Zone', 'System-wide time zone for all logs and schedules', 'select', { options: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Tokyo', 'UTC'] }),
        item('language', 'Language', 'Default interface language', 'select', { options: ['English (US)', 'English (UK)', 'French', 'Spanish', 'Arabic'] }),
        item('dateFormat', 'Date Format', 'How dates are displayed throughout the system', 'select', { options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] }),
        item('currency', 'Currency', 'Default currency for financial modules', 'select', { options: ['USD ($)', 'EUR (€)', 'GBP (£)', 'KES (KSh)', 'GMD (D)'] })
      ]
    },
    {
      title: 'Security',
      description: 'Authentication, password policy, and access control settings.',
      items: [
        item('sessionTimeout', 'Session Timeout', 'Minutes of inactivity before auto-logout', 'text'),
        item('passwordMinLength', 'Min Password Length', 'Minimum characters required for user passwords', 'text'),
        item('mfaRequired', 'Require MFA', 'Enforce multi-factor authentication for all users', 'toggle'),
        item('accountLockout', 'Account Lockout', 'Lock account after multiple failed login attempts', 'toggle')
      ]
    },
    {
      title: 'Notifications',
      description: 'Configure system notification and alert channels.',
      items: [
        item('emailAlerts', 'Email Alerts', 'Send email notifications for critical system events', 'toggle'),
        item('smsAlerts', 'SMS Alerts', 'Send SMS notifications for P1 incidents', 'toggle'),
        item('dailySummary', 'Daily Summary', 'Email daily activity summary to administrators', 'toggle')
      ]
    },
    {
      title: 'Integrations',
      description: 'Status of connected external services and sync settings.',
      items: [
        item('adSync', 'Active Directory', 'LDAP directory synchronization status', 'select', { options: ['Connected', 'Disconnected', 'Syncing'] }),
        item('ehrIntegration', 'EHR System', 'Electronic Health Records integration', 'select', { options: ['Connected', 'Disconnected', 'Syncing'] }),
        item('siemExport', 'SIEM Export', 'Auto-export audit logs to external SIEM', 'toggle'),
        item('maintenanceMode', 'Maintenance Mode', 'Disable non-admin access for system maintenance', 'toggle')
      ]
    }
  ]
}

const sections = reactive(buildSections())

function flatten() {
  const map = {}
  for (const s of sections) {
    for (const i of s.items) map[i.key] = i.value
  }
  return map
}

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'))
    if (snap.exists()) {
      const data = snap.data()
      const rebuilt = buildSections(data)
      sections.length = 0
      sections.push(...rebuilt)
    }
  } catch {}
})

async function save() {
  if (saving.value) return
  saving.value = true
  const vals = flatten()
  try {
    await saveSettings(vals)
    await logActivity({ action: 'Update', resource: 'System Settings', details: `Updated system configuration` })
    ui.showToast('Settings saved successfully', 'success')
  } catch (err) {
    ui.showToast(mapFirebaseError(err, 'Failed to save settings.'), 'error')
  } finally {
    saving.value = false
  }
}

function reset() {
  const rebuilt = buildSections()
  sections.length = 0
  sections.push(...rebuilt)
  ui.showToast('Settings reset to defaults', 'info')
}
</script>