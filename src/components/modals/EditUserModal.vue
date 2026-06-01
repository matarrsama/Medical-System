<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <h3 class="text-headline-sm font-headline-md text-on-surface">Edit User</h3>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex justify-center">
        <div class="relative">
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
          <div @click="fileInput?.click()" class="w-24 h-24 rounded-full cursor-pointer overflow-hidden border-2 border-outline-variant hover:border-primary transition-colors bg-surface-container-highest flex items-center justify-center group">
            <img v-if="form.avatar" :src="form.avatar" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-primary flex items-center justify-center text-on-primary text-headline-md font-bold">{{ initials }}</div>
            <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">photo_camera</span>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="group col-span-2">
          <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Full Name <span class="text-error">*</span></label>
          <input v-model="form.name" @input="onNameInput" class="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. Dr. Julian Vane" type="text" required />
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Employee ID <span class="text-error">*</span></label>
          <div class="relative">
            <input v-model="form.employeeId" @input="empIdTouched = true" class="w-full border rounded-xl px-4 py-3.5 pr-12 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 transition-all" :class="empIdTouched && !empIdValid && form.employeeId ? 'bg-error-container/20 border-error focus:ring-error' : 'bg-surface-container-highest border-none focus:ring-primary'" placeholder="BGH-XXX-XX" type="text" required />
            <button type="button" @click="generateId" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
            </button>
          </div>
          <p v-if="empIdTouched && !empIdValid && form.employeeId" class="mt-1 text-[11px] text-error font-medium px-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">error</span>
            Format must be BGH-XXX-XX (letters, numbers)
          </p>
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Professional Title <span class="text-error">*</span></label>
          <input v-model="form.title" @input="onTitleInput" class="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all" placeholder="Senior Surgical Resident" type="text" required />
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Department <span class="text-error">*</span></label>
          <div class="relative">
            <select v-model="form.department" class="w-full appearance-none bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary transition-all" required>
              <option disabled value="">Select Department</option>
              <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
          </div>
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Email <span class="text-error">*</span></label>
          <input v-model="form.email" class="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all" placeholder="user@hospital.org" type="email" required />
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Status <span class="text-error">*</span></label>
          <div class="relative">
            <select v-model="form.status" class="w-full appearance-none bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary transition-all" required>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
          </div>
        </div>
      </div>
      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant mb-3">Role & Access <span class="text-error">*</span></h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button v-for="role in roles" :key="role.id" @click="form.role = role.id" class="relative flex flex-col items-center p-4 rounded-xl bg-surface-container-lowest transition-all duration-200 text-center border-2" :class="form.role === role.id ? 'border-primary bg-primary-fixed/20 shadow-sm shadow-primary/10' : 'border-transparent hover:border-outline-variant shadow-sm'">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-transform" :class="form.role === role.id ? 'bg-primary text-white' : 'bg-surface-container text-primary'">
              <span class="material-symbols-outlined text-[20px]">{{ role.icon }}</span>
            </div>
            <span class="text-label-sm font-label-sm text-on-surface leading-tight">{{ role.label }}</span>
            <div class="absolute top-1.5 right-1.5" :class="form.role === role.id ? 'opacity-100' : 'opacity-0'">
              <span class="material-symbols-outlined text-primary text-[14px] icon-fill">check_circle</span>
            </div>
          </button>
        </div>
      </div>
      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant mb-3">Multi-Factor Authentication</h4>
        <div class="flex gap-3">
          <button v-for="opt in mfaOptions" :key="opt.value" @click="form.mfa = opt.value" class="flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all" :class="form.mfa === opt.value ? 'border-primary bg-primary-fixed/20 shadow-sm shadow-primary/10' : 'border-outline-variant hover:border-outline bg-surface-container-lowest'">
            <span class="material-symbols-outlined text-[20px]" :class="form.mfa === opt.value ? 'text-primary' : 'text-outline'">{{ opt.icon }}</span>
            <span class="text-label-sm font-label-sm text-on-surface">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
      <button @click="save" :disabled="!canSave || saving" class="px-4 py-2 rounded-lg text-label-md font-label-md transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed" :class="canSave && !saving ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container-high text-on-surface'">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        Save Changes
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useDepartmentsStore } from '@/stores/departments'
import { updateUser } from '@/services/api'
import { labelToId, idToLabel } from '@/data/roles'
import { useAuditLog } from '@/composables/useAuditLog'

