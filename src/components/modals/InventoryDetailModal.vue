<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">{{ editing ? 'Edit Asset' : 'Asset Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">{{ asset.assetTag || asset.id }}</p>
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
            <h2 class="text-headline-sm font-headline-md text-on-surface">{{ asset.name }}</h2>
          </template>
          <div class="flex items-center gap-3 mt-2">
            <span :class="statusClass(editing ? editForm.status : asset.status)" class="px-2.5 py-0.5 rounded text-label-sm font-label-sm">{{ editing ? editForm.status : asset.status }}</span>
            <span class="text-label-sm text-outline font-mono">{{ asset.category }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low">
        <div>
          <span class="text-label-sm text-outline font-medium">Asset Tag</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5 font-mono">{{ asset.assetTag || asset.id }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Category</span>
          <template v-if="editing">
            <select v-model="editForm.category" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Desktop</option><option>Network</option><option>Printer</option><option>Server</option><option>Mobile</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ asset.category || '—' }}</p>
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
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ asset.department || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Status</span>
          <template v-if="editing">
            <select v-model="editForm.status" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option>Active</option><option>Maintenance</option><option>Retired</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ asset.status || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Location</span>
          <template v-if="editing">
            <input v-model="editForm.location" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ asset.location || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created by</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ asset.createdByName || asset.createdBy || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ formatDate(asset.created) }}</p>
        </div>
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
        <button @click="deleteAsset" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit Asset
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
const assetData = ref(modalData.value.asset || modalData.value)
const asset = computed(() => assetData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
const deptStore = useDepartmentsStore()
let unsubAsset = null

const editForm = reactive({
  name: '', category: '', status: '', department: '', location: ''
})

function startEdit() {
  Object.assign(editForm, {
    name: asset.value.name || '',
    category: asset.value.category || 'Desktop',
    status: asset.value.status || 'Active',
    department: asset.value.department || '',
    location: asset.value.location || ''
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
    await updateDoc(doc(db, 'inventory', asset.value.id), {
      name: editForm.name,
      category: editForm.category,
      status: editForm.status,
      department: editForm.department,
      location: editForm.location || null
    })
    await logActivity({ action: 'Update', resource: `Asset ${asset.value.assetTag || asset.value.id}`, details: `Updated "${editForm.name}"` })
    await logActivity({ action: 'Update', resource: `Asset ${asset.value.assetTag || asset.value.id}`, details: `Updated "${editForm.name}"` })
    toast.success(`Asset ${asset.value.assetTag || asset.value.id} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[InventoryDetailModal] error updating asset:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to edit assets.' : 'Failed to update asset.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const assetId = assetData.value?.id
  if (assetId) {
    unsubAsset = onSnapshot(doc(db, 'inventory', assetId), (snap) => {
      if (snap.exists()) {
        assetData.value = { id: snap.id, assetTag: snap.data().assetTag || snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsubAsset) unsubAsset()
})

function deleteAsset() {
  ui.closeModal()
  ui.openModal('DeleteConfirm', assetData.value)
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleString()
  return String(v)
}

function statusClass(s) {
  const map = { Active: 'bg-green-100 text-green-800', Maintenance: 'bg-amber-100 text-amber-800', Retired: 'bg-gray-100 text-gray-600' }
  return map[s] || ''
}
</script>
