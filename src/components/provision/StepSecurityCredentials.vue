<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div class="lg:col-span-7 space-y-6">
      <section class="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[18px]">vpn_key</span>
          </div>
          <h3 class="text-headline-md font-headline-md text-primary">Access Identity</h3>
        </div>
        <div class="space-y-5">
          <div>
            <label class="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1 ml-1">Clinical Email Address</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">mail</span>
              <input
                :value="modelValue.email"
                @input="update('email', $event.target.value)"
                class="w-full bg-surface-container-highest border-none rounded-xl py-3.5 pl-10 pr-4 text-body-sm text-on-surface focus:ring-1 focus:ring-primary"
                type="email"
                placeholder="a.thorne@hospital.clinic"
              />
            </div>
            <p class="mt-1 text-[10px] text-outline ml-1">Automatically generated based on clinician registry.</p>
          </div>
          <div>
            <label class="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1 ml-1">Temporal Password</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock_open</span>
              <input
                :value="modelValue.password"
                @input="update('password', $event.target.value)"
                class="w-full bg-surface-container-highest border-none rounded-xl py-3.5 pl-10 pr-20 text-body-sm text-on-surface focus:ring-1 focus:ring-primary"
                type="text"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" @click="generatePassword" class="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                </button>
                <button type="button" @click="copyPassword" class="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span class="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
            </div>
            <p class="mt-1 text-[10px] text-outline ml-1">Valid for 24 hours. User will be prompted to reset on first login.</p>
          </div>
        </div>
      </section>
      <section class="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center">
            <span class="material-symbols-outlined text-on-secondary-container text-[18px]">verified_user</span>
          </div>
          <h3 class="text-headline-md font-headline-md text-primary">MFA Configuration</h3>
        </div>
        <div class="space-y-3">
          <label
            v-for="opt in mfaOptions"
            :key="opt.id"
            class="group relative flex items-center p-4 rounded-xl bg-surface-container-low hover:bg-secondary-fixed transition-all cursor-pointer border-2"
            :class="modelValue.mfa === opt.id ? 'border-secondary bg-secondary-container/30' : 'border-transparent'"
          >
            <input type="radio" name="mfa" :value="opt.id" :checked="modelValue.mfa === opt.id" @change="update('mfa', opt.id)" class="hidden" />
            <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm mr-3">
              <span class="material-symbols-outlined text-primary text-[18px]">{{ opt.icon }}</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-primary text-label-md">{{ opt.label }}</p>
              <p class="text-[11px] text-on-surface-variant">{{ opt.desc }}</p>
            </div>
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" :class="modelValue.mfa === opt.id ? 'border-secondary bg-secondary' : 'border-outline-variant'">
              <div class="w-1.5 h-1.5 rounded-full bg-white" :class="modelValue.mfa === opt.id ? 'opacity-100' : 'opacity-0'"></div>
            </div>
          </label>
        </div>
      </section>
    </div>
    <div class="lg:col-span-5 space-y-5">
      <div class="bg-primary-container rounded-xl p-6 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 p-6 opacity-10">
          <span class="material-symbols-outlined text-8xl">person_add</span>
        </div>
        <div class="relative z-10">
          <h4 class="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4">Subject Summary</h4>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-headline font-bold">{{ initials }}</div>
            <div>
              <h5 class="text-base font-bold font-headline">{{ summary.displayName }}</h5>
              <p class="text-xs text-white/70">{{ summary.title }}</p>
            </div>
          </div>
          <div class="space-y-3 pt-3 border-t border-white/10">
            <div class="flex justify-between items-center">
              <span class="text-xs text-white/70">Department</span>
              <span class="text-xs font-mono font-bold">{{ summary.department }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-white/70">Employee ID</span>
              <span class="text-xs font-mono font-bold">{{ summary.employeeId }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-surface-container rounded-xl p-6">
        <h4 class="text-headline-md font-headline-md text-primary mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">gpp_good</span>
          Security Protocol
        </h4>
        <ul class="space-y-3">
          <li class="flex gap-3">
            <span class="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
            <p class="text-body-sm text-on-surface-variant">Passwords must be rotated every 90 days as per Hospital ICT Policy 4.2.</p>
          </li>
          <li class="flex gap-3">
            <span class="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
            <p class="text-body-sm text-on-surface-variant">Multi-factor authentication is mandatory for all clinical system endpoints.</p>
          </li>
          <li class="flex gap-3">
            <span class="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
            <p class="text-body-sm text-on-surface-variant">Identity will be locked after 3 unsuccessful login attempts.</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({ modelValue: { type: Object, required: true }, summary: { type: Object, default: () => ({ displayName: '—', title: '—', department: '—', employeeId: '—' }) } })
const emit = defineEmits(['update:modelValue'])

const toast = useToast()

const initials = computed(() => {
  const name = props.summary.displayName || ''
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
})

function randChar() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return chars[Math.floor(Math.random() * chars.length)]
}

function generatePassword() {
  const pwd = Array.from({ length: 8 }, () => randChar()).join('')
  emit('update:modelValue', { ...props.modelValue, password: pwd })
}

function copyPassword() {
  const pwd = props.modelValue.password
  if (!pwd) return
  navigator.clipboard.writeText(pwd)
  toast.success('Password copied to clipboard')
}

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

const mfaOptions = [
  { id: 'push', label: 'Push Notification', desc: 'Instant approval via Clinical Mobile App', icon: 'notifications_active' },
  { id: 'authenticator', label: 'Authenticator App', desc: 'Time-based one-time password (TOTP)', icon: 'phonelink_lock' },
  { id: 'sms', label: 'SMS Verification', desc: '6-digit code sent to registered mobile', icon: 'sms' }
]
</script>
