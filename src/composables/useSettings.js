import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

export function useSettings() {
  const hospitalName = ref('Hospital ICT Service Management')
  const displayName = ref('ICT Admin Console')

  onSnapshot(doc(db, 'settings', 'general'),
    (snap) => {
      if (snap.exists()) {
        if (snap.data().hospitalName) hospitalName.value = snap.data().hospitalName
        if (snap.data().displayName) displayName.value = snap.data().displayName
      }
    },
    () => {}
  )

  async function saveSettings(data) {
    await setDoc(doc(db, 'settings', 'general'), data, { merge: true })
  }

  return { hospitalName, displayName, saveSettings }
}
