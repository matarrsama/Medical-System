import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'departments'

const colorMap = {
  'Emergency Room': 'bg-error',
  'Imaging & Radiology': 'bg-primary',
  'Pharmacy': 'bg-tertiary',
  'Infrastructure': 'bg-secondary',
  'Administration': 'bg-surface-variant text-on-surface',
  'Pathology Lab': 'bg-primary-container',
  'Finance': 'bg-pink-500',
  'ICT': 'bg-cyan-600',
  'Maternity': 'bg-rose-500',
  'LAB': 'bg-amber-600',
  'Super Admin': 'bg-purple-600',
  'Procurement': 'bg-orange-600',
  'Human Resources': 'bg-teal-600'
}

export function getDeptColor(name) {
  return colorMap[name] || 'bg-primary'
}

export const useDepartmentsStore = defineStore('departments', () => {
  const items = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening() {
    if (unsub) return
    unsub = onSnapshot(collection(db, 'departments'), (snap) => {
      items.value = snap.docs.map(doc => ({
        id: doc.id,
        deptId: doc.id,
        ...doc.data(),
        colorClass: getDeptColor(doc.data().name)
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
