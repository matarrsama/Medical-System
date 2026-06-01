<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Add Inventory Asset</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">Register a new ICT asset in the system</p>
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
          <span class="text-label-sm text-outline font-medium">Asset Tag</span>
          <p class="text-body-md text-on-surface font-mono font-medium mt-0.5">{{ assetTag || 'Generating…' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Asset Name <span class="text-error">*</span></label>
          <input v-model="form.name" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Category <span class="text-error">*</span></label>
          <select v-model="form.category" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required>
            <option>Desktop</option><option>Network</option><option>Printer</option><option>Server</option><option>Mobile</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Department <span class="text-error">*</span></label>
          <select v-if="canChooseDepartment" v-model="form.department" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required>
            <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
          </select>
          <div v-else class="flex items-center gap-2 mt-1 px-3 py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container text-body-sm text-on-surface font-medium">
            <span class="material-symbols-outlined text-[16px] text-outline">business</span>
            {{ userDept }}
          </div>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Status</label>
          <select v-model="form.status" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required>
            <option>Active</option><option>Maintenance</option><option>Retired</option>
          </select>
        </div>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface">Location</label>
        <input v-model="form.location" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" placeholder="e.g. Room 101, Building A" />
      </div>
    </form>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
        Cancel
      </button>
      <button @click="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">add</span>
        Add Asset
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { generateId } from '@/utils/generateId'
import { useAuthStore } from '@/stores/auth'
import { useDepartmentsStore } from '@/stores/departments'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const authStore = useAuthStore()
const deptStore = useDepartmentsStore()
const { logActivity } = useAuditLog()
const saving = ref(false)
const userDept = ref('')
const canChooseDepartment = computed(() =>
  ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(authStore.role)
)

const assetTag = ref('')
const form = reactive({
  name: '', category: 'Desktop', department: '', status: 'Active', location: ''
})

async function submit() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'inventory'), {
      assetTag: assetTag.value,
      name: form.name,
      category: form.category,
      department: form.department,
      status: form.status,
      location: form.location || null,
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `Asset ${assetTag.value}`, details: `Added "${form.name}" in ${form.category}` })
    toast.success(`Asset ${assetTag.value} added successfully!`)
    emit('close')
  } catch (err) {
    console.error('[AddInventoryModal] error adding asset:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to add assets.' : 'Failed to add asset.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  assetTag.value = generateId('AST-', 8)
  const uid = auth.currentUser?.uid
  if (uid) {
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (userSnap.exists()) {
      userDept.value = userSnap.data().department || ''
      form.department = userDept.value
    }
  }
})


</script>
