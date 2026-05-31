<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">medical_services</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Add Biomedical Equipment</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">Register new medical equipment in the system</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <div class="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/50">
        <span class="material-symbols-outlined text-primary text-[20px]">tag</span>
        <div>
          <span class="text-label-sm text-outline font-medium">Equipment ID</span>
          <p class="text-body-md text-on-surface font-mono font-medium mt-0.5">{{ equipmentId || 'Generating…' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Equipment Name <span class="text-error">*</span></label>
          <input v-model="form.name" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Type</label>
          <select v-model="form.type" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
            <option>Diagnostic</option><option>Therapeutic</option><option>Monitoring</option><option>Laboratory</option><option>Surgical</option><option>Imaging</option><option>Other</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Department</label>
          <select v-if="canChooseDepartment" v-model="form.department" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
            <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
          </select>
          <div v-else class="flex items-center gap-2 mt-1 px-3 py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container text-body-sm text-on-surface font-medium">
            <span class="material-symbols-outlined text-[16px] text-outline">business</span>
            {{ userDept }}
          </div>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Status</label>
          <select v-model="form.status" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
            <option>Operational</option><option>Needs Calibration</option><option>Out of Service</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Manufacturer</label>
          <input v-model="form.manufacturer" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Model</label>
          <input v-model="form.model" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Serial Number</label>
          <input v-model="form.serialNumber" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Location</label>
          <input v-model="form.location" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" placeholder="e.g. Room 101, Building A" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Last Calibration</label>
          <input v-model="form.lastCalibration" type="date" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Next Calibration</label>
          <input v-model="form.nextCalibration" type="date" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface">Description</label>
        <textarea v-model="form.description" rows="3" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
      </div>
    </form>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
        Cancel
      </button>
      <button @click="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">add</span>
        Add Equipment
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useCounter } from '@/composables/useCounter'
import { useAuthStore } from '@/stores/auth'
import { useAuditLog } from '@/composables/useAuditLog'
import { useDepartmentsStore } from '@/stores/departments'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { nextVal } = useCounter()
const authStore = useAuthStore()
const { logActivity } = useAuditLog()
const canChooseDepartment = computed(() =>
  ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(authStore.role)
)

const form = reactive({
  name: '', type: 'Diagnostic', department: '', status: 'Operational',
  manufacturer: '', model: '', serialNumber: '', location: '',
  lastCalibration: '', nextCalibration: '', description: ''
})

async function submit() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'equipment'), {
      equipmentId: equipmentId.value,
      name: form.name,
      type: form.type,
      department: form.department || userDept.value,
      status: form.status,
      manufacturer: form.manufacturer || null,
      model: form.model || null,
      serialNumber: form.serialNumber || null,
      location: form.location || null,
      lastCalibration: form.lastCalibration || null,
      nextCalibration: form.nextCalibration || null,
      description: form.description || null,
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Equipment ${equipmentId.value}`, details: `Added "${form.name}" (${form.type})` })
    toast.success(`Equipment ${equipmentId.value} added successfully!`)
    emit('close')
  } catch (err) {
    console.error('[NewEquipmentModal] error creating equipment:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to add equipment.' : 'Failed to add equipment.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const year = new Date().getFullYear()
    equipmentId.value = await nextVal(`equipmentId_${year}`, { prefix: `EQP-${year}-`, pad: 3, starting: 1 })
  } catch (err) {
    console.warn('[NewEquipmentModal] counter unavailable, using client-side ID:', err)
    equipmentId.value = `EQP-${new Date().getFullYear()}-${Date.now().toString(36).slice(-3).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
  }
  const uid = auth.currentUser?.uid
  if (uid) {
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (userSnap.exists()) {
      userDept.value = userSnap.data().department || ''
      form.department = userDept.value
    }
  }
})

onUnmounted(() => {})
</script>
