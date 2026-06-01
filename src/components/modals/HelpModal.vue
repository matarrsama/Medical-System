<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between p-6 pb-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span class="material-symbols-outlined text-on-primary">help</span>
        </div>
        <div>
          <h3 class="text-headline-sm font-headline-md text-on-surface">Help & Guide</h3>
          <p class="text-body-sm text-on-surface-variant">How to use the Medical Records System</p>
        </div>
      </div>
      <button @click="ui.closeModal()" class="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <div v-for="section in sections" :key="section.title" class="border border-outline-variant rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-primary text-[20px]">{{ section.icon }}</span>
          <h4 class="text-title-md font-label-md text-on-surface">{{ section.title }}</h4>
        </div>
        <div v-for="(item, i) in section.items" :key="i" class="ml-8 mb-2 last:mb-0">
          <p class="text-body-sm font-label-sm text-on-surface-variant">{{ item }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

const sections = [
  {
    icon: 'flag',
    title: 'Ticket Statuses',
    items: [
      'Open — New ticket created, not yet reviewed.',
      'Assigned — A technician has been assigned to investigate.',
      'Investigating — Currently being diagnosed or worked on.',
      'Pending Vendor — Waiting on third-party vendor or supplier.',
      'Resolved — Solution applied, pending confirmation.',
      'Closed — Ticket completed and confirmed.'
    ]
  },
  {
    icon: 'add_circle',
    title: 'Creating Records',
    items: [
      'Use the +New Ticket button in the top bar to report an issue.',
      'Use the + buttons on each page (Inventory, Requests, etc.) to create records.',
      'Required fields are marked with an asterisk (*).',
      'Tickets assigned to a user are automatically set to "Assigned" status.'
    ]
  },
  {
    icon: 'manage_accounts',
    title: 'User Roles',
    items: [
      'ICT Officer — Can manage tickets, inventory, and perform daily operations.',
      'Sys Administrator — Full system access including user management and settings.',
      'Super Admin — Cross-tenant administration and global settings.',
      'Department Head — Can view department-specific data and approve requests.'
    ]
  },
  {
    icon: 'search',
    title: 'Search & Navigation',
    items: [
      'Use the search bar in the top nav to find tickets, assets, and users.',
      'The sidebar provides quick access to all main modules.',
      'Use the theme toggle (contrast icon) to switch between light and dark mode.'
    ]
  },
  {
    icon: 'contact_support',
    title: 'Need More Help?',
    items: [
      '      Contact the developer Matarr Sama — matarrsama@gmail.com / +220 7477551',
      'Report technical problems via the New Ticket form.',
      'Check the Notifications page for system announcements and alerts.'
    ]
  }
]
</script>
