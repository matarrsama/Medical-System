<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div>
        <h3 class="text-headline-md font-headline-md text-primary flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">person_add</span>
          Provision New User
        </h3>
        <p class="text-body-sm text-on-surface-variant mt-0.5">Step {{ currentStep }} of 3 — {{ stepLabel }}</p>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="px-6 pt-4 pb-2 shrink-0">
      <div class="flex items-center gap-0">
        <div v-for="step in 3" :key="step" class="flex items-center flex-1 last:flex-none last:w-auto">
          <div
            class="flex items-center gap-2 cursor-pointer"
            :class="step <= currentStep ? 'text-primary' : 'text-outline'"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold transition-all"
              :class="step < currentStep
                ? 'bg-secondary-container text-on-secondary-container'
                : step === currentStep
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                  : 'bg-surface-container-highest text-outline'"
            >
              <span v-if="step < currentStep" class="material-symbols-outlined text-[16px] icon-fill">check</span>
              <span v-else>{{ step }}</span>
            </div>
            <span class="text-label-sm font-label-sm hidden sm:inline">{{ ['Personal Details', 'Role & Access', 'Security Credentials'][step - 1] }}</span>
          </div>
          <div v-if="step < 3" class="flex-1 h-px mx-3" :class="step < currentStep ? 'bg-secondary-container' : 'bg-outline-variant'"></div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <transition name="fade-step" mode="out-in">
        <StepPersonalDetails
          v-if="currentStep === 1"
          :model-value="wizardData"
          @update:model-value="Object.assign(wizardData, $event)"
        />
        <StepRoleAccess
          v-else-if="currentStep === 2"
          v-model="wizardData.role"
        />
        <StepSecurityCredentials
          v-else-if="currentStep === 3"
          v-model="wizardData.credentials"
          :summary="summaryData"
        />
      </transition>
    </div>

    <div class="flex items-center justify-between px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <button
        v-if="currentStep > 1"
        @click="prevStep"
        class="flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Back
      </button>
      <div v-else></div>
      <div class="flex items-center gap-3">
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-outline hover:text-on-surface transition-colors">
          Cancel
        </button>
        <button
          v-if="currentStep < 3"
          @click="nextStep"
          :disabled="!canAdvance"
          class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        <button
          v-else
          @click="submit"
          :disabled="saving"
          class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-if="!saving" class="material-symbols-outlined text-[18px]">bolt</span>
          Complete Provisioning
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuditLog } from '@/composables/useAuditLog'
import { createUser } from '@/services/api'
import { idToLabel } from '@/data/roles'
import StepPersonalDetails from '@/components/provision/StepPersonalDetails.vue'
import StepRoleAccess from '@/components/provision/StepRoleAccess.vue'
import StepSecurityCredentials from '@/components/provision/StepSecurityCredentials.vue'

const emit = defineEmits(['close'])
const toast = useToast()
const { logActivity } = useAuditLog()
const currentStep = ref(1)
const saving = ref(false)

const wizardData = reactive({
  avatar: '',
  fullName: '',
  employeeId: '',
  title: '',
  department: '',
  role: '',
  credentials: {
    email: '',
    password: '',
    mfa: 'push'
  }
})

const stepLabel = computed(() => ['Personal Details', 'Role & Access Level', 'Security Credentials'][currentStep.value - 1])

const canAdvance = computed(() => {
  if (currentStep.value === 1) {
    const validId = /^BGH-[A-Z0-9]{3}-[A-Z0-9]{2}$/i.test(wizardData.employeeId)
    return wizardData.fullName && wizardData.employeeId && validId && wizardData.title && wizardData.department
  }
  if (currentStep.value === 2) {
    return !!wizardData.role
  }
  return true
})

const summaryData = computed(() => ({
  displayName: wizardData.fullName || '—',
  title: wizardData.title || '—',
  department: wizardData.department || '—',
  employeeId: wizardData.employeeId || '—'
}))

function nextStep() {
  if (!canAdvance.value) return
  if (currentStep.value < 3) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

async function submit() {
  if (saving.value) return
  saving.value = true
  try {
    await createUser({
      email: wizardData.credentials.email,
      password: wizardData.credentials.password,
      displayName: wizardData.fullName,
      employeeId: wizardData.employeeId,
      title: wizardData.title,
      department: wizardData.department,
      role: idToLabel(wizardData.role),
      mfa: wizardData.credentials.mfa,
      avatar: wizardData.avatar
    })
    await logActivity({ action: 'Create', resource: `User ${wizardData.fullName}`, details: `Provisioned with role ${wizardData.role}` })
    toast.success(`User "${wizardData.fullName}" provisioned successfully!`)
    emit('close')
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-step-enter-active, .fade-step-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-step-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.fade-step-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
