<template>
  <div class="space-y-8">
    <div class="flex justify-center">
      <div class="relative">
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
        <div
          @click="fileInput?.click()"
          class="w-24 h-24 rounded-full cursor-pointer overflow-hidden border-2 border-outline-variant dark:border-outline hover:border-primary transition-colors bg-surface-container-highest dark:bg-inverse-surface flex items-center justify-center group"
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
      <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Full Name <span class="text-error">*</span></label>
        <input
          :value="modelValue.fullName"
          @input="onNameInput"
          class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
          placeholder="e.g. Dr. Julian Vane"
          type="text"
          required
        />
    </div>
    <div class="group">
      <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Employee ID <span class="text-error">*</span></label>
      <div class="relative">
        <input
          :value="modelValue.employeeId"
          @input="update('employeeId', $event.target.value); empIdTouched = true"
          class="w-full border rounded-xl px-4 py-3.5 pr-12 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 transition-all"
          :class="empIdTouched && !empIdValid && modelValue.employeeId ? 'bg-error-container/20 border-error focus:ring-error' : 'bg-surface-container-highest dark:bg-inverse-surface border-none focus:ring-primary'"
          placeholder="BGH-XXX-XX"
          type="text"
          required
        />
        <button type="button" @click="generateId" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-surface-container-low dark:bg-inverse-surface text-primary dark:text-inverse-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
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
        <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Professional Title <span class="text-error">*</span></label>
        <input
          :value="modelValue.title"
          @input="onTitleInput"
          class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
          placeholder="Senior Surgical Resident"
          type="text"
          required
        />
      </div>
      <div class="group">
        <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Department <span class="text-error">*</span></label>
        <div class="relative">
          <select
            :value="modelValue.department"
            @change="onDeptChange($event.target.value)"
            class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all"
            :disabled="departmentLocked"
            required
          >
            <option disabled value="">Select Department</option>
            <option v-for="dept in departments" :key="dept.name" :value="dept.name">{{ dept.name }}</option>
          </select>
          <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
        </div>
        <label v-if="modelValue.department" class="flex items-center gap-2 mt-2 px-1 cursor-pointer" :class="deptHasHead ? 'opacity-40 cursor-not-allowed' : ''">
          <input type="checkbox" :checked="modelValue.makeDepartmentHead" @change="update('makeDepartmentHead', $event.target.checked)" :disabled="deptHasHead" class="rounded border-outline-variant dark:border-outline text-primary dark:text-inverse-primary focus:ring-primary" />
          <span class="text-label-sm font-label-sm text-on-surface dark:text-inverse-on-surface">Make department head</span>
          <span v-if="deptHasHead" class="text-label-xs text-on-surface-variant dark:text-outline">(already assigned)</span>
        </label>
      </div>
    </div>
    <div class="border-t border-outline-variant/50 dark:border-outline/50 pt-6">
      <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-4">Biodata Information</h4>
      <div class="grid grid-cols-2 gap-4">
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Phone Number <span class="text-error">*</span></label>
          <input
            :value="modelValue.phoneNumber"
            @input="update('phoneNumber', formatPhone($event.target.value))"
            class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
            placeholder="+220 000 0000"
            type="tel"
            required
          />
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Sex <span class="text-error">*</span></label>
          <div class="relative">
            <select
              :value="modelValue.sex"
              @input="update('sex', $event.target.value)"
              class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all"
              required
            >
              <option disabled value="">Select Sex</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
          </div>
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Date of Birth <span class="text-error">*</span></label>
          <input
            :value="modelValue.dateOfBirth"
            @input="update('dateOfBirth', $event.target.value)"
            class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
            type="date"
            required
          />
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Marital Status <span class="text-error">*</span></label>
          <div class="relative">
            <select
              :value="modelValue.maritalStatus"
              @input="update('maritalStatus', $event.target.value)"
              class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all"
              required
            >
              <option disabled value="">Select Status</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
          </div>
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Blood Group</label>
          <div class="relative">
            <select
              :value="modelValue.bloodGroup"
              @input="update('bloodGroup', $event.target.value)"
              class="w-full appearance-none bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
          </div>
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Nationality <span class="text-error">*</span></label>
          <input
            :value="modelValue.nationality"
            @input="update('nationality', $event.target.value)"
            class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
            placeholder="e.g. Gambian"
            type="text"
            required
          />
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">District <span class="text-error">*</span></label>
          <input
            :value="modelValue.district"
            @input="update('district', $event.target.value)"
            class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
            placeholder="e.g. Kanifing"
            type="text"
            required
          />
        </div>
        <div class="group">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Region <span class="text-error">*</span></label>
          <input
            :value="modelValue.region"
            @input="update('region', $event.target.value)"
            class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
            placeholder="e.g. Greater Banjul"
            type="text"
            required
          />
        </div>
        <div class="group col-span-2">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Home Address <span class="text-error">*</span></label>
          <textarea
            :value="modelValue.homeAddress"
            @input="update('homeAddress', $event.target.value)"
            class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all resize-none"
            placeholder="e.g. 123 Kairaba Avenue, Banjul"
            rows="2"
            required
          ></textarea>
        </div>
        <div class="group col-span-2">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Next of Kin <span class="text-error">*</span></label>
          <input
            :value="modelValue.nextOfKin"
            @input="update('nextOfKin', $event.target.value)"
            class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
            placeholder="e.g. Mary Jane, +220 000 0000"
            type="text"
            required
          />
        </div>
        <div class="group col-span-2">
          <label class="block text-label-md font-label-md text-on-surface-variant dark:text-outline mb-1 ml-1">Any Medical Condition? <span class="text-error">*</span></label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" :value="true" :checked="modelValue.hasMedicalCondition === true" @change="update('hasMedicalCondition', true)" class="text-primary focus:ring-primary" />
              <span class="text-body-sm text-on-surface dark:text-inverse-on-surface">Yes</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" :value="false" :checked="modelValue.hasMedicalCondition === false" @change="update('hasMedicalCondition', false)" class="text-primary focus:ring-primary" />
              <span class="text-body-sm text-on-surface dark:text-inverse-on-surface">No</span>
            </label>
          </div>
          <div v-if="modelValue.hasMedicalCondition" class="mt-3">
            <textarea
              :value="modelValue.medicalConditionDetails"
              @input="update('medicalConditionDetails', $event.target.value)"
              class="w-full bg-surface-container-highest dark:bg-inverse-surface border-none rounded-xl px-4 py-3.5 text-body-sm text-on-surface dark:text-inverse-on-surface placeholder:text-outline/50 dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-all resize-none"
              placeholder="Please specify your medical condition(s)"
              rows="2"
              required
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { formatPhone } from '@/utils/formatPhone'

const props = defineProps({ modelValue: { type: Object, required: true }, departmentLocked: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue'])
const fileInput = ref(null)
const empIdTouched = ref(false)
const departments = ref([])
let unsubDepts = null

const empIdValid = computed(() => /^BGH-[A-Z0-9]{3}-[A-Z0-9]{2}$/i.test(props.modelValue.employeeId))

const deptHasHead = computed(() => {
  if (!props.modelValue.department) return true
  const dept = departments.value.find(d => d.name === props.modelValue.department)
  return !!dept?.headId
})

function onDeptChange(value) {
  const updatePayload = { department: value }
  if (value !== props.modelValue.department) {
    updatePayload.makeDepartmentHead = false
  }
  emit('update:modelValue', { ...props.modelValue, ...updatePayload })
}

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

onMounted(() => {
  unsubDepts = onSnapshot(collection(db, 'departments'), (snap) => {
    departments.value = snap.docs.map(d => ({ name: d.data().name, headId: d.data().headId || null }))
  })
})

onUnmounted(() => {
  if (unsubDepts) unsubDepts()
})
</script>
