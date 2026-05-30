import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => user.value !== null)
  const canAccessAdmin = computed(() => role.value === 'Sys Administrator' || role.value === 'IT Administrator')

  let unsubscribe = null

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
          role: role.value
        }
      } else {
        user.value = null
        role.value = null
      }
      loading.value = false
    })
  }

  function cleanup() {
    if (unsubscribe) unsubscribe()
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const tokenResult = await cred.user.getIdTokenResult()
    role.value = tokenResult.claims.role || null
    user.value = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      role: role.value
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    role.value = null
  }

  return { user, role, loading, isAuthenticated, canAccessAdmin, init, cleanup, login, logout }
})
