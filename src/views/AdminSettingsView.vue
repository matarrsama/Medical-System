<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Admin Settings</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage system-wide configuration and preferences.</p>
      </div>
      <div class="flex items-center gap-2 mt-3 sm:mt-0">
        <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-label-sm font-label-sm">
          <span class="material-symbols-outlined text-[14px]">admin_panel_settings</span>
          Sys Admin Only
        </span>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-lg">
      <div v-for="section in sections" :key="section.title" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <h3 class="text-headline-sm font-headline-md text-on-surface mb-1">{{ section.title }}</h3>
        <p class="text-body-sm text-on-surface-variant mb-5">{{ section.description }}</p>
        <div class="space-y-4">
          <div v-for="item in section.items" :key="item.label" class="pb-4 border-b border-outline-variant/30 last:border-0 last:pb-0">
            <label class="block text-label-md font-label-md text-on-surface mb-1.5">{{ item.label }}</label>
            <p class="text-body-sm text-on-surface-variant mb-2.5">{{ item.description }}</p>
            <input v-if="item.type === 'text'" v-model="item.value" class="w-full bg-surface-container-highest border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all" type="text" />
            <select v-else-if="item.type === 'select'" v-model="item.value" class="w-full appearance-none bg-surface-container-highest border-none rounded-lg px-3.5 py-2.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary transition-all">
              <option v-for="opt in item.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <div v-else-if="item.type === 'toggle'" class="flex items-center gap-3">
              <button class="w-10 h-5 rounded-full transition-colors relative" :class="item.value ? 'bg-primary' : 'bg-outline-variant'" @click="item.value = !item.value">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5" :class="item.value ? 'left-5' : 'left-0.5'"></div>
              </button>
              <span class="text-body-sm text-on-surface">{{ item.value ? 'Enabled' : 'Disabled' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end gap-3">
      <button @click="reset" class="px-4 py-2 border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors">Reset to Defaults</button>
      <button @click="save" class="px-5 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors">Save Settings</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

const defaults = {
  hospitalName: 'Main Hospital',
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

function buildSections() {
  return [
    {
      title: 'General',
      description: 'Basic system identification and regional preferences.',
      items: [
        { label: 'Hospital Name', description: 'Display name for the system', type: 'text', value: defaults.hospitalName },
        { label: 'System Display Name', description: 'Title shown in the sidebar and browser tab', type: 'text', value: defaults.displayName },
        { label: 'Time Zone', description: 'System-wide time zone for all logs and schedules', type: 'select', value: defaults.timeZone, options: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Tokyo', 'UTC'] },
        { label: 'Language', description: 'Default interface language', type: 'select', value: defaults.language, options: ['English (US)', 'English (UK)', 'French', 'Spanish', 'Arabic'] },
        { label: 'Date Format', description: 'How dates are displayed throughout the system', type: 'select', value: defaults.dateFormat, options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
        { label: 'Currency', description: 'Default currency for financial modules', type: 'select', value: defaults.currency, options: ['USD ($)', 'EUR (€)', 'GBP (£)', 'KES (KSh)'] }
      ]
    },
    {
      title: 'Security',
      description: 'Authentication, password policy, and access control settings.',
      items: [
        { label: 'Session Timeout', description: 'Minutes of inactivity before auto-logout', type: 'text', value: defaults.sessionTimeout },
        { label: 'Min Password Length', description: 'Minimum characters required for user passwords', type: 'text', value: defaults.passwordMinLength },
        { label: 'Require MFA', description: 'Enforce multi-factor authentication for all users', type: 'toggle', value: defaults.mfaRequired },
        { label: 'Account Lockout', description: 'Lock account after multiple failed login attempts', type: 'toggle', value: defaults.accountLockout }
      ]
    },
    {
      title: 'Notifications',
      description: 'Configure system notification and alert channels.',
      items: [
        { label: 'Email Alerts', description: 'Send email notifications for critical system events', type: 'toggle', value: defaults.emailAlerts },
        { label: 'SMS Alerts', description: 'Send SMS notifications for P1 incidents', type: 'toggle', value: defaults.smsAlerts },
        { label: 'Daily Summary', description: 'Email daily activity summary to administrators', type: 'toggle', value: defaults.dailySummary }
      ]
    },
    {
      title: 'Integrations',
      description: 'Status of connected external services and sync settings.',
      items: [
        { label: 'Active Directory', description: 'LDAP directory synchronization status', type: 'select', value: defaults.adSync, options: ['Connected', 'Disconnected', 'Syncing'] },
        { label: 'EHR System', description: 'Electronic Health Records integration', type: 'select', value: defaults.ehrIntegration, options: ['Connected', 'Disconnected', 'Syncing'] },
        { label: 'SIEM Export', description: 'Auto-export audit logs to external SIEM', type: 'toggle', value: defaults.siemExport },
        { label: 'Maintenance Mode', description: 'Disable non-admin access for system maintenance', type: 'toggle', value: defaults.maintenanceMode }
      ]
    }
  ]
}

const sections = reactive(buildSections())

function flatten() {
  const map = {}
  for (const s of sections) {
    for (const i of s.items) map[i.label] = i.value
  }
  return map
}

function save() {
  const vals = flatten()
  ui.showToast('Settings saved successfully', 'success')
}

function reset() {
  buildSections()
  ui.showToast('Settings reset to defaults', 'info')
}
</script>