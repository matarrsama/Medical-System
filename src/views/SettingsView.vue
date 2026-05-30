<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">System Settings</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Configure system preferences and integrations.</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
      <div v-for="section in settingsSections" :key="section.title" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <h3 class="text-headline-sm font-headline-md text-on-surface mb-4">{{ section.title }}</h3>
        <div class="space-y-4">
          <div v-for="item in section.items" :key="item.label" class="flex items-center justify-between py-2">
            <div>
              <div class="text-body-md font-medium text-on-surface">{{ item.label }}</div>
              <div class="text-body-sm text-on-surface-variant">{{ item.description }}</div>
            </div>
            <div v-if="item.type === 'toggle'">
              <button class="w-10 h-5 rounded-full transition-colors" :class="item.value ? 'bg-primary' : 'bg-outline-variant'" @click="item.value = !item.value">
                <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" :class="item.value ? 'translate-x-5' : 'translate-x-0.5'"></div>
              </button>
            </div>
            <div v-else class="text-body-sm text-on-surface-variant">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const settingsSections = ref([
  {
    title: 'General',
    items: [
      { label: 'Hospital Name', description: 'Display name for the system', type: 'text', value: 'Main Hospital' },
      { label: 'Time Zone', description: 'System-wide time zone', type: 'text', value: 'America/New_York' },
      { label: 'Language', description: 'Default interface language', type: 'text', value: 'English (US)' }
    ]
  },
  {
    title: 'Notifications',
    items: [
      { label: 'Email Alerts', description: 'Send email notifications for critical events', type: 'toggle', value: true },
      { label: 'SMS Alerts', description: 'Send SMS for P1 incidents', type: 'toggle', value: false },
      { label: 'Daily Summary', description: 'Receive daily activity summary', type: 'toggle', value: true }
    ]
  },
  {
    title: 'Security',
    items: [
      { label: 'MFA Required', description: 'Require multi-factor authentication', type: 'toggle', value: true },
      { label: 'Session Timeout', description: 'Auto-logout after inactivity', type: 'text', value: '30 minutes' },
      { label: 'Password Policy', description: 'Minimum password requirements', type: 'text', value: 'NIST Compliant' }
    ]
  },
  {
    title: 'Integrations',
    items: [
      { label: 'Active Directory', description: 'LDAP sync status', type: 'text', value: 'Connected' },
      { label: 'EHR System', description: 'Electronic Health Records integration', type: 'text', value: 'Connected' },
      { label: 'Audit Log Export', description: 'Auto-export logs to SIEM', type: 'toggle', value: false }
    ]
  }
])
</script>
