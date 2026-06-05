import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'leaveRequests'

export const useLeaveRequestsStore = defineStore('leaveRequests', () => {
  const leaveRequests = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening(department) {
    if (unsub) return
    const q = department
      ? query(collection(db, 'leaveRequests'), where('department', '==', department))
      : query(collection(db, 'leaveRequests'))
    unsub = onSnapshot(q, (snap) => {
      leaveRequests.value = snap.docs.map(doc => ({
        id: doc.id,
        leaveId: doc.data().leaveId || doc.id,
        ...doc.data()
      }))
      saveCache(CACHE_KEY, leaveRequests.value)
    }, () => {})
  }

  function stopListening() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  return { leaveRequests, startListening, stopListening }
})
