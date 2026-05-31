import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export function useAuditLog() {
  async function logActivity({ action, resource, details }) {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        timestamp: serverTimestamp(),
        user: auth.currentUser?.displayName || auth.currentUser?.email || 'System',
        action,
        resource,
        details: details || ''
      })
    } catch (err) {
      console.error('[useAuditLog] Failed to write audit log:', err)
    }
  }

  return { logActivity }
}
