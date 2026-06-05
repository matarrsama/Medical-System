<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Roles</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">Define and manage system roles and their permissions.</p>
      </div>
      <div class="flex items-center gap-2 mt-3 sm:mt-0">
        <button v-if="roles.length === 0" @click="seedDefaults" :disabled="seeding" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm border border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors">
          <span v-if="seeding" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
          <span v-else class="material-symbols-outlined text-[16px]">auto_awesome</span>
          Seed Defaults
        </button>
        <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm bg-primary text-on-primary transition-colors shadow-sm">
          <span class="material-symbols-outlined text-[16px]">add</span>
          Add Role
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <span class="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
    </div>

    <template v-else-if="roles.length === 0">
      <div class="flex flex-col items-center justify-center py-24 text-on-surface-variant dark:text-outline">
        <span class="material-symbols-outlined text-[64px] mb-4">badge</span>
        <p class="text-body-md font-body-md mb-1">No roles defined yet</p>
        <p class="text-body-sm mb-6">Click "Seed Defaults" to populate from defaults, or "Add Role" to create one.</p>
      </div>
    </template>

    <div v-else class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-outline-variant dark:border-outline bg-surface-container dark:bg-white/[0.04]">
              <th class="text-left px-4 py-3 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Role Name</th>
              <th class="text-left px-4 py-3 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Permissions</th>
              <th class="text-center px-4 py-3 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Level</th>
              <th class="text-center px-4 py-3 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Status</th>
              <th class="text-right px-4 py-3 text-label-sm font-label-md text-on-surface dark:text-inverse-on-surface">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in sortedRoles" :key="r.name" class="border-b border-outline-variant/30 dark:border-outline/30 hover:bg-surface-container dark:hover:bg-white/[0.02] transition-colors">
              <td class="px-4 py-3 text-body-sm font-body-md text-on-surface dark:text-inverse-on-surface">{{ r.name }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-for="p in r._permLabels" :key="p" class="inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs bg-secondary-container text-on-secondary-container dark:bg-secondary dark:text-on-secondary">{{ p }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center text-body-sm text-on-surface dark:text-inverse-on-surface">{{ r.level ?? '-' }}</td>
              <td class="px-4 py-3 text-center">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-label-xs" :class="r.active !== false ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-outline-variant/50 text-outline dark:bg-white/[0.08]'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="r.active !== false ? 'bg-green-500' : 'bg-outline'"></span>
                  {{ r.active !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="openEdit(r)" class="p-1.5 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors" title="Edit">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button @click="confirmDelete(r)" class="p-1.5 rounded hover:bg-error-container dark:hover:bg-error-container/30 text-on-surface-variant dark:text-outline hover:text-error transition-colors" title="Delete">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/lib/firebase'
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore'
import { PERMISSIONS, ROLES } from '@/data/roles'

const ui = useUIStore()
const authStore = useAuthStore()

const roles = ref([])
const loading = ref(true)
const seeding = ref(false)
let unsub = null

const PERM_MAP = Object.fromEntries(PERMISSIONS.map(p => [p.id, p.label]))

const sortedRoles = computed(() =>
  [...roles.value].sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
)

function getPermLabels(perms) {
  if (!perms) return []
  return Object.entries(perms)
    .filter(([, v]) => v === true)
    .map(([k]) => PERM_MAP[k] || k)
}

function loadRoles(snap) {
  roles.value = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    _permLabels: getPermLabels(d.data().permissions)
  }))
  loading.value = false
}

async function syncRoleConfig() {
  const roleDocs = await getDocs(collection(db, 'roles'))
  const groups = {}
  for (const perm of PERMISSIONS) {
    groups[perm.id] = []
  }
  for (const d of roleDocs.docs) {
    const data = d.data()
    if (data.active === false) continue
    const perms = data.permissions || {}
    for (const perm of PERMISSIONS) {
      if (perms[perm.id] === true) {
        groups[perm.id].push(data.name)
      }
    }
  }
  await setDoc(doc(db, 'config', 'rolePermissions'), groups)
}

onMounted(() => {
  unsub = onSnapshot(collection(db, 'roles'), (snap) => {
    loadRoles(snap)
  }, () => { loading.value = false })
})

onUnmounted(() => {
  if (unsub) unsub()
})

function openCreate() {
  ui.openModal('RoleForm', { mode: 'create' })
}

function openEdit(role) {
  ui.openModal('RoleForm', { mode: 'edit', role })
}

async function confirmDelete(role) {
  if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
  try {
    await deleteDoc(doc(db, 'roles', role.name))
    await syncRoleConfig()
    ui.showToast(`Role "${role.name}" deleted`, 'success')
  } catch (err) {
    ui.showToast('Failed to delete role', 'error')
  }
}

async function seedDefaults() {
  seeding.value = true
  try {
    const batch = []
    for (const r of ROLES) {
      const perms = {}
      if (['sys_admin'].includes(r.id)) {
        PERMISSIONS.forEach(p => { perms[p.id] = true })
      }
      if (['hospital_admin', 'ict_officer'].includes(r.id)) {
        perms.canCreateUsers = true
        perms.canEditUsers = true
        perms.canSuspendUsers = true
        perms.canDeleteUsers = true
        perms.canResetUserPasswords = true
        perms.canCreateDepartments = true
        perms.canEditDepartments = true
        perms.canDeleteDepartments = true
        perms.canViewAllTickets = true
        perms.canCreateTickets = true
        perms.canEditTickets = true
        perms.canDeleteTickets = true
        perms.canUpdateTicketStatus = true
        perms.canViewAllLeaves = true
        perms.canDeleteLeaves = true
        perms.canCreateInventory = true
        perms.canEditInventory = true
        perms.canDeleteInventory = true
        perms.canChangeInventoryStatus = true
        perms.canCreateMaintenance = true
        perms.canEditMaintenance = true
        perms.canDeleteMaintenance = true
        perms.canUpdateMaintenanceStatus = true
        perms.canCreateEquipment = true
        perms.canEditEquipment = true
        perms.canDeleteEquipment = true
        perms.canCreatePO = true
        perms.canEditPO = true
        perms.canDeletePO = true
        perms.canChooseDepartment = true
        perms.canManageServiceRequests = true
        if (r.id === 'hospital_admin') {
          perms.canApproveLeaves = true
          perms.canRejectLeaves = true
          perms.canConfigureLeaves = true
          perms.canUpdatePOStatus = true
          perms.canManageRoles = true
        }
      }
      batch.push(setDoc(doc(db, 'roles', r.label), {
        name: r.label,
        level: r.id === 'sys_admin' ? 4 : r.id === 'ict_officer' ? 3 : r.id === 'hospital_admin' ? 3 : 1,
        active: true,
        permissions: perms
      }))
    }
    await Promise.all(batch)
    await syncRoleConfig()
    ui.showToast('Default roles seeded', 'success')
  } catch (err) {
    ui.showToast('Failed to seed roles', 'error')
  } finally {
    seeding.value = false
  }
}
</script>
