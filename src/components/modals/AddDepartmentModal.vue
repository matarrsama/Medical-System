<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">domain</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Add Department</h3>
          <p class="text-body-sm text-on-surface-variant mt-0.5">Register a new hospital department</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <div>
        <label class="text-label-md font-label-md text-on-surface">Department Name <span class="text-error">*</span></label>
        <input v-model="form.name" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" required />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Department Head</label>
          <select v-model="form.headId" @change="onHeadChange" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary">
            <option value="">— None —</option>
            <option v-for="u in usersStore.items" :key="u.uid || u.id" :value="u.uid || u.id">{{ u.name || u.email || u.id }}</option>
          </select>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Location</label>
          <input v-model="form.location" class="w-full mt-1 px-3 py-2.5 border border-outline-variant rounded-lg text-body-sm bg-surface focus:ring-1 focus:ring-primary" />
        </div>
      </div>
      <div>
        <label class="text-label-md font-label-md text-on-surface mb-2 block">Department Members</label>
        <div class="max-h-40 overflow-y-auto border border-outline-variant rounded-lg p-2 space-y-1">
          <label v-for="u in usersStore.items" :key="u.uid || u.id" class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-container cursor-pointer text-label-sm font-label-sm text-on-surface">
            <input type="checkbox" :value="u.uid || u.id" :checked="selectedMembers.has(u.uid || u.id)" @change="toggleMember(u.uid || u.id)" class="rounded border-outline-variant text-primary focus:ring-primary" />
            {{ u.name || u.email || u.id }}
          </label>
          <div v-if="!usersStore.items.length" class="text-body-sm text-on-surface-variant text-center py-4">No users available</div>
        </div>
      </div>
    </form>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0 bg-surface-container-low">
      <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
        Cancel
      </button>
      <button @click="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">add</span>
        Add Department
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuditLog } from '@/composables/useAuditLog'
import { useUsersStore } from '@/stores/users'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const { logActivity } = useAuditLog()
const usersStore = useUsersStore()

const form = reactive({ name: '', headId: '', headName: '', location: '' })
const saving = ref(false)
const selectedMembers = ref(new Set())

function toggleMember(id) {
  const s = new Set(selectedMembers.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedMembers.value = s
}

function onHeadChange() {
  const user = usersStore.items.find(u => (u.uid || u.id) === form.headId)
  form.headName = user ? (user.name || user.email || '') : ''
}

async function submit() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'departments'), {
      name: form.name,
      headId: form.headId || null,
      headName: form.headName || null,
      head: form.headName || null,
      location: form.location || null,
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    const updates = [...selectedMembers.value].map(uid =>
      updateDoc(doc(db, 'users', uid), { department: form.name }).catch(() => {})
    )
    await Promise.all(updates)
    await logActivity({ action: 'Create', resource: `Department ${form.name}`, details: `Head: ${form.headName || '—'}, Location: ${form.location || '—'}` })
    toast.success('Department added successfully!')
    emit('close')
  } catch (err) {
    console.error('[AddDepartmentModal] error adding department:', err)
    toast.error(err.code === 'permission-denied' ? 'You do not have permission to add departments.' : 'Failed to add department.')
  } finally {
    saving.value = false
  }
}
</script>
