<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Staff Details</h3>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 rounded-full overflow-hidden bg-primary flex items-center justify-center text-on-primary text-headline-md font-bold shrink-0 border-2 border-outline-variant dark:border-outline">
          <img v-if="user.avatar" class="w-full h-full object-cover" :src="user.avatar" alt="User avatar" />
          <span v-else>{{ user.initials }}</span>
        </div>
        <div class="min-w-0">
          <h2 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface truncate">{{ user.name }}</h2>
          <p class="text-body-sm text-on-surface-variant dark:text-outline">{{ user.email }}</p>
          <div class="flex items-center gap-2 mt-1.5">
            <span :class="roleClass(user.role)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ user.role }}</span>
            <span :class="statusClass(user.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(user.status)"></span>
              {{ user.status }}
            </span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
        <div>
          <span class="text-label-sm text-outline font-medium">Employee ID</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.employeeId }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Title</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.title }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Department</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.department }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Account Created</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.created }}</p>
        </div>
      </div>
      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-3">Security & Access</h4>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
          <div>
            <span class="text-label-sm text-outline font-medium">Multi-Factor Auth</span>
            <div class="mt-0.5">
              <span :class="mfaBadgeClass" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                <span class="material-symbols-outlined text-[14px]">{{ mfaIcon }}</span>
                {{ mfaLabel }}
              </span>
            </div>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Last Active</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ timeAgo(user.lastActive) }}</p>
          </div>
        </div>
      </div>
      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-3">Biodata</h4>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
          <div>
            <span class="text-label-sm text-outline font-medium">Phone Number</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.phoneNumber || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Sex</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.sex || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Date of Birth</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.dateOfBirth || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Marital Status</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.maritalStatus || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Blood Group</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.bloodGroup || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Nationality</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.nationality || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">District</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.district || '—' }}</p>
          </div>
          <div>
            <span class="text-label-sm text-outline font-medium">Region</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.region || '—' }}</p>
          </div>
          <div class="col-span-2">
            <span class="text-label-sm text-outline font-medium">Home Address</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.homeAddress || '—' }}</p>
          </div>
          <div class="col-span-2">
            <span class="text-label-sm text-outline font-medium">Next of Kin</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.nextOfKin || '—' }}</p>
          </div>
          <div class="col-span-2">
            <span class="text-label-sm text-outline font-medium">Medical Condition</span>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ user.hasMedicalCondition ? 'Yes' : 'No' }}</p>
            <p v-if="user.hasMedicalCondition && user.medicalConditionDetails" class="text-body-sm text-on-surface-variant dark:text-outline mt-1 italic">{{ user.medicalConditionDetails }}</p>
          </div>
        </div>
      </div>
      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-3">Role Permissions</h4>
        <div class="p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface space-y-2">
          <div v-for="perm in permissions" :key="perm" class="flex items-center gap-2 text-body-sm text-on-surface dark:text-inverse-on-surface">
            <span class="material-symbols-outlined text-[16px] text-primary icon-fill">check</span>
            {{ perm }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <button v-if="auth.canEditUsers" @click="$emit('edit')" class="px-4 py-2 border border-outline-variant dark:border-outline rounded-lg text-label-md text-primary hover:bg-primary-container/20 dark:hover:bg-primary/10 transition-colors flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit
        </button>
        <button v-if="auth.canDeleteUsers && !isSuperAdmin" @click="$emit('delete')" class="px-4 py-2 border border-outline-variant dark:border-outline rounded-lg text-label-md text-error hover:bg-error-container/20 dark:hover:bg-error/10 transition-colors flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
      </div>
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant dark:border-outline rounded-lg text-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors">Close</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { timeAgo } from '@/utils/timeAgo'

const ui = useUIStore()
const auth = useAuthStore()
const user = computed(() => ui.modalData || {})

const mfaMap = { push: { label: 'Push Notification', icon: 'phone_iphone', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' }, sms: { label: 'SMS Code', icon: 'sms', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' }, none: { label: 'Not Enabled', icon: 'cancel', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' } }

const isSuperAdmin = computed(() => user.value.role === 'Sys Administrator')

const mfaBadgeClass = computed(() => mfaMap[user.value.mfa]?.cls || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300')
const mfaIcon = computed(() => mfaMap[user.value.mfa]?.icon || 'cancel')
const mfaLabel = computed(() => mfaMap[user.value.mfa]?.label || 'Not Enabled')

const perms = {
  'Sys Administrator': ['Full system access', 'User & role management', 'System configuration', 'Audit log access'],
  'ICT Officer': ['System monitoring', 'Ticket management', 'Asset inventory', 'Network administration'],
  Physician: ['Patient records (read/write)', 'EHR access', 'Prescription management', 'Order lab tests'],
  Nurse: ['Patient records (read/write)', 'Vitals management', 'Medication administration', 'Care notes'],
  Doctor: ['Patient records (full access)', 'Diagnosis management', 'Treatment planning', 'Referral management'],
  'Hospital Admin': ['Dashboard analytics', 'Department oversight', 'Report generation', 'User provisioning'],
  'Lab Technician': ['Lab order processing', 'Test result entry', 'Equipment management', 'Sample tracking'],
  Pharmacist: ['Prescription verification', 'Dispensing management', 'Inventory (pharmacy)', 'Drug interaction check'],
  Accounting: ['Billing & invoicing', 'Financial reports', 'Payment processing', 'Audit trail'],
  Procurement: ['Purchase orders', 'Vendor management', 'Budget tracking', 'Contract management'],
  Viewer: ['Read-only access', 'Dashboard view', 'Basic reports', 'No data modification']
}

const permissions = computed(() => perms[user.value.role] || ['Read-only access'])

function roleClass(role) {
  const map = {
    'Sys Administrator': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    'ICT Officer': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
    Physician: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Nurse: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    Accounting: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
    Procurement: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    'Hospital Admin': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
    'Lab Technician': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Pharmacist: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
    Doctor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
  }
  return map[role] || 'bg-surface-container text-on-surface-variant dark:text-outline'
}
function statusClass(s) {
  return s === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : s === 'Inactive' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : 'bg-error-container/40 text-on-error-container'
}
function statusDot(s) {
  return s === 'Active' ? 'bg-green-600' : s === 'Inactive' ? 'bg-gray-400' : 'bg-error'
}
</script>