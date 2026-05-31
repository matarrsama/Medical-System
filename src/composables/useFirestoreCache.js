const PREFIX = 'firestore_'

function cacheKey(key) {
  return PREFIX + key
}

export function useFirestoreCache() {
  function load(key) {
    try {
      const raw = localStorage.getItem(cacheKey(key))
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || parsed.data === undefined) return null
      return parsed.data
    } catch {
      return null
    }
  }

  function save(key, data) {
    try {
      const entry = JSON.stringify({ data, cachedAt: Date.now() })
      localStorage.setItem(cacheKey(key), entry)
    } catch {
      // localStorage full or unavailable
    }
  }

  function clear(key) {
    try {
      localStorage.removeItem(cacheKey(key))
    } catch {}
  }

  function clearAll() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
      keys.forEach(k => localStorage.removeItem(k))
    } catch {}
  }

  return { load, save, clear, clearAll }
}
