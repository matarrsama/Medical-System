const PREFIX = 'itsm_cache_'

function replacer(_, value) {
  if (value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return value
}

export function loadCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveCache(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data, replacer))
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      try {
        const oldest = Object.keys(localStorage)
          .filter(k => k.startsWith(PREFIX))
          .sort()
          .at(0)
        if (oldest) localStorage.removeItem(oldest)
        localStorage.setItem(PREFIX + key, JSON.stringify(data, replacer))
      } catch {}
    }
  }
}
