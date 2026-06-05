import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'maintenance'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const tasks = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening(department) {
    if (unsub) return
    const ref = department
      ? query(collection(db, 'maintenanceTasks'), where('department', '==', department))
      : query(collection(db, 'maintenanceTasks'))
    unsub = onSnapshot(ref, (snap) => {
      tasks.value = snap.docs.map(doc => ({
        id: doc.id,
        maintenanceId: doc.data().maintenanceId || doc.id,
        ...doc.data()
      }))
      saveCache(CACHE_KEY, tasks.value)
    }, () => {})
  }

  function stopListening() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  return { tasks, startListening, stopListening }
})
