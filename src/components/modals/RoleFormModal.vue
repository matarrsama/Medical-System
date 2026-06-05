<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-lg pt-lg pb-3 border-b border-outline-variant dark:border-outline">
      <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">{{ isEdit ? 'Edit Role' : 'Create Role' }}</h3>
      <button @click="$emit('close')" class="p-1.5 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors text-on-surface-variant dark:text-outline">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-lg py-4 space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface mb-1">Role Name</label>
          <input v-model="form.name" class="w-full bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-lg px-3 py-2 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. Nurse" :disabled="isEdit" />
        </div>
        <div>
          <label class="block text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface mb-1">Level</label>
          <input v-model.number="form.level" type="number" min="0" max="5" class="w-full bg-surface-container dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-lg px-3 py-2 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-1 focus:ring-primary transition-all" />
        </div>
        <div class="flex items-end pb-2">
          <label class="flex items-center gap-3 cursor-pointer">
            <button class="w-10 h-5 rounded-full transition-colors relative" :class="form.active ? 'bg-primary' : 'bg-outline-variant dark:bg-outline'" @click="form.active = !form.active">
              <div class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5" :class="form.active ? 'left-5' : 'left-0.5'"></div>
            </button>
            <span class="text-body-sm text-on-surface dark:text-inverse-on-surface">{{ form.active ? 'Active' : 'Inactive' }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface mb-3">Permissions</label>
        <div v-for="g in permissionGroups" :key="g.group" class="mb-4">
          <h4 class="text-label-xs uppercase tracking-wider text-on-surface-variant dark:text-outline mb-2">{{ g.group }}</h4>
          <div class="flex flex-wrap gap-2">
            <label v-for="p in g.permissions" :key="p.id" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors" :class="form.permissions[p.id] ? 'bg-primary-container border-primary text-on-primary-container dark:bg-primary dark:text-on-primary dark:border-primary' : 'border-outline-variant dark:border-outline text-on-surface-variant dark:text-outline hover:bg-surface-container dark:hover:bg-white/[0.08]'">
              <input type="checkbox" :checked="form.permissions[p.id]" @change="form.permissions[p.id] = !form.permissions[p.id]" class="sr-only" />
              <span class="material-symbols-outlined text-[14px]">{{ form.permissions[p.id] ? 'check_circle' : 'radio_button_unchecked' }}</span>
              <span class="text-label-sm">{{ p.label }}</span>
            </label>
          </div>
        </div>
        <p v-if="Object.values(form.permissions).every(v => !v)" class="text-body-sm text-on-surface-variant dark:text-outline italic">No permissions selected</p>
      </div>
    </div>

    <div class="flex justify-end gap-3 px-lg py-4 border-t border-outline-variant dark:border-outline">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant dark:border-outline rounded-lg text-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors">Cancel</button>
      <button @click="save" :disabled="saving || !form.name.trim()" class="px-5 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else>{{ isEdit ? 'Save Changes' : 'Create Role' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { db } from '@/lib/firebase'
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'
import { PERMISSIONS } from '@/data/roles'

const ui = useUIStore()
const data = ui.modalData || {}
const isEdit = data.mode === 'edit'

const form = reactive({
  name: '',
  level: 1,
  active: true,
  permissions: {}
})

const PERM_DEFAULTS = Object.fromEntries(PERMISSIONS.map(p => [p.id, false]))

const permissionGroups = computed(() => {
  const groups = {}
  for (const p of PERMISSIONS) {
    if (!groups[p.group]) groups[p.group] = { group: p.group, permissions: [] }
    groups[p.group].permissions.push(p)
  }
  return Object.values(groups)
})

onMounted(async () => {
  Object.assign(form.permissions, PERM_DEFAULTS)
  if (isEdit && data.role) {
    form.name = data.role.name
    form.level = data.role.level ?? 1
    form.active = data.role.active !== false
    if (data.role.permissions) {
      Object.keys(form.permissions).forEach(k => {
        form.permissions[k] = data.role.permissions[k] === true
      })
    }
  }
})

async function syncRoleConfig() {
  const roleDocs = await getDocs(collection(db, 'roles'))
  const groups = {}
  for (const perm of PERMISSIONS) {
    groups[perm.id] = []
  }
  for (const d of roleDocs.docs) {
    const roleData = d.data()
    if (roleData.active === false) continue
    const perms = roleData.permissions || {}
    for (const perm of PERMISSIONS) {
      if (perms[perm.id] === true) {
        groups[perm.id].push(roleData.name)
      }
    }
  }
  await setDoc(doc(db, 'config', 'rolePermissions'), groups)
}

const saving = ref(false)
async function save() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    await setDoc(doc(db, 'roles', form.name.trim()), {
      name: form.name.trim(),
      level: form.level,
      active: form.active,
      permissions: { ...form.permissions }
    })
    syncRoleConfig().catch(e => console.error('syncRoleConfig failed after role save:', e))
    ui.showToast(isEdit ? 'Role updated' : 'Role created', 'success')
    ui.closeModal()
  } catch (err) {
    console.error('Failed to save role:', err)
    ui.showToast('Failed to save role', 'error')
  } finally {
    saving.value = false
  }
}
</script>
