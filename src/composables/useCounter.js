import { db } from '@/lib/firebase'
import { doc, runTransaction } from 'firebase/firestore'

export function useCounter() {
  async function nextVal(counterName, { prefix = '', pad = 4, starting = 1, suffix = '' } = {}) {
    const ref = doc(db, 'counters', counterName)
    return runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref)
      let next
      if (!snap.exists()) {
        next = starting
        transaction.set(ref, { value: next })
      } else {
        next = snap.data().value + 1
        transaction.update(ref, { value: next })
      }
      return `${prefix}${String(next).padStart(pad, '0')}${suffix}`
    })
  }

  return { nextVal }
}
