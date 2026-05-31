import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'users'

export const useUsersStore = defineStore('users', () => {
  const items = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening() {
    if (unsub) return
    unsub = onSnapshot(query(collection(db, 'users'), orderBy('created', 'desc')), (snap) => {
      items.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      saveCache(CACHE_KEY, items.value)
    }, () => {})
  }

  function stopListening() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  startListening()

  return { items, startListening, stopListening }
})
