<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div>
        <h3 class="text-headline-md font-headline-md text-primary flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">person_add</span>
          Provision New Staff
        </h3>
        <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">Step {{ currentStep }} of 3 — {{ stepLabel }}</p>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="px-6 pt-4 pb-2 shrink-0">
      <div class="flex items-center gap-0">
        <div v-for="step in 3" :key="step" class="flex items-center flex-1 last:flex-none last:w-auto">
          <div
            class="flex items-center gap-2 cursor-pointer"
            :class="step <= currentStep ? 'text-primary dark:text-inverse-primary' : 'text-outline'"
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
          :department-locked="departmentLocked"
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
          :email-error="!emailValid && wizardData.credentials.email.length > 0"
        />
      </transition>
    </div>

    <div class="flex items-center justify-between px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
      <button
        v-if="currentStep > 1"
        @click="prevStep"
        class="flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Back
      </button>
      <div v-else></div>
      <div class="flex items-center gap-3">
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-outline hover:text-on-surface dark:text-inverse-on-surface transition-colors">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { useAuditLog } from '@/composables/useAuditLog'
import { useAuthStore } from '@/stores/auth'
import { createUser } from '@/services/api'
import { sendWelcomeEmail } from '@/services/email'
import { db } from '@/lib/firebase'
import StepPersonalDetails from '@/components/provision/StepPersonalDetails.vue'
import StepRoleAccess from '@/components/provision/StepRoleAccess.vue'
import StepSecurityCredentials from '@/components/provision/StepSecurityCredentials.vue'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { logActivity } = useAuditLog()
const authStore = useAuthStore()
const currentStep = ref(1)
const saving = ref(false)

const wizardData = reactive({
  avatar: '',
  fullName: '',
  employeeId: '',
  title: '',
  department: '',
  makeDepartmentHead: false,
  phoneNumber: '+220 ',
  sex: '',
  dateOfBirth: '',
  maritalStatus: '',
  bloodGroup: '',
  nationality: '',
  district: '',
  region: '',
  homeAddress: '',
  nextOfKin: '',
  hasMedicalCondition: null,
  medicalConditionDetails: '',
  role: '',
  credentials: {
    email: '',
    password: '',
    mfa: 'push'
  }
})

const departmentLocked = computed(() => !!authStore.departmentHeadOf && !(authStore.canCreateUsers || authStore.canEditUsers))

onMounted(() => {
  if (departmentLocked.value) {
    wizardData.department = authStore.departmentHeadOf
  }
})

const stepLabel = computed(() => ['Personal Details', 'Role & Access Level', 'Security Credentials'][currentStep.value - 1])

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailValid = computed(() => emailRegex.test(wizardData.credentials.email))

const canAdvance = computed(() => {
  if (currentStep.value === 1) {
    const validId = /^BGH-[A-Z0-9]{3}-[A-Z0-9]{2}$/i.test(wizardData.employeeId)
    return wizardData.fullName && wizardData.employeeId && validId && wizardData.title && wizardData.department
      && wizardData.phoneNumber && wizardData.phoneNumber.replace(/[^0-9]/g, '').length >= 7 && wizardData.sex && wizardData.dateOfBirth && wizardData.maritalStatus
      && wizardData.nationality && wizardData.district && wizardData.region
      && wizardData.homeAddress && wizardData.nextOfKin
  }
  if (currentStep.value === 2) {
    return !!wizardData.role
  }
  return emailValid.value
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
    const result = await createUser({
      email: wizardData.credentials.email,
      password: wizardData.credentials.password,
      displayName: wizardData.fullName,
      employeeId: wizardData.employeeId,
      title: wizardData.title,
      department: wizardData.department,
      role: wizardData.role,
      mfa: wizardData.credentials.mfa,
      avatar: wizardData.avatar,
      makeDepartmentHead: wizardData.makeDepartmentHead,
      phoneNumber: wizardData.phoneNumber,
      sex: wizardData.sex,
      dateOfBirth: wizardData.dateOfBirth,
      maritalStatus: wizardData.maritalStatus,
      bloodGroup: wizardData.bloodGroup,
      nationality: wizardData.nationality,
      district: wizardData.district,
      region: wizardData.region,
      homeAddress: wizardData.homeAddress,
      nextOfKin: wizardData.nextOfKin,
      hasMedicalCondition: wizardData.hasMedicalCondition,
      medicalConditionDetails: wizardData.medicalConditionDetails
    })
    if (wizardData.makeDepartmentHead && result.uid && wizardData.department) {
      const snap = await getDocs(query(collection(db, 'departments'), where('name', '==', wizardData.department)))
      if (!snap.empty) {
        await updateDoc(doc(db, 'departments', snap.docs[0].id), {
          headId: result.uid,
          headName: wizardData.fullName
        })
      }
    }
    await logActivity({ action: 'Create', resource: `Staff ${wizardData.fullName}`, details: `Provisioned with role ${wizardData.role}` })
    sendWelcomeEmail({ name: wizardData.fullName, email: wizardData.credentials.email, employeeId: wizardData.employeeId, role: wizardData.role, department: wizardData.department })
    toast.success(`Staff "${wizardData.fullName}" provisioned successfully!`)
    emit('close')
  } catch (err) {
    toast.error(mapFirebaseError(err, 'Failed to provision user.'))
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
