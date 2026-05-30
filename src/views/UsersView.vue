<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-lg space-y-md md:space-y-0">
      <div>
        <h2 class="text-headline-lg font-headline-lg text-on-surface">User Management</h2>
        <p class="text-body-sm font-body-sm text-on-surface-variant mt-xs">Manage system access, roles, and department assignments.</p>
      </div>
      <div class="flex space-x-md">
        <button @click="ui.openModal('RoleMatrix')" class="bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md py-sm px-md rounded-DEFAULT hover:bg-surface-container-low transition-colors flex items-center shadow-sm">
          <span class="material-symbols-outlined mr-xs text-label-md">admin_panel_settings</span>
          Role Matrix
        </button>
        <button @click="ui.openModal('ProvisionUser')" class="bg-primary text-on-primary font-label-md py-sm px-md rounded-DEFAULT hover:bg-primary-container transition-colors flex items-center shadow-sm">
          <span class="material-symbols-outlined mr-xs text-label-md">badge</span>
          Provision User
        </button>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
      <div class="bg-surface-container-lowest p-md rounded-lg border border-outline-variant shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant">Total Active Users</span>
          <span class="material-symbols-outlined text-primary text-headline-md">group</span>
        </div>
        <div class="text-display font-display text-on-surface mt-sm">1,248</div>
        <div class="text-label-sm font-label-sm text-primary mt-xs flex items-center">
          <span class="material-symbols-outlined text-label-sm mr-1">trending_up</span> +12 this week
        </div>
      </div>
      <div class="bg-surface-container-lowest p-md rounded-lg border border-outline-variant shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant">Pending Approvals</span>
          <span class="material-symbols-outlined text-tertiary text-headline-md">how_to_reg</span>
        </div>
        <div class="text-display font-display text-on-surface mt-sm">14</div>
        <div class="text-label-sm font-label-sm text-tertiary mt-xs flex items-center">
          <span class="material-symbols-outlined text-label-sm mr-1">schedule</span> Requires attention
        </div>
      </div>
      <div class="bg-surface-container-lowest p-md rounded-lg border border-outline-variant shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant">Departments</span>
          <span class="material-symbols-outlined text-secondary text-headline-md">domain</span>
        </div>
        <div class="text-display font-display text-on-surface mt-sm">24</div>
        <div class="text-label-sm font-label-sm text-secondary mt-xs flex items-center">Hospital-wide coverage</div>
      </div>
      <div class="bg-surface-container-lowest p-md rounded-lg border border-outline-variant shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant">Roles Defined</span>
          <span class="material-symbols-outlined text-primary text-headline-md">security</span>
        </div>
        <div class="text-display font-display text-on-surface mt-sm">8</div>
        <div class="text-label-sm font-label-sm text-primary mt-xs flex items-center">RBAC Active</div>
      </div>
    </div>
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 flex-wrap">
          <div class="relative w-full sm:w-56">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style="font-size: 18px;">search</span>
            <input v-model="searchQuery" class="w-full pl-9 pr-3 py-1.5 rounded border border-outline-variant text-body-sm font-body-sm placeholder:text-outline focus:ring-1 focus:ring-primary transition-colors bg-surface-container" placeholder="Search users..." type="text" />
          </div>
          <select v-model="filterRole" class="border border-outline-variant rounded px-3 py-1.5 text-body-sm font-body-sm text-on-surface bg-surface-container focus:ring-1 focus:ring-primary">
            <option value="">All Roles</option>
            <option>Sys Administrator</option>
            <option>ICT Officer</option>
            <option>Physician</option>
            <option>Nurse</option>
            <option>Viewer</option>
            <option>Accounting</option>
            <option>Procurement</option>
            <option>Hospital Admin</option>
            <option>Lab Technician</option>
            <option>Pharmacist</option>
            <option>Doctor</option>
          </select>
          <select v-model="filterDepartment" class="border border-outline-variant rounded px-3 py-1.5 text-body-sm font-body-sm text-on-surface bg-surface-container focus:ring-1 focus:ring-primary">
            <option value="">All Departments</option>
            <option>ER</option>
            <option>Imaging & Radiology</option>
            <option>Pharmacy</option>
            <option>Infrastructure</option>
            <option>Administration</option>
            <option>Pathology Lab</option>
            <option>Finance</option>
            <option>ICT</option>
            <option>Maternity</option>
            <option>LAB</option>
            <option>Super Admin</option>
            <option>Procurement</option>
            <option>Human Resources</option>
          </select>
          <select v-model="filterStatus" class="border border-outline-variant rounded px-3 py-1.5 text-body-sm font-body-sm text-on-surface bg-surface-container focus:ring-1 focus:ring-primary">
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
              <th class="p-3 pl-4 border-b border-outline-variant font-medium">User</th>
              <th class="p-3 border-b border-outline-variant font-medium">Employee ID</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Role</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Department</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Status</th>
              <th class="p-3 border-b border-outline-variant font-medium hidden lg:table-cell">Last Active</th>
              <th class="p-3 pr-4 border-b border-outline-variant font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-body-sm font-body-sm text-on-surface">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-surface-container-lowest transition-colors cursor-pointer border-b border-outline-variant/30 last:border-0" @click="ui.openModal('UserDetail', user)">
              <td class="p-3 pl-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-label-md font-bold">{{ user.initials }}</div>
                  <div>
                    <div class="font-medium text-on-surface">{{ user.name }}</div>
                    <div class="text-label-sm text-on-surface-variant">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="p-3 text-on-surface-variant">{{ user.employeeId }}</td>
              <td class="p-3 hidden md:table-cell">
                <span :class="roleClass(user.role)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ user.role }}</span>
              </td>
              <td class="p-3 hidden md:table-cell text-on-surface-variant">{{ user.department }}</td>
              <td class="p-3 hidden lg:table-cell">
                <span :class="statusClass(user.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(user.status)"></span>
                  {{ user.status }}
                </span>
              </td>
              <td class="p-3 hidden lg:table-cell text-on-surface-variant">{{ user.lastActive }}</td>
              <td class="p-3 pr-4 relative">
                <button @click.stop="toggleMenu(user.id)" class="p-1 rounded hover:bg-surface-container text-on-surface-variant">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                <div v-if="openMenu === user.id" class="absolute right-4 top-full mt-1 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 py-1.5" @click.stop>
                  <button @click="viewDetails(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">visibility</span>
                    View Details
                  </button>
                  <button @click="editUser(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                    Edit User
                  </button>
                  <button @click="resetPassword(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                    <span class="material-symbols-outlined text-[16px] text-outline">key</span>
                    Reset Password
                  </button>
                  <hr class="my-1 border-outline-variant/50" />
                  <button @click="suspendUserHandler(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-amber-700 hover:bg-amber-50 transition-colors text-left">
                    <span class="material-symbols-outlined text-[16px]">pause_circle</span>
                    Suspend User
                  </button>
                  <button @click="deleteUserHandler(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-error hover:bg-error-container/20 transition-colors text-left">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                    Delete User
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
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { suspendUser, deleteUser } from '@/services/api'

