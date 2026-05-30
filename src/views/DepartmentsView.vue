<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Departments</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage hospital departments, contacts, and configurations.</p>
      </div>
      <button @click="ui.openModal('AddDepartment')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Department
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
      <div v-for="dept in departments" :key="dept.name" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg" :class="dept.colorClass + ' flex items-center justify-center'">
            <span class="material-symbols-outlined text-on-primary">{{ dept.icon }}</span>
          </div>
          <div>
            <h3 class="text-body-md font-bold text-on-surface">{{ dept.name }}</h3>
            <p class="text-label-sm text-on-surface-variant">{{ dept.head }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between text-label-sm text-on-surface-variant mt-4 pt-3 border-t border-outline-variant/30">
          <span>{{ dept.staffCount }} staff</span>
          <span>{{ dept.devices }} devices</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'
const ui = useUIStore()

const departments = ref([
  { name: 'Emergency Room', head: 'Dr. Sarah Chen', icon: 'local_hospital', staffCount: 48, devices: 156, colorClass: 'bg-error' },
  { name: 'Imaging & Radiology', head: 'Dr. James Mitchell', icon: 'radiology', staffCount: 32, devices: 89, colorClass: 'bg-primary' },
  { name: 'Pharmacy', head: 'Mark Thompson', icon: 'medication', staffCount: 24, devices: 45, colorClass: 'bg-tertiary' },
  { name: 'Infrastructure', head: 'Ahmed Al-Rashid', icon: 'dns', staffCount: 18, devices: 234, colorClass: 'bg-secondary' },
  { name: 'Administration', head: 'Lisa Thompson', icon: 'admin_panel_settings', staffCount: 15, devices: 67, colorClass: 'bg-surface-variant text-on-surface' },
  { name: 'Pathology Lab', head: 'Dr. James Wilson', icon: 'biotech', staffCount: 12, devices: 34, colorClass: 'bg-primary-container' },
  { name: 'Finance', head: 'John Mwangi', icon: 'account_balance', staffCount: 10, devices: 28, colorClass: 'bg-pink-500' },
  { name: 'ICT', head: 'Ahmed Al-Rashid', icon: 'computer', staffCount: 22, devices: 189, colorClass: 'bg-cyan-600' },
  { name: 'Maternity', head: 'Dr. Mary Wanjiku', icon: 'pregnancy', staffCount: 56, devices: 112, colorClass: 'bg-rose-500' },
  { name: 'LAB', head: 'Dr. James Wilson', icon: 'science', staffCount: 18, devices: 67, colorClass: 'bg-amber-600' },
  { name: 'Super Admin', head: 'Dr. Peter Kamau', icon: 'shield', staffCount: 5, devices: 45, colorClass: 'bg-purple-600' },
  { name: 'Procurement', head: 'Grace Akinyi', icon: 'shopping_cart', staffCount: 8, devices: 22, colorClass: 'bg-orange-600' },
  { name: 'Human Resources', head: 'Jane Wanjiku', icon: 'badge', staffCount: 7, devices: 18, colorClass: 'bg-teal-600' }
])
</script>
