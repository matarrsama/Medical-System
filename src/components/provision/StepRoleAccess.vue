<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    <button
      v-for="role in roles"
      :key="role.id"
      @click="emit('update:modelValue', role.id)"
      class="relative flex flex-col items-center p-4 rounded-xl bg-surface-container-lowest transition-all duration-200 text-center border-2"
      :class="modelValue === role.id
        ? 'border-primary bg-primary-fixed/20 shadow-sm shadow-primary/10'
        : 'border-transparent hover:border-outline-variant shadow-sm'"
    >
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-transform"
        :class="modelValue === role.id ? 'bg-primary text-white' : 'bg-surface-container text-primary'"
      >
        <span class="material-symbols-outlined text-[20px]">{{ role.icon }}</span>
      </div>
      <span class="text-label-sm font-label-sm text-on-surface leading-tight">{{ role.label }}</span>
      <div
        class="absolute top-1.5 right-1.5"
        :class="modelValue === role.id ? 'opacity-100' : 'opacity-0'"
      >
        <span class="material-symbols-outlined text-primary text-[14px] icon-fill">check_circle</span>
      </div>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])

const roles = [
  { id: 'sys_admin', label: 'Sys Administrator', icon: 'admin_panel_settings' },
  { id: 'ict_officer', label: 'ICT Officer', icon: 'terminal' },
  { id: 'physician', label: 'Physician', icon: 'stethoscope' },
  { id: 'nurse', label: 'Nurse', icon: 'local_hospital' },
  { id: 'doctor', label: 'Doctor', icon: 'medication' },
  { id: 'hospital_admin', label: 'Hospital Admin', icon: 'domain' },
  { id: 'lab_technician', label: 'Lab Technician', icon: 'biotech' },
  { id: 'pharmacist', label: 'Pharmacist', icon: 'pill' },
  { id: 'accounting', label: 'Accounting', icon: 'account_balance' },
  { id: 'procurement', label: 'Procurement', icon: 'shopping_cart' },
  { id: 'viewer', label: 'Viewer', icon: 'visibility' }
]
</script>