const ui = useUIStore()
const { logActivity } = useAuditLog()
const emit = defineEmits(['close'])
const fileInput = ref(null)
const empIdTouched = ref(false)
const saving = ref(false)
const deptStore = useDepartmentsStore()

const user = computed(() => ui.modalData || {})

const form = reactive({
  avatar: user.value.avatar || '',
  name: user.value.name || '',
  employeeId: user.value.employeeId || '',
  title: user.value.title || '',
  department: user.value.department || '',
  email: user.value.email || '',
  role: labelToId(user.value.role) || user.value.role || '',
  mfa: user.value.mfa || 'push',
  status: user.value.status || 'Active'
})

const initials = computed(() => {
  if (!form.name) return '?'
  return form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const empIdValid = computed(() => /^BGH-[A-Z0-9]{3}-[A-Z0-9]{2}$/i.test(form.employeeId))

const canSave = computed(() => form.name && form.employeeId && empIdValid.value && form.title && form.department && form.email && form.role)

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

const mfaOptions = [
  { value: 'push', label: 'Push Notification', icon: 'phone_iphone' },
  { value: 'sms', label: 'SMS Code', icon: 'sms' },
  { value: 'none', label: 'Not Enabled', icon: 'cancel' }
]

function randChar() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return chars[Math.floor(Math.random() * chars.length)]
}

function generateId() {
  const part1 = Array.from({ length: 3 }, () => randChar()).join('')
  const part2 = Array.from({ length: 2 }, () => randChar()).join('')
  form.employeeId = `BGH-${part1}-${part2}`
}

function handleFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { form.avatar = reader.result }
  reader.readAsDataURL(file)
}

function onNameInput(e) {
  const el = e.target
  const start = el.selectionStart
  const end = el.selectionEnd
  const raw = el.value
  const transformed = raw.replace(/\b\w/g, c => c.toUpperCase())
  if (transformed !== raw) {
    el.value = transformed
    el.setSelectionRange(start, end)
  }
  form.name = transformed
}

function onTitleInput(e) {
  const el = e.target
  const start = el.selectionStart
  const end = el.selectionEnd
  const raw = el.value
  const transformed = raw.charAt(0).toUpperCase() + raw.slice(1)
  if (transformed !== raw) {
    el.value = transformed
    el.setSelectionRange(start, end)
  }
  form.title = transformed
}

async function save() {
  if (!canSave.value || saving.value) return
  saving.value = true
  try {
    await updateUser({
      uid: user.value.uid,
      email: form.email,
      displayName: form.name,
      employeeId: form.employeeId,
      title: form.title,
      department: form.department,
      role: idToLabel(form.role),
      mfa: form.mfa,
      status: form.status,
      avatar: form.avatar
    })
    await logActivity({ action: 'Update', resource: `User ${form.name}`, details: `Updated profile: ${form.title}, ${form.department}, role: ${form.role}` })
    Object.assign(user.value, {
      name: form.name,
      initials: form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      employeeId: form.employeeId,
      title: form.title,
      department: form.department,
      email: form.email,
      role: idToLabel(form.role),
      mfa: form.mfa,
      status: form.status,
      avatar: form.avatar
    })
    ui.showToast(`${form.name} updated successfully`, 'success')
    emit('close')
  } catch (err) {
    ui.showToast(err.message, 'error')
  } finally {
    saving.value = false
  }
}

</script>
