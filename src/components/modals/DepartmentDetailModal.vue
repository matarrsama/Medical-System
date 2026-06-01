<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">domain</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">{{ editing ? 'Edit Department' : 'Department Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">{{ dept.name }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center" :class="colorClass">
          <span class="material-symbols-outlined text-on-primary text-[28px]">domain</span>
        </div>
        <div class="min-w-0 flex-1">
          <template v-if="editing">
            <input v-model="editForm.name" class="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-headline-sm font-headline-md bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <h2 class="text-headline-sm font-headline-md text-on-surface">{{ dept.name }}</h2>
          </template>
          <p class="text-body-sm text-on-surface-variant mt-0.5">{{ dept.deptId || dept.id }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low">
        <div>
          <span class="text-label-sm text-outline font-medium">Department Head</span>
          <template v-if="editing">
            <select v-model="editForm.headId" @change="onHeadChange" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
              <option value="">— None —</option>
              <option v-for="u in usersStore.items" :key="u.uid || u.id" :value="u.uid || u.id">{{ u.name || u.email || u.id }}</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ dept.headName || dept.head || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Location</span>
          <template v-if="editing">
            <input v-model="editForm.location" class="w-full mt-0.5 px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface font-medium mt-0.5">{{ dept.location || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ formatDate(dept.created) }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created by</span>
          <p class="text-body-md text-on-surface font-medium mt-0.5">{{ dept.createdByName || dept.createdBy || '—' }}</p>
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
        <button @click="deleteDept" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
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
import { useAuditLog } from '@/composables/useAuditLog'
import { useUsersStore } from '@/stores/users'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, collection, onSnapshot } from 'firebase/firestore'
import { getDeptColor } from '@/stores/departments'

const ui = useUIStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const usersStore = useUsersStore()
const modalData = computed(() => ui.modalData || {})
const deptData = ref(modalData.value.department || modalData.value)
const dept = computed(() => deptData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
let unsub = null

const colorClass = computed(() => getDeptColor(dept.value.name))

const editForm = reactive({
  name: '', headId: '', headName: '', location: ''
})

function startEdit() {
  Object.assign(editForm, {
    name: dept.value.name || '',
    headId: dept.value.headId || '',
    headName: dept.value.headName || '',
    location: dept.value.location || ''
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function onHeadChange() {
  const user = usersStore.items.find(u => (u.uid || u.id) === editForm.headId)
  editForm.headName = user ? (user.name || user.email || '') : ''
}

async function save() {
  if (!editForm.name.trim()) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'departments', dept.value.id), {
      name: editForm.name,
      headId: editForm.headId || null,
      headName: editForm.headName || null,
      head: editForm.headName || null,
      location: editForm.location
    })
    await logActivity({ action: 'Update', resource: `Department ${editForm.name}`, details: `Updated department info` })
    toast.success(`Department ${editForm.name} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[DepartmentDetailModal] error updating department:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to edit departments.' : 'Failed to update department.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const id = deptData.value?.id
  if (id) {
    unsub = onSnapshot(doc(db, 'departments', id), (snap) => {
      if (snap.exists()) {
        deptData.value = { id: snap.id, deptId: snap.id, ...snap.data(), colorClass: getDeptColor(snap.data().name) }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsub) unsub()
})

function deleteDept() {
  ui.closeModal()
  ui.openModal('DeleteConfirm', deptData.value)
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleString()
  return String(v)
}
</script>