const ui = useUIStore()
const searchQuery = ref('')
const filterRole = ref('')
const filterDepartment = ref('')
const openMenu = ref(null)
const filterStatus = ref('')
const users = ref([])
const loading = ref(true)
let unsub = null

onMounted(() => {
  unsub = onSnapshot(
    query(collection(db, 'users'), orderBy('created', 'desc')),
    (snapshot) => {
      users.value = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore users listener error:', err)
      loading.value = false
    }
  )
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  if (unsub) unsub()
  document.removeEventListener('click', onDocClick)
})

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    if (searchQuery.value && !u.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) && !u.employeeId?.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (filterRole.value && u.role !== filterRole.value) return false
    if (filterDepartment.value && u.department !== filterDepartment.value) return false
    if (filterStatus.value && u.status !== filterStatus.value) return false
    return true
  })
})

function roleClass(role) {
  const map = {
    'Sys Administrator': 'bg-purple-100 text-purple-800',
    'ICT Officer': 'bg-cyan-100 text-cyan-800',
    Physician: 'bg-blue-100 text-blue-800',
    Nurse: 'bg-green-100 text-green-800',
    Viewer: 'bg-gray-100 text-gray-800',
    Accounting: 'bg-pink-100 text-pink-800',
    Procurement: 'bg-orange-100 text-orange-800',
    'Hospital Admin': 'bg-indigo-100 text-indigo-800',
    'Lab Technician': 'bg-yellow-100 text-yellow-800',
    Pharmacist: 'bg-teal-100 text-teal-800',
    Doctor: 'bg-blue-100 text-blue-800'
  }
  return map[role] || 'bg-surface-container text-on-surface-variant'
}
function statusClass(s) {
  return s === 'Active' ? 'bg-green-100 text-green-800' : s === 'Inactive' ? 'bg-gray-100 text-gray-600' : 'bg-error-container/40 text-on-error-container'
}
function statusDot(s) {
  return s === 'Active' ? 'bg-green-600' : s === 'Inactive' ? 'bg-gray-400' : 'bg-error'
}

function toggleMenu(id) {
  openMenu.value = openMenu.value === id ? null : id
}

function viewDetails(user) {
  openMenu.value = null
  ui.openModal('UserDetail', user)
}

function editUser(user) {
  openMenu.value = null
  ui.openModal('EditUser', user)
}

function resetPassword(user) {
  openMenu.value = null
  ui.openModal('ResetPassword', user)
}

async function suspendUserHandler(user) {
  openMenu.value = null
  if (user.status === 'Suspended') {
    ui.showToast(`${user.name} is already suspended`, 'info')
    return
  }
  try {
    await suspendUser(user.uid, 'Suspended')
    ui.showToast(`${user.name} has been suspended`, 'success')
  } catch (err) {
    ui.showToast(err.message, 'error')
  }
}

async function deleteUserHandler(user) {
  openMenu.value = null
  if (!confirm(`Are you sure you want to delete ${user.name}?`)) return
  try {
    await deleteUser(user.uid)
    ui.showToast(`${user.name} has been deleted`, 'success')
  } catch (err) {
    ui.showToast(err.message, 'error')
  }
}

function onDocClick() {
  openMenu.value = null
}
</script>
