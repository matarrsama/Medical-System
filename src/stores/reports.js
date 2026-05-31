import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'reports'

export const useReportsStore = defineStore('reports', () => {
  const items = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening() {
    if (unsub) return
    unsub = onSnapshot(collection(db, 'reports'), (snap) => {
      items.value = snap.docs.map(doc => ({
        id: doc.id,
        reportId: doc.data().reportId || doc.id,
        ...doc.data()
      }))
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
