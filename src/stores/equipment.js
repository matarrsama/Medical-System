import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'equipment'

export const useEquipmentStore = defineStore('equipment', () => {
  const items = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening(department) {
    if (unsub) return
    const ref = department
      ? query(collection(db, 'equipment'), where('department', '==', department))
      : query(collection(db, 'equipment'))
    unsub = onSnapshot(ref, (snap) => {
      items.value = snap.docs.map(doc => ({
        id: doc.id,
        equipmentId: doc.data().equipmentId || doc.id,
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

  return { items, startListening, stopListening }
})
