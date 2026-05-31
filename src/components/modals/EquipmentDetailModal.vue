<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">medical_services</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">{{ editing ? 'Edit Equipment' : 'Equipment Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">{{ equipment.equipmentId || equipment.id }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <template v-if="editing">
            <input v-model="editForm.name" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-headline-sm font-headline-md bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <h2 class="text-headline-sm font-headline-md text-on-surface">{{ equipment.name }}</h2>
          </template>
          <div class="flex items-center gap-3 mt-2">
            <span :class="typeClass(editing ? editForm.type : equipment.type)" class="px-2.5 py-0.5 rounded text-label-sm font-label-sm">{{ editing ? editForm.type : equipment.type }}</span>
            <span :class="statusClass(editing ? editForm.status : equipment.status)" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(editing ? editForm.status : equipment.status)"></span>
              {{ editing ? editForm.status : equipment.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low">
        <div>
          <span class="text-label-sm text-outline font-medium">Equipment ID</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5 font-mono">{{ equipment.equipmentId || equipment.id }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Type</span>
          <template v-if="editing">
            <select v-model="editForm.type" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Diagnostic</option><option>Therapeutic</option><option>Monitoring</option><option>Laboratory</option><option>Surgical</option><option>Imaging</option><option>Other</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.type || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Department</span>
          <template v-if="editing">
            <select v-model="editForm.department" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.department || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Status</span>
          <template v-if="editing">
            <select v-model="editForm.status" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Operational</option><option>Needs Calibration</option><option>Out of Service</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.status || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Manufacturer</span>
          <template v-if="editing">
            <input v-model="editForm.manufacturer" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.manufacturer || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Model</span>
          <template v-if="editing">
            <input v-model="editForm.model" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.model || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Serial Number</span>
          <template v-if="editing">
            <input v-model="editForm.serialNumber" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.serialNumber || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Location</span>
          <template v-if="editing">
            <input v-model="editForm.location" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.location || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Last Calibration</span>
          <template v-if="editing">
            <input v-model="editForm.lastCalibration" type="date" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.lastCalibration || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Next Calibration</span>
          <template v-if="editing">
            <input v-model="editForm.nextCalibration" type="date" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.nextCalibration || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created by</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ equipment.createdByName || equipment.createdBy || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ formatDate(equipment.created) }}</p>
        </div>
      </div>

      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant mb-2">Description</h4>
        <template v-if="editing">
          <textarea v-model="editForm.description" rows="4" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
        </template>
        <template v-else>
          <p class="text-body-md text-on-surface bg-surface-container-low rounded-xl p-4 whitespace-pre-wrap">{{ equipment.description || 'No description provided.' }}</p>
        </template>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <template v-if="editing">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
          Cancel
        </button>
        <button @click="save" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </template>
      <template v-else>
        <button @click="deleteEquipment" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { useDepartmentsStore } from '@/stores/departments'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'

const ui = useUIStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const modalData = computed(() => ui.modalData || {})
const equipData = ref(modalData.value.equipment || modalData.value)
const equipment = computed(() => equipData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
const deptStore = useDepartmentsStore()
let unsubEquip = null

const editForm = reactive({
  name: '', type: '', status: '', department: '', manufacturer: '', model: '',
  serialNumber: '', location: '', lastCalibration: '', nextCalibration: '', description: ''
})

function startEdit() {
  Object.assign(editForm, {
    name: equipment.value.name || '',
    type: equipment.value.type || 'Diagnostic',
    status: equipment.value.status || 'Operational',
    department: equipment.value.department || '',
    manufacturer: equipment.value.manufacturer || '',
    model: equipment.value.model || '',
    serialNumber: equipment.value.serialNumber || '',
    location: equipment.value.location || '',
    lastCalibration: equipment.value.lastCalibration || '',
    nextCalibration: equipment.value.nextCalibration || '',
    description: equipment.value.description || ''
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!editForm.name.trim()) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'equipment', equipment.value.id), {
      name: editForm.name,
      type: editForm.type,
      status: editForm.status,
      department: editForm.department,
      manufacturer: editForm.manufacturer,
      model: editForm.model,
      serialNumber: editForm.serialNumber,
      location: editForm.location,
      lastCalibration: editForm.lastCalibration,
      nextCalibration: editForm.nextCalibration,
      description: editForm.description
    })
    await logActivity({ action: 'Update', resource: `Equipment ${equipment.value.equipmentId || equipment.value.id}`, details: `Updated "${editForm.name}"` })
    await logActivity({ action: 'Update', resource: `Equipment ${equipment.value.equipmentId || equipment.value.id}`, details: `Updated "${editForm.name}"` })
    toast.success(`Equipment ${equipment.value.equipmentId || equipment.value.id} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[EquipmentDetailModal] error updating equipment:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to edit equipment.' : 'Failed to update equipment.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const equipId = equipData.value?.id
  if (equipId) {
    unsubEquip = onSnapshot(doc(db, 'equipment', equipId), (snap) => {
      if (snap.exists()) {
        equipData.value = { id: snap.id, equipmentId: snap.data().equipmentId || snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsubEquip) unsubEquip()
})

function deleteEquipment() {
  ui.closeModal()
  ui.openModal('DeleteConfirm', equipData.value)
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleString()
  return String(v)
}

function typeClass(t) {
  const map = { Diagnostic: 'bg-surface-container-highest text-on-surface-variant', Therapeutic: 'bg-tertiary-container/20 text-tertiary', Monitoring: 'bg-primary-container/30 text-primary', Laboratory: 'bg-surface-container text-on-surface-variant', Surgical: 'bg-error-container/30 text-on-error-container', Imaging: 'bg-secondary-container/30 text-secondary', Other: 'bg-surface-container-highest text-on-surface-variant' }
  return map[t] || ''
}

function statusClass(s) {
  const map = { Operational: 'bg-green-100 text-green-800', 'Needs Calibration': 'bg-amber-100 text-amber-800', 'Out of Service': 'bg-red-100 text-red-800' }
  return map[s] || ''
}

function statusDot(s) {
  const map = { Operational: 'bg-green-600', 'Needs Calibration': 'bg-amber-500', 'Out of Service': 'bg-red-600' }
  return map[s] || ''
}
</script>
