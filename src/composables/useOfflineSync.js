import { useUIStore } from '@/stores/ui'
import { useSyncStore } from '@/stores/sync'
import * as api from '@/services/api'

const apiMap = {
  'create-user': api.createUser,
  'update-user': api.updateUser,
  'suspend-user': api.suspendUser,
  'delete-user': api.deleteUser,
  'reset-password': api.resetPassword,
  'change-password': api.changePassword,
  'backfill-claims': api.backfillClaims,
}

export function useOfflineSync() {
  const ui = useUIStore()
  const sync = useSyncStore()

  async function cacheSnapshot(collection, data) {
    if (!window.electronAPI?.cache) return
    try {
      await window.electronAPI.cache.save(collection, data)
    } catch {}
  }

  async function loadFromCache(collection) {
    if (!window.electronAPI?.cache) return null
    try {
      return await window.electronAPI.cache.load(collection)
    } catch {
      return null
    }
  }

  async function queueAndTry(name, data) {
    if (ui.isOnline) {
      try {
        return await apiMap[name](data)
      } catch (err) {
        if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
          await sync.add({ name, data })
          return { queued: true }
        }
        throw err
      }
    } else {
      await sync.add({ name, data })
      return { queued: true }
    }
  }

  async function replayQueue() {
    if (sync.syncing.value || !ui.isOnline) return
    sync.syncing.value = true
    const list = await window.electronAPI?.queue.list()
    if (!list?.length) { sync.syncing.value = false; return }
    for (const op of list) {
      try {
        await apiMap[op.name](op.data)
        await sync.remove(op.id)
      } catch {
        break
      }
    }
    sync.syncing.value = false
  }

  function init() {
    sync.refresh()
    window.addEventListener('online', () => { setTimeout(replayQueue, 1000) })
  }

  return { cacheSnapshot, loadFromCache, queueAndTry, replayQueue, init }
}
