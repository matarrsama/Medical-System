<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Notification Center</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">View and manage system notifications and alerts.</p>
      </div>
      <div class="flex gap-sm mt-2 sm:mt-0">
        <button v-if="unreadCount > 0" @click="markAllAsRead" :disabled="markingAll" class="text-label-md font-label-md text-primary hover:underline disabled:opacity-40">
          {{ markingAll ? 'Marking...' : 'Mark all as read' }}
        </button>
      </div>
    </div>
    <div v-if="!notifications.length" class="p-8 text-center text-on-surface-variant dark:text-outline">
      <span class="material-symbols-outlined text-[48px] block mb-2">notifications_off</span>
      <p class="text-body-md font-body-md">No notifications yet</p>
    </div>
    <div v-else class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden">
      <div v-for="note in notifications" :key="note.id" @click="markAsRead(note)" class="flex items-start gap-4 p-4 border-b border-outline-variant/30 dark:border-outline/30 last:border-0 hover:bg-surface-container-low dark:hover:bg-inverse-surface transition-colors cursor-pointer group" :class="!note.read ? 'bg-surface-container-low/50 dark:bg-inverse-surface/50' : ''">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="note.iconBg">
          <span class="material-symbols-outlined text-[20px]" :class="note.iconColor">{{ note.icon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-body-md font-medium text-on-surface dark:text-inverse-on-surface">{{ note.title }}</span>
              <span v-if="!note.read" class="ml-2 w-2 h-2 bg-primary rounded-full inline-block"></span>
            </div>
            <span class="text-label-sm text-on-surface-variant dark:text-outline shrink-0 whitespace-nowrap">{{ timeAgo(note.timestamp) }}</span>
          </div>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-1">{{ note.message }}</p>
        </div>
        <button @click.stop="deleteNotification(note)" class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-container-high dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline" title="Dismiss">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, where, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'
import { timeAgo } from '@/utils/timeAgo'

const auth = useAuthStore()
const notifications = ref([])
const cache = useFirestoreCache()
const cached = cache.load('notifications')
if (cached) notifications.value = cached
let unsubscribe = null
const markingAll = ref(false)

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

onMounted(() => {
  if (!auth.user?.email) return
  const q = query(collection(db, 'notifications'), where('email', '==', auth.user.email), orderBy('timestamp', 'desc'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    notifications.value = mapped
    cache.save('notifications', mapped)
  }, () => {})
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

async function markAsRead(note) {
  if (note.read) return
  try {
    await updateDoc(doc(db, 'notifications', note.id), { read: true })
  } catch {}
}

async function markAllAsRead() {
  if (markingAll.value) return
  markingAll.value = true
  try {
    const q = query(collection(db, 'notifications'), where('email', '==', auth.user?.email), where('read', '==', false))
    const snap = await getDocs(q)
    await Promise.allSettled(snap.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true })))
  } catch {}
  finally { markingAll.value = false }
}

async function deleteNotification(note) {
  try {
    await deleteDoc(doc(db, 'notifications', note.id))
  } catch {}
}
</script>
