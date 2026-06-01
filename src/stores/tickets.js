import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'tickets'

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening(department) {
    if (unsub) return
    const q = department
      ? query(collection(db, 'tickets'), where('department', '==', department))
      : query(collection(db, 'tickets'))
    unsub = onSnapshot(q, (snap) => {
      tickets.value = snap.docs.map(doc => ({
        id: doc.id,
        ticketId: doc.data().ticketId || doc.id,
        ...doc.data()
      }))
      saveCache(CACHE_KEY, tickets.value)
    }, () => {})
  }

  function stopListening() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  return { tickets, startListening, stopListening }
})
