<template>
  <div class="space-y-8">
    <div class="flex justify-center">
      <div class="relative">
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
        <div
          @click="fileInput?.click()"
          class="w-24 h-24 rounded-full cursor-pointer overflow-hidden border-2 border-outline-variant hover:border-primary transition-colors bg-surface-container-highest flex items-center justify-center group"
        >
          <img v-if="modelValue.avatar" :src="modelValue.avatar" class="w-full h-full object-cover" />
          <div v-else class="flex flex-col items-center gap-0.5">
            <span class="material-symbols-outlined text-3xl text-outline">photo_camera</span>
            <span class="text-[10px] text-outline font-medium">Upload</span>
          </div>
          <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">photo_camera</span>
          </div>
        </div>
      </div>
    </div>
    <div class="group">
      <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Full Name</label>
        <input
          :value="modelValue.fullName"
          @input="onNameInput"
          class="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all"
          placeholder="e.g. Dr. Julian Vane"
          type="text"
        />
    </div>
    <div class="group">
      <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Employee ID</label>
      <div class="relative">
        <input
          :value="modelValue.employeeId"
          @input="update('employeeId', $event.target.value); empIdTouched = true"
          class="w-full border rounded-xl px-4 py-3.5 pr-12 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 transition-all"
          :class="empIdTouched && !empIdValid && modelValue.employeeId ? 'bg-error-container/20 border-error focus:ring-error' : 'bg-surface-container-highest border-none focus:ring-primary'"
          placeholder="BGH-XXX-XX"
          type="text"
        />
        <button type="button" @click="generateId" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
          <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        </button>
      </div>
      <p v-if="empIdTouched && !empIdValid && modelValue.employeeId" class="mt-1 text-[11px] text-error font-medium px-1 flex items-center gap-1">
        <span class="material-symbols-outlined text-[13px]">error</span>
        Format must be BGH-XXX-XX (letters, numbers)
      </p>
      <p v-else class="mt-1 text-[11px] text-outline font-medium px-1">Click to auto-generate a unique employee ID</p>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="group">
        <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Professional Title</label>
        <input
          :value="modelValue.title"
          @input="onTitleInput"
          class="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all"
          placeholder="Senior Surgical Resident"
          type="text"
        />
      </div>
      <div class="group">
        <label class="block text-label-md font-label-md text-on-surface-variant mb-1 ml-1">Department</label>
        <div class="relative">
          <select
            :value="modelValue.department"
            @change="update('department', $event.target.value)"
            class="w-full appearance-none bg-surface-container-highest border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary transition-all"
          >
            <option disabled value="">Select Department</option>
            <option>ER</option>
            <option>Imaging & Radiology</option>
            <option>Pharmacy</option>
            <option>Infrastructure</option>
            <option>Administration</option>
            <option>Pathology Lab</option>
            <option>Finance</option>
            <option>ICT</option>
            <option>Maternity</option>
            <option>LAB</option>
            <option>Super Admin</option>
            <option>Procurement</option>
            <option>Human Resources</option>
          </select>
          <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue'])
const fileInput = ref(null)
const empIdTouched = ref(false)

const empIdValid = computed(() => /^BGH-[A-Z0-9]{3}-[A-Z0-9]{2}$/i.test(props.modelValue.employeeId))

function randChar() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return chars[Math.floor(Math.random() * chars.length)]
}

function handleFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => emit('update:modelValue', { ...props.modelValue, avatar: reader.result })
  reader.readAsDataURL(file)
}

function generateId() {
  const part1 = Array.from({ length: 3 }, () => randChar()).join('')
  const part2 = Array.from({ length: 2 }, () => randChar()).join('')
  const id = `BGH-${part1}-${part2}`
  emit('update:modelValue', { ...props.modelValue, employeeId: id })
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
  emit('update:modelValue', { ...props.modelValue, title: transformed })
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
  emit('update:modelValue', { ...props.modelValue, fullName: transformed })
}

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>
