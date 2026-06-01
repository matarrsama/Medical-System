const FUNCTIONS_BASE = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions'

async function call(name, data) {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Request failed')
    return json
  } catch (err) {
    if (err.message?.includes('Failed to fetch') || err.name === 'TypeError' || !navigator.onLine) {
      const { useUIStore } = await import('@/stores/ui')
      const ui = useUIStore()
      if (!ui.isOnline) {
        const { useSyncStore } = await import('@/stores/sync')
        const sync = useSyncStore()
        await sync.add({ name, data })
        return { queued: true }
      }
    }
    throw err
  }
}

export const createUser = (data) => call('create-user', data)
export const updateUser = (data) => call('update-user', data)
export const suspendUser = (uid, status) => call('suspend-user', { uid, status })
export const deleteUser = (uid) => call('delete-user', { uid })
export const resetPassword = (uid) => call('reset-password', { uid })
export const changePassword = (uid, newPassword) => call('change-password', { uid, newPassword })
export const backfillClaims = () => call('backfill-claims', {})
export const setDeptHead = (uid, department) => call('set-dept-head', { uid, department })
