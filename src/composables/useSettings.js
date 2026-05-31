import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

const DEFAULT_SETTINGS = {
  hospitalName: 'Hospital ICT Service Management',
  displayName: 'ICT Admin Console',
  timeZone: 'America/New_York',
  language: 'English (US)',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD ($)',
  sessionTimeout: '30',
  passwordMinLength: '12',
  mfaRequired: true,
  accountLockout: true,
  emailAlerts: true,
  smsAlerts: false,
  dailySummary: true,
  adSync: 'Connected',
  ehrIntegration: 'Connected',
  siemExport: false,
  maintenanceMode: false
}

function loadCached(key, fallback) {
  try {
    return localStorage.getItem('settings_' + key) ?? fallback
  } catch { return fallback }
}
function saveCache(key, value) {
  try { localStorage.setItem('settings_' + key, value) } catch {}
}

function createCachedRef(key, fallback) {
  const r = ref(loadCached(key, fallback))
  return { ref: r, key, fallback }
}

export function useSettings() {
  const refs = {}
  for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
    const { ref: r } = createCachedRef(key, fallback)
    refs[key] = r
  }

  onSnapshot(doc(db, 'settings', 'general'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        for (const key of Object.keys(DEFAULT_SETTINGS)) {
          if (data[key] !== undefined) {
            refs[key].value = data[key]
            saveCache(key, data[key])
          }
        }
      }
    },
    () => {}
  )

  async function saveSettings(data) {
    await setDoc(doc(db, 'settings', 'general'), data, { merge: true })
  }

  function formatCurrency(amount) {
    const raw = refs.currency.value
    const match = raw.match(/\(([^)]+)\)/)
    const symbol = match ? match[1] : '$'
    return `${symbol}${Number(amount || 0).toLocaleString()}`
  }

  function currencySymbol() {
    const raw = refs.currency.value
    const match = raw.match(/\(([^)]+)\)/)
    return match ? match[1] : '$'
  }

  return { ...refs, saveSettings, formatCurrency, currencySymbol }
}
