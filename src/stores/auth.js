import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const loading = ref(true)
  const mustChangePassword = ref(false)
  const mustChangeChecked = ref(false)
  const departmentHeadOf = ref(null)

  const rolePermissions = ref({})
  let unsubRoles = null
  let unsubDeptHead = null

  const isAuthenticated = computed(() => user.value !== null)

  function hasPermission(perm) {
    return rolePermissions.value[role.value]?.permissions?.[perm] === true
  }

  // Admin
  const canAccessAdmin = computed(() => hasPermission('canAccessAdmin'))
  const canAccessAuditLogs = computed(() => hasPermission('canAccessAuditLogs'))
  const canManageRoles = computed(() => hasPermission('canManageRoles'))

  // Users
  const canCreateUsers = computed(() => hasPermission('canCreateUsers'))
  const canEditUsers = computed(() => hasPermission('canEditUsers'))
  const canSuspendUsers = computed(() => hasPermission('canSuspendUsers'))
  const canDeleteUsers = computed(() => hasPermission('canDeleteUsers'))
  const canResetUserPasswords = computed(() => hasPermission('canResetUserPasswords'))
  const canManageUsers = computed(() => canCreateUsers.value || canEditUsers.value || canSuspendUsers.value || canDeleteUsers.value || canResetUserPasswords.value)
  const canViewUsers = computed(() => canManageUsers.value || !!departmentHeadOf.value)

  // Departments
  const canCreateDepartments = computed(() => hasPermission('canCreateDepartments'))
  const canEditDepartments = computed(() => hasPermission('canEditDepartments'))
  const canDeleteDepartments = computed(() => hasPermission('canDeleteDepartments'))
  const canManageDepartments = computed(() => canCreateDepartments.value || canEditDepartments.value || canDeleteDepartments.value)
  const canAccessDepartments = computed(() => canManageDepartments.value || !!departmentHeadOf.value)

  // Tickets
  const canViewAllTickets = computed(() => hasPermission('canViewAllTickets'))
  const canCreateTickets = computed(() => hasPermission('canCreateTickets'))
  const canEditTickets = computed(() => hasPermission('canEditTickets'))
  const canDeleteTickets = computed(() => hasPermission('canDeleteTickets'))
  const canUpdateTicketStatus = computed(() => hasPermission('canUpdateTicketStatus'))

  // Leave Requests
  const canViewAllLeaves = computed(() => hasPermission('canViewAllLeaves'))
  const canApproveLeaves = computed(() => hasPermission('canApproveLeaves'))
  const canRejectLeaves = computed(() => hasPermission('canRejectLeaves'))
  const canDeleteLeaves = computed(() => hasPermission('canDeleteLeaves'))
  const canConfigureLeaves = computed(() => hasPermission('canConfigureLeaves'))
  const canManageLeaves = computed(() => canApproveLeaves.value || canRejectLeaves.value || canDeleteLeaves.value || canConfigureLeaves.value)

  // Inventory
  const canCreateInventory = computed(() => hasPermission('canCreateInventory'))
  const canEditInventory = computed(() => hasPermission('canEditInventory'))
  const canDeleteInventory = computed(() => hasPermission('canDeleteInventory'))
  const canChangeInventoryStatus = computed(() => hasPermission('canChangeInventoryStatus'))
  const canManageInventory = computed(() => canCreateInventory.value || canEditInventory.value || canDeleteInventory.value || canChangeInventoryStatus.value)

  // Maintenance
  const canCreateMaintenance = computed(() => hasPermission('canCreateMaintenance'))
  const canEditMaintenance = computed(() => hasPermission('canEditMaintenance'))
  const canDeleteMaintenance = computed(() => hasPermission('canDeleteMaintenance'))
  const canUpdateMaintenanceStatus = computed(() => hasPermission('canUpdateMaintenanceStatus'))
  const canScheduleMaintenance = computed(() => canCreateMaintenance.value || canEditMaintenance.value || canDeleteMaintenance.value || canUpdateMaintenanceStatus.value)

  // Biomedical
  const canCreateEquipment = computed(() => hasPermission('canCreateEquipment'))
  const canEditEquipment = computed(() => hasPermission('canEditEquipment'))
  const canDeleteEquipment = computed(() => hasPermission('canDeleteEquipment'))
  const isBiomedicalAdmin = computed(() => canCreateEquipment.value || canEditEquipment.value || canDeleteEquipment.value)

  // Procurement
  const canCreatePO = computed(() => hasPermission('canCreatePO'))
  const canEditPO = computed(() => hasPermission('canEditPO'))
  const canDeletePO = computed(() => hasPermission('canDeletePO'))
  const canUpdatePOStatus = computed(() => hasPermission('canUpdatePOStatus'))
  const canManageProcurement = computed(() => canCreatePO.value || canEditPO.value || canDeletePO.value || canUpdatePOStatus.value)
  const canAddPurchaseOrder = canCreatePO
  const canUpdatePurchaseOrderStatus = canUpdatePOStatus

  // General
  const canChooseDepartment = computed(() => hasPermission('canChooseDepartment'))
  const canManageServiceRequests = computed(() => hasPermission('canManageServiceRequests'))

  const isSuperAdmin = computed(() => role.value === 'Sys Administrator')

  let initialized = false
  let unsubscribe = null
  let unsubUserDoc = null

  function init() {
    if (initialized) return
    initialized = true

    unsubRoles = onSnapshot(collection(db, 'roles'), (snap) => {
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      rolePermissions.value = map
    }, () => {})

    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      loading.value = true
      if (firebaseUser) {
        // Timeout for token refresh — fall back to cached user if network is slow
        const tokenResult = await Promise.race([
          firebaseUser.getIdTokenResult(),
          new Promise(r => setTimeout(r, 3000))
        ])
        if (tokenResult) {
          role.value = tokenResult.claims.role || null
          window.__tokenClaims = tokenResult.claims
        } else {
          // Token refresh timed out — set a basic user from cached data
          role.value = null
        }
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: role.value,
          avatar: '',
          initials: '',
          department: ''
        }

        if (unsubUserDoc) unsubUserDoc()
        unsubUserDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            user.value = {
              ...user.value,
              displayName: data.name || user.value.displayName,
              avatar: data.avatar || '',
              initials: data.initials || '',
              department: data.department || ''
            }
            mustChangePassword.value = data.mustChangePassword === true
            mustChangeChecked.value = true
          }
        }, (err) => {
          console.error('Error listening to user document:', err)
        })

        updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastActive: new Date().toISOString()
        }).catch(() => {})

        await checkDepartmentHead(firebaseUser.uid, tokenResult)
        console.log('[Auth] departmentHeadOf after check:', departmentHeadOf.value, 'role:', role.value, 'canAccessDepartments:', canAccessDepartments.value)
      } else {
        user.value = null
        role.value = null
        mustChangePassword.value = false
        mustChangeChecked.value = false
        departmentHeadOf.value = null
        if (unsubUserDoc) {
          unsubUserDoc()
          unsubUserDoc = null
        }
      }
      loading.value = false
      console.log('[Auth] loading set to false, departmentHeadOf:', departmentHeadOf.value, 'role:', role.value)
    })
  }

  function cleanup() {
    if (unsubRoles) unsubRoles()
    if (unsubDeptHead) unsubDeptHead()
    if (unsubscribe) unsubscribe()
    if (unsubUserDoc) {
      unsubUserDoc()
      unsubUserDoc = null
    }
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const tokenResult = await cred.user.getIdTokenResult()
    role.value = tokenResult.claims.role || null
    user.value = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      role: role.value,
      avatar: '',
      initials: '',
      department: ''
    }

    updateDoc(doc(db, 'users', cred.user.uid), {
      lastActive: new Date().toISOString()
    }).catch(() => {})
  }

  async function checkDepartmentHead(uid, tokenResult) {
    if (tokenResult?.claims?.deptHeadOf) {
      departmentHeadOf.value = tokenResult.claims.deptHeadOf
      return
    }
    // If token timed out or no claim set, query Firestore directly
    try {
      const q = query(collection(db, 'departments'), where('headId', '==', uid))
      unsubDeptHead = onSnapshot(q, (snap) => {
        departmentHeadOf.value = snap.empty ? null : snap.docs[0].data().name
      }, () => { departmentHeadOf.value = null })
    } catch { departmentHeadOf.value = null }
  }

  function clearMustChange() {
    mustChangePassword.value = false
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    role.value = null
    mustChangePassword.value = false
    mustChangeChecked.value = false
    departmentHeadOf.value = null
    if (unsubDeptHead) {
      unsubDeptHead()
      unsubDeptHead = null
    }
    if (unsubUserDoc) {
      unsubUserDoc()
      unsubUserDoc = null
    }
  }

  init()

  return { user, role, loading, isAuthenticated, canAccessAdmin, canAccessAuditLogs, canManageRoles, canManageUsers, isSuperAdmin, canViewAllTickets, canManageDepartments, canAccessDepartments, canViewUsers, canManageLeaves, canViewAllLeaves, canManageInventory, canScheduleMaintenance, isBiomedicalAdmin, canManageProcurement, canAddPurchaseOrder, canUpdatePurchaseOrderStatus, canChooseDepartment, mustChangePassword, mustChangeChecked, departmentHeadOf, rolePermissions, hasPermission, init, cleanup, login, logout, clearMustChange,
    canCreateUsers, canEditUsers, canSuspendUsers, canDeleteUsers, canResetUserPasswords,
    canCreateDepartments, canEditDepartments, canDeleteDepartments,
    canCreateTickets, canEditTickets, canDeleteTickets, canUpdateTicketStatus,
    canApproveLeaves, canRejectLeaves, canDeleteLeaves, canConfigureLeaves,
    canCreateInventory, canEditInventory, canDeleteInventory, canChangeInventoryStatus,
    canCreateMaintenance, canEditMaintenance, canDeleteMaintenance, canUpdateMaintenanceStatus,
    canCreateEquipment, canEditEquipment, canDeleteEquipment,
    canCreatePO, canEditPO, canDeletePO, canUpdatePOStatus,
    canManageServiceRequests }
})
