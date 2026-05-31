import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { loadCache, saveCache } from './cache'

const CACHE_KEY = 'purchaseOrders'

export const usePurchaseOrdersStore = defineStore('purchaseOrders', () => {
  const orders = ref(loadCache(CACHE_KEY) || [])
  let unsub = null

  function startListening() {
    if (unsub) return
    unsub = onSnapshot(collection(db, 'purchaseOrders'), (snap) => {
      orders.value = snap.docs.map(doc => ({
        id: doc.id,
        poNumber: doc.data().poNumber || doc.id,
        ...doc.data()
      }))
      saveCache(CACHE_KEY, orders.value)
    }, () => {})
  }

  function stopListening() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  startListening()

  return { orders, startListening, stopListening }
})
