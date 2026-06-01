<template>
  <div class="flex flex-col items-center justify-center text-center py-xl">
    <span class="material-symbols-outlined text-[64px] text-outline mb-md">wifi_off</span>
    <h2 class="text-headline-md font-bold text-on-surface mb-xs">No Connection</h2>
    <p class="text-body-md text-on-surface-variant mb-2">You're offline — showing cached data from your last session.</p>
    <p class="text-body-sm text-on-surface-variant mb-md">Firestore data is stored locally. Pages will load with cached content and sync when reconnected.</p>
    <div class="flex gap-3">
      <button @click="retry" class="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-bold hover:bg-primary-container transition-colors">Try Again</button>
      <button @click="goBack" class="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-label-md font-bold hover:bg-surface-container-highest transition-colors">Go Back</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function retry() { router.go(0) }
function goBack() { router.back() }
</script>
