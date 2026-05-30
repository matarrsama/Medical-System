<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Notification Center</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">View and manage system notifications and alerts.</p>
      </div>
      <button class="text-label-md font-label-md text-primary hover:underline">Mark all as read</button>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div v-for="note in notifications" :key="note.id" class="flex items-start gap-4 p-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer" :class="!note.read ? 'bg-surface-container-low/50' : ''">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="note.iconBg">
          <span class="material-symbols-outlined text-[20px]" :class="note.iconColor">{{ note.icon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-body-md font-medium text-on-surface">{{ note.title }}</span>
              <span v-if="!note.read" class="ml-2 w-2 h-2 bg-primary rounded-full inline-block"></span>
            </div>
            <span class="text-label-sm text-on-surface-variant shrink-0">{{ note.time }}</span>
          </div>
          <p class="text-body-sm text-on-surface-variant mt-1">{{ note.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([
  { id: 1, title: 'PACS Server Restored', message: 'Radiology PACS server has been restored after maintenance.', icon: 'check_circle', iconBg: 'bg-green-100', iconColor: 'text-green-600', time: '5 min ago', read: false },
  { id: 2, title: 'SLA Breach Warning', message: 'Ticket INC-9042 is approaching SLA deadline.', icon: 'warning', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', time: '1 hour ago', read: false },
  { id: 3, title: 'New User Registered', message: 'Dr. Emily Watson has been registered and pending approval.', icon: 'person_add', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', time: '3 hours ago', read: true },
  { id: 4, title: 'Backup Completed', message: 'Nightly system backup completed successfully.', icon: 'backup', iconBg: 'bg-surface-container', iconColor: 'text-primary', time: '8 hours ago', read: true },
  { id: 5, title: 'Certificate Expiry Notice', message: 'SSL certificate for portal.hospital.org expires in 14 days.', icon: 'verified_user', iconBg: 'bg-error-container/40', iconColor: 'text-error', time: '1 day ago', read: true }
])
</script>
