import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => user.value !== null)
  const canAccessAdmin = computed(() => role.value === 'Sys Administrator')
  const canAccessAuditLogs = computed(() => ['Sys Administrator', 'ICT Officer', 'Hospital Admin'].includes(role.value))
  const canManageUsers = computed(() => canAccessAuditLogs.value)
  const isSuperAdmin = computed(() => role.value === 'Sys Administrator')

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
          initials: ''
        }

        if (unsubUserDoc) unsubUserDoc()
        unsubUserDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            user.value = {
              ...user.value,
              displayName: data.name || user.value.displayName,
              avatar: data.avatar || '',
              initials: data.initials || ''
            }
          }
        }, (err) => {
          console.error('Error listening to user document:', err)
        })
      } else {
        user.value = null
        role.value = null
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
      initials: ''
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    role.value = null
    if (unsubUserDoc) {
      unsubUserDoc()
      unsubUserDoc = null
    }
  }

  return { user, role, loading, isAuthenticated, canAccessAdmin, canAccessAuditLogs, canManageUsers, isSuperAdmin, init, cleanup, login, logout }
})
