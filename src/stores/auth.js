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

  const isAuthenticated = computed(() => user.value !== null)
  const canAccessAdmin = computed(() => role.value === 'Sys Administrator')
  const canAccessAuditLogs = computed(() => role.value === 'Sys Administrator')
  const canManageUsers = computed(() => ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(role.value))
  const isSuperAdmin = computed(() => role.value === 'Sys Administrator')
  const canViewAllTickets = computed(() => ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(role.value))
  const canManageDepartments = computed(() => ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(role.value))
  const canViewUsers = computed(() => ['Sys Administrator', 'Hospital Admin', 'ICT Officer'].includes(role.value) || !!departmentHeadOf.value)

  let unsubscribe = null
  let unsubUserDoc = null

  function init() {
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      loading.value = true
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult()
        role.value = tokenResult.claims.role || null
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

        try {
          const deptSnap = await getDocs(query(collection(db, 'departments'), where('headId', '==', firebaseUser.uid)))
          departmentHeadOf.value = deptSnap.empty ? null : deptSnap.docs[0].data().name
        } catch { departmentHeadOf.value = null }
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
    })
  }

  function cleanup() {
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
    if (unsubUserDoc) {
      unsubUserDoc()
      unsubUserDoc = null
    }
  }

  return { user, role, loading, isAuthenticated, canAccessAdmin, canAccessAuditLogs, canManageUsers, isSuperAdmin, canViewAllTickets, canManageDepartments, canViewUsers, mustChangePassword, mustChangeChecked, departmentHeadOf, init, cleanup, login, logout, clearMustChange }
})
