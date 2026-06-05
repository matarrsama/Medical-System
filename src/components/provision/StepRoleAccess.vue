<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    <div v-if="loading" class="col-span-full flex justify-center py-8">
      <span class="material-symbols-outlined animate-spin text-[24px] text-primary">sync</span>
    </div>
    <button
      v-for="r in availableRoles"
      :key="r.name"
      @click="emit('update:modelValue', r.name)"
      class="relative flex flex-col items-center p-4 rounded-xl bg-surface-container-lowest dark:bg-inverse-surface transition-all duration-200 text-center border-2"
      :class="modelValue === r.name
        ? 'border-primary bg-primary-fixed/20 shadow-sm shadow-primary/10'
        : 'border-transparent hover:border-outline-variant dark:hover:border-outline shadow-sm'"
    >
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-transform"
        :class="modelValue === r.name ? 'bg-primary text-white' : 'bg-surface-container text-primary dark:bg-white/[0.08] dark:text-inverse-primary'"
      >
        <span class="material-symbols-outlined text-[20px]">{{ roleIcon(r.name) }}</span>
      </div>
      <span class="text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface leading-tight">{{ r.name }}</span>
      <div
        class="absolute top-1.5 right-1.5"
        :class="modelValue === r.name ? 'opacity-100' : 'opacity-0'"
      >
        <span class="material-symbols-outlined text-primary text-[14px] icon-fill">check_circle</span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const authStore = useAuthStore()

const roles = ref([])
const loading = ref(true)
let unsub = null

const availableRoles = computed(() =>
  roles.value.filter(r => {
    if (r.active === false) return false
    if (r.name === 'Sys Administrator' && !authStore.isSuperAdmin) return false
    return true
  })
)

const ROLE_ICONS = {
  'Sys Administrator': 'admin_panel_settings',
  'ICT Officer': 'terminal',
  'Physician': 'stethoscope',
  'Nurse': 'local_hospital',
  'Doctor': 'medication',
  'Hospital Admin': 'domain',
  'Lab Technician': 'biotech',
  'Pharmacist': 'pill',
  'Accounting': 'account_balance',
  'Procurement': 'shopping_cart',
  'Viewer': 'visibility'
}

function roleIcon(name) {
  return ROLE_ICONS[name] || 'badge'
}

onMounted(() => {
  unsub = onSnapshot(collection(db, 'roles'), (snap) => {
    roles.value = snap.docs.map(d => d.data())
    loading.value = false
  }, () => { loading.value = false })
})

onUnmounted(() => {
  if (unsub) unsub()
})
</script>
