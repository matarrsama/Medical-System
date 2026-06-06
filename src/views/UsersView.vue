<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-lg space-y-md md:space-y-0">
      <div>
        <h2 class="text-headline-lg font-headline-lg text-on-surface dark:text-inverse-on-surface">Staff Management</h2>
        <p class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline mt-xs">Manage staff access, roles, and department assignments.</p>
      </div>
      <div class="flex space-x-md">
        <button @click="ui.openModal('RoleMatrix')" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface font-label-md py-sm px-md rounded-DEFAULT hover:bg-surface-container-low dark:hover:bg-white/[0.08] transition-colors flex items-center shadow-sm">
          <span class="material-symbols-outlined mr-xs text-label-md">admin_panel_settings</span>
          Role Matrix
        </button>
        <button @click="ui.openModal('ProvisionUser')" class="bg-primary text-on-primary font-label-md py-sm px-md rounded-DEFAULT hover:bg-primary-container transition-colors flex items-center shadow-sm">
          <span class="material-symbols-outlined mr-xs text-label-md">badge</span>
          Provision Staff
        </button>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
      <div class="bg-surface-container-lowest dark:bg-inverse-surface p-md rounded-lg border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant dark:text-outline">Total Active Staff</span>
          <span class="material-symbols-outlined text-primary text-headline-md">group</span>
        </div>
        <div class="text-display font-display text-on-surface dark:text-inverse-on-surface mt-sm">{{ totalActive }}</div>
        <div class="text-label-sm font-label-sm text-primary mt-xs flex items-center">Active staff across all departments</div>
      </div>
      <div class="bg-surface-container-lowest dark:bg-inverse-surface p-md rounded-lg border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant dark:text-outline">Pending / Inactive</span>
          <span class="material-symbols-outlined text-tertiary text-headline-md">how_to_reg</span>
        </div>
        <div class="text-display font-display text-on-surface dark:text-inverse-on-surface mt-sm">{{ pendingApprovals }}</div>
        <div class="text-label-sm font-label-sm text-tertiary mt-xs flex items-center">Requires attention</div>
      </div>
      <div class="bg-surface-container-lowest dark:bg-inverse-surface p-md rounded-lg border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant dark:text-outline">Departments</span>
          <span class="material-symbols-outlined text-secondary text-headline-md">domain</span>
        </div>
        <div class="text-display font-display text-on-surface dark:text-inverse-on-surface mt-sm">{{ departmentsCount }}</div>
        <div class="text-label-sm font-label-sm text-secondary mt-xs flex items-center">Represented in system</div>
      </div>
      <div class="bg-surface-container-lowest dark:bg-inverse-surface p-md rounded-lg border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="text-label-md font-label-md text-on-surface-variant dark:text-outline">Roles Defined</span>
          <span class="material-symbols-outlined text-primary text-headline-md">security</span>
        </div>
        <div class="text-display font-display text-on-surface dark:text-inverse-on-surface mt-sm">{{ rolesCount }}</div>
        <div class="text-label-sm font-label-sm text-primary mt-xs flex items-center">RBAC Active</div>
      </div>
    </div>
    <div class="mb-lg">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <div class="relative w-full sm:w-56">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style="font-size: 18px;">search</span>
          <input v-model="searchQuery" class="w-full pl-9 pr-3 py-1.5 rounded border border-outline-variant dark:border-outline text-body-sm font-body-sm placeholder:text-outline dark:placeholder:text-outline focus:ring-1 focus:ring-primary transition-colors bg-surface-container dark:bg-inverse-surface" placeholder="Search staff..." type="text" />
        </div>
        <select v-model="filterRole" class="border border-outline-variant dark:border-outline rounded px-3 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface bg-surface-container dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
          <option value="">All Roles</option>
          <option v-for="roleName in roleOptions" :key="roleName" :value="roleName">{{ roleName }}</option>
        </select>
        <select v-model="filterDepartment" class="border border-outline-variant dark:border-outline rounded px-3 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface bg-surface-container dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
          <option value="">All Departments</option>
          <option v-for="d in deptStore.items" :key="d.id" :value="d.name">{{ d.name }}</option>
        </select>
        <select v-model="filterStatus" class="border border-outline-variant dark:border-outline rounded px-3 py-1.5 text-body-sm font-body-sm text-on-surface dark:text-inverse-on-surface bg-surface-container dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
          <option value="">All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Suspended</option>
        </select>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="user in paginatedUsers" :key="user.id" class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer relative" @click="ui.openModal('UserDetail', user)">
          <div class="p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-on-primary text-label-md font-bold border border-outline-variant dark:border-outline shrink-0">
                <img v-if="user.avatar" class="w-full h-full object-cover" :src="user.avatar" alt="avatar" />
                <span v-else>{{ user.initials }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-body-md text-on-surface dark:text-inverse-on-surface truncate">{{ user.name }}</div>
                <div class="text-label-sm text-on-surface-variant dark:text-outline truncate">{{ user.email }}</div>
              </div>
              <button @click.stop="toggleMenu(user.id)" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline shrink-0">
                <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
              </button>
            </div>
            <div class="space-y-1.5 text-body-sm">
              <div class="flex justify-between">
                <span class="text-on-surface-variant dark:text-outline">ID</span>
                <span class="text-on-surface dark:text-inverse-on-surface font-medium">{{ user.employeeId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant dark:text-outline">Role</span>
                <span :class="roleClass(user.role)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ user.role }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant dark:text-outline">Department</span>
                <span class="text-on-surface dark:text-inverse-on-surface">{{ user.department }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant dark:text-outline">Phone</span>
                <span class="text-on-surface dark:text-inverse-on-surface">{{ user.phoneNumber || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant dark:text-outline">Status</span>
                <span :class="statusClass(user.status)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(user.status)"></span>
                  {{ user.status }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="openMenu === user.id" class="absolute right-2 top-12 w-48 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-lg z-50 py-1.5" @click.stop>
            <button @click="viewDetails(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors text-left">
              <span class="material-symbols-outlined text-[16px] text-outline">visibility</span>
              View Details
            </button>
            <template v-if="(authStore.canEditUsers || authStore.canSuspendUsers || authStore.canDeleteUsers || authStore.canResetUserPasswords) && user.role !== 'Sys Administrator'">
              <button @click="editUser(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors text-left">
                <span class="material-symbols-outlined text-[16px] text-outline">edit</span>
                Edit Staff
              </button>
              <button @click="resetPassword(user)" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08] transition-colors text-left">
                <span class="material-symbols-outlined text-[16px] text-outline">key</span>
                Reset Password
              </button>
              <hr class="my-1 border-outline-variant/50 dark:border-outline/50" />
              <button @click="suspendUserHandler(user)" :disabled="suspending" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed">
                <span v-if="suspending" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
                <span v-else class="material-symbols-outlined text-[16px]" :class="user.status === 'Suspended' ? 'play_circle' : 'pause_circle'"></span>
                {{ user.status === 'Suspended' ? 'Unsuspend Staff' : 'Suspend Staff' }}
              </button>
              <button @click="deleteUserHandler(user)" :disabled="deleting" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-label-sm text-error hover:bg-error-container/20 dark:hover:bg-error-container/10 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed">
                <span v-if="deleting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
                <span v-else class="material-symbols-outlined text-[16px]">delete</span>
                Delete Staff
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl px-4 py-3">
      <div class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline">Showing {{ paginatedUsers.length }} of {{ filteredUsers.length }} staff</div>
      <div class="flex items-center gap-2">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="px-2 py-1 rounded border border-outline-variant dark:border-outline text-on-surface-variant dark:text-outline hover:bg-surface-container dark:hover:bg-white/[0.08] text-label-sm font-label-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
        <template v-for="n in visiblePages" :key="n">
          <button v-if="n !== '...'" @click="goToPage(n)" :class="n === currentPage ? 'bg-primary text-on-primary' : 'border border-outline-variant dark:border-outline text-on-surface-variant dark:text-outline hover:bg-surface-container dark:hover:bg-white/[0.08]'" class="px-3 py-1 rounded text-label-sm font-label-sm transition-colors">{{ n }}</button>
          <span v-else class="px-1 text-on-surface-variant dark:text-outline">...</span>
        </template>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-2 py-1 rounded border border-outline-variant dark:border-outline text-on-surface-variant dark:text-outline hover:bg-surface-container dark:hover:bg-white/[0.08] text-label-sm font-label-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { suspendUser, deleteUser } from '@/services/api'
import { useFirestoreCache } from '@/composables/useFirestoreCache'
import { useAuditLog } from '@/composables/useAuditLog'
import { timeAgo } from '@/utils/timeAgo'
import { sendSuspensionNotification } from '@/services/email'
import { notifySuspension } from '@/services/notifications'

import { useAuthStore } from '@/stores/auth'
import { useDepartmentsStore } from '@/stores/departments'

const route = useRoute()
const ui = useUIStore()
const authStore = useAuthStore()
const deptStore = useDepartmentsStore()
const { logActivity } = useAuditLog()
const searchQuery = ref(route.query.q || '')
console.log('[UsersView] searchQuery initialized to:', searchQuery.value)

watch(() => route.query.q, (q) => {
  console.log('[UsersView] route.query.q changed to:', q)
  searchQuery.value = q || ''
})
const filterRole = ref('')
const roleOptions = computed(() =>
  Object.entries(authStore.rolePermissions)
    .filter(([, v]) => v.active !== false)
    .map(([k]) => k)
    .sort()
)
const filterDepartment = ref('')
const openMenu = ref(null)
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const users = ref([])
const loading = ref(true)
const cache = useFirestoreCache()
const cached = cache.load('users')
if (cached) { users.value = cached; loading.value = false }
const suspending = ref(false)
const deleting = ref(false)
let unsub = null

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

watch(() => authStore.loading, (loading_) => {
  if (!loading_) {
    const constraints = [orderBy('created', 'desc')]
    if (!authStore.canManageUsers && authStore.departmentHeadOf) {
      constraints.push(where('department', '==', authStore.departmentHeadOf))
    }
    unsub = onSnapshot(
      query(collection(db, 'users'), ...constraints),
      (snapshot) => {
        const mapped = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        users.value = mapped
        loading.value = false
        cache.save('users', mapped)
      },
      (err) => {
        console.error('[UsersView] Firestore snapshot error:', err.code, err.message)
        loading.value = false
      }
    )
  }
}, { immediate: true })

onUnmounted(() => {
  if (unsub) unsub()
  document.removeEventListener('click', onDocClick)
})

const totalActive = computed(() => users.value.filter(u => u.status === 'Active').length)
const pendingApprovals = computed(() => users.value.filter(u => u.status === 'Pending' || u.status === 'Inactive').length)
const departmentsCount = computed(() => {
  const depts = new Set(users.value.map(u => u.department).filter(Boolean))
  return depts.size
})
const rolesCount = computed(() => {
  const roles = new Set(users.value.map(u => u.role).filter(Boolean))
  return roles.size
})

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    if (u.role === 'Sys Administrator') return false
    if (searchQuery.value && !u.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) && !u.employeeId?.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (filterRole.value && u.role !== filterRole.value) return false
    if (filterDepartment.value && u.department !== filterDepartment.value) return false
    if (filterStatus.value && u.status !== filterStatus.value) return false
    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value) || 1)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  if (total > 1) pages.push(total)
  return pages
})

const paginatedUsers = computed(() => {
  const tp = totalPages.value
  const page = Math.min(currentPage.value, tp)
  const start = (page - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

function goToPage(n) {
  const tp = totalPages.value
  if (n < 1) currentPage.value = 1
  else if (n > tp) currentPage.value = tp
  else currentPage.value = n
}

watch([searchQuery, filterRole, filterDepartment, filterStatus], () => { currentPage.value = 1 })

function roleClass(role) {
  const map = {
    'Sys Administrator': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'ICT Officer': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    Physician: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Nurse: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    Accounting: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    Procurement: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Hospital Admin': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Lab Technician': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Pharmacist: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    Doctor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
  return map[role] || 'bg-surface-container dark:bg-inverse-surface text-on-surface-variant dark:text-outline'
}
function statusClass(s) {
  return s === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : s === 'Inactive' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : 'bg-error-container/40 text-on-error-container'
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
  if (suspending.value) return
  openMenu.value = null
  const isSuspended = user.status === 'Suspended'
  const newStatus = isSuspended ? 'Active' : 'Suspended'
  suspending.value = true
  try {
    await suspendUser(user.uid, newStatus)
    await logActivity({ action: 'Update', resource: `Staff ${user.name}`, details: `${isSuspended ? 'Unsuspended' : 'Suspended'} staff account` })
    ui.showToast(`${user.name} has been ${isSuspended ? 'unsuspended' : 'suspended'}`, 'success')
    sendSuspensionNotification({ email: user.email, name: user.name }, newStatus)
    notifySuspension({ email: user.email, name: user.name }, newStatus)
  } catch (err) {
    ui.showToast(mapFirebaseError(err, `Failed to ${isSuspended ? 'unsuspend' : 'suspend'} user.`), 'error')
  } finally {
    suspending.value = false
  }
}

function deleteUserHandler(user) {
  openMenu.value = null
  ui.openModal('DeleteConfirm', user)
}

function onDocClick() {
  openMenu.value = null
}
</script>
