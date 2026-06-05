<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface dark:text-inverse-on-surface">Notification Center</h2>
        <p class="text-body-md font-body-md text-on-surface-variant dark:text-outline mt-1">View and manage system notifications and alerts.</p>
      </div>
      <button class="text-label-md font-label-md text-primary hover:underline">Mark all as read</button>
    </div>
    <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-sm overflow-hidden">
      <div v-for="note in notifications" :key="note.id" class="flex items-start gap-4 p-4 border-b border-outline-variant/30 dark:border-outline/30 last:border-0 hover:bg-surface-container-low dark:hover:bg-inverse-surface transition-colors cursor-pointer" :class="!note.read ? 'bg-surface-container-low/50 dark:bg-inverse-surface/50' : ''">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="note.iconBg">
          <span class="material-symbols-outlined text-[20px]" :class="note.iconColor">{{ note.icon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-body-md font-medium text-on-surface dark:text-inverse-on-surface">{{ note.title }}</span>
              <span v-if="!note.read" class="ml-2 w-2 h-2 bg-primary rounded-full inline-block"></span>
            </div>
            <span class="text-label-sm text-on-surface-variant dark:text-outline shrink-0">{{ note.time }}</span>
          </div>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-1">{{ note.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

const notifications = ref([])
const cache = useFirestoreCache()
const cached = cache.load('notifications')
if (cached) notifications.value = cached
let unsubscribe = null

onMounted(() => {
  const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    notifications.value = mapped
    cache.save('notifications', mapped)
  }, () => {})
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
